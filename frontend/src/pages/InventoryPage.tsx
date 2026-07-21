import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api, ApiClientError } from "@/lib/api";
import { formatRwf } from "@/lib/utils";
import type { InventoryItem, Product } from "@/types";
import { useAuth } from "@/hooks/useAuth";
import { can } from "@/lib/permissions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function InventoryPage() {
  const { user } = useAuth();
  const canManageProducts = can(user, "manageProducts");
  const canAdjust = can(user, "adjustInventory");
  const canStockIn = can(user, "stockIn");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [showStockIn, setShowStockIn] = useState(false);
  const qc = useQueryClient();

  const { data: inventory = [], isLoading } = useQuery({
    queryKey: ["inventory"],
    queryFn: () => api.get<InventoryItem[]>("/inventory"),
  });

  const categories = [...new Set(inventory.map((i) => i.category))].sort();

  const filtered = inventory.filter((item) => {
    const matchSearch = !search || item.productName.toLowerCase().includes(search.toLowerCase());
    const matchCat = !category || item.category === category;
    return matchSearch && matchCat;
  });

  const updateStock = useMutation({
    mutationFn: ({ productId, qty, reorder }: { productId: number; qty: number; reorder?: number }) =>
      api.put(`/inventory/${productId}`, { quantityInStock: qty, reorderLevel: reorder }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["inventory"] });
      toast.success("Stock updated");
    },
    onError: (e) => toast.error(e instanceof ApiClientError ? e.message : "Update failed"),
  });

  const stockIn = useMutation({
    mutationFn: (data: { productId: number; quantity: number; notes?: string }) =>
      api.post("/inventory/stock-in", data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["inventory"] });
      qc.invalidateQueries({ queryKey: ["products"] });
      setShowStockIn(false);
      toast.success("Stock received");
    },
    onError: (e) => toast.error(e instanceof ApiClientError ? e.message : "Stock-in failed"),
  });

  if (isLoading) return <p className="text-slate-500">Loading inventory...</p>;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Inventory</h1>
        <div className="flex gap-2">
          {canStockIn && (
            <Button variant="outline" onClick={() => setShowStockIn(!showStockIn)}>
              {showStockIn ? "Cancel" : "Stock In"}
            </Button>
          )}
          {canManageProducts && (
            <Button onClick={() => setShowForm(!showForm)}>
              {showForm ? "Cancel" : "New Product"}
            </Button>
          )}
        </div>
      </div>

      {showStockIn && canStockIn && (
        <StockInForm
          inventory={inventory}
          onSave={(data) => stockIn.mutate(data)}
          loading={stockIn.isPending}
        />
      )}

      {showForm && canManageProducts && <NewProductForm onSuccess={() => { setShowForm(false); qc.invalidateQueries({ queryKey: ["inventory"] }); qc.invalidateQueries({ queryKey: ["products"] }); }} />}

      <div className="flex flex-wrap gap-3">
        <Input placeholder="Search products..." value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-xs" />
        <select value={category} onChange={(e) => setCategory(e.target.value)} className="h-10 rounded-md border border-slate-300 px-3 text-sm">
          <option value="">All categories</option>
          {categories.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-slate-50 text-left text-slate-500">
                  <th className="p-3">SKU</th>
                  <th className="p-3">Product</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Unit Price</th>
                  <th className="p-3">In Stock</th>
                  <th className="p-3">Reorder</th>
                  <th className="p-3">Status</th>
                  {canAdjust && <th className="p-3">Actions</th>}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={8} className="p-8 text-center text-slate-500">No products found</td></tr>
                ) : filtered.map((item) => (
                  <tr key={item.inventoryId} className={item.lowStock ? "bg-red-50" : "border-b"}>
                    <td className="p-3 font-mono text-xs">{item.sku || "—"}</td>
                    <td className="p-3 font-medium">{item.productName}</td>
                    <td className="p-3">{item.category}</td>
                    <td className="p-3">{formatRwf(item.unitPrice)}</td>
                    <td className="p-3">{item.quantityInStock}</td>
                    <td className="p-3">{item.reorderLevel}</td>
                    <td className="p-3">
                      {item.lowStock ? <Badge variant="destructive">Low Stock</Badge> : <Badge variant="secondary">OK</Badge>}
                    </td>
                    {canAdjust && (
                      <td className="p-3">
                        <StockAdjust item={item} onSave={(qty, reorder) => updateStock.mutate({ productId: item.productId, qty, reorder })} />
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function StockInForm({
  inventory,
  onSave,
  loading,
}: {
  inventory: InventoryItem[];
  onSave: (data: { productId: number; quantity: number; notes?: string }) => void;
  loading: boolean;
}) {
  const [productId, setProductId] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [notes, setNotes] = useState("");

  return (
    <Card>
      <CardHeader><CardTitle>Stock In (supplier delivery)</CardTitle></CardHeader>
      <CardContent>
        <form
          className="grid gap-4 md:grid-cols-2"
          onSubmit={(e) => {
            e.preventDefault();
            onSave({
              productId: parseInt(productId),
              quantity: parseInt(quantity),
              notes: notes || undefined,
            });
          }}
        >
          <div className="md:col-span-2">
            <Label>Product</Label>
            <select required value={productId} onChange={(e) => setProductId(e.target.value)} className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm dark:border-slate-700 dark:bg-slate-950">
              <option value="">Select product</option>
              {inventory.map((i) => (
                <option key={i.productId} value={i.productId}>
                  {i.sku ? `[${i.sku}] ` : ""}{i.productName} (now {i.quantityInStock})
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label>Quantity received</Label>
            <Input type="number" min={1} value={quantity} onChange={(e) => setQuantity(e.target.value)} required />
          </div>
          <div>
            <Label>Notes (supplier / invoice)</Label>
            <Input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="e.g. Delivery #442" />
          </div>
          <div className="md:col-span-2">
            <Button type="submit" disabled={loading || !productId}>{loading ? "Saving..." : "Receive stock"}</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

function StockAdjust({ item, onSave }: { item: InventoryItem; onSave: (qty: number, reorder?: number) => void }) {
  const [qty, setQty] = useState(String(item.quantityInStock));
  const [reorder, setReorder] = useState(String(item.reorderLevel));
  return (
    <div className="flex items-center gap-2">
      <Input type="number" value={qty} onChange={(e) => setQty(e.target.value)} className="w-20" min={0} />
      <Input type="number" value={reorder} onChange={(e) => setReorder(e.target.value)} className="w-20" min={0} />
      <Button size="sm" variant="outline" onClick={() => onSave(parseInt(qty), parseInt(reorder))}>Save</Button>
    </div>
  );
}

function NewProductForm({ onSuccess }: { onSuccess: () => void }) {
  const [form, setForm] = useState({ productName: "", description: "", category: "", sku: "", unitPrice: "", initialStock: "0", reorderLevel: "10" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post<Product>("/products", {
        productName: form.productName,
        description: form.description,
        category: form.category,
        sku: form.sku || undefined,
        unitPrice: parseFloat(form.unitPrice),
        initialStock: parseInt(form.initialStock),
        reorderLevel: parseInt(form.reorderLevel),
      });
      toast.success("Product created");
      onSuccess();
    } catch (err) {
      toast.error(err instanceof ApiClientError ? err.message : "Failed to create product");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader><CardTitle>New Product</CardTitle></CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
          <div><Label>Product Name</Label><Input value={form.productName} onChange={(e) => setForm({ ...form, productName: e.target.value })} required /></div>
          <div><Label>SKU / Barcode</Label><Input value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} placeholder="BI-0017" /></div>
          <div><Label>Category</Label><Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} required /></div>
          <div><Label>Unit Price (RWF)</Label><Input type="number" value={form.unitPrice} onChange={(e) => setForm({ ...form, unitPrice: e.target.value })} required min={1} /></div>
          <div><Label>Initial Stock</Label><Input type="number" value={form.initialStock} onChange={(e) => setForm({ ...form, initialStock: e.target.value })} min={0} /></div>
          <div><Label>Reorder Level</Label><Input type="number" value={form.reorderLevel} onChange={(e) => setForm({ ...form, reorderLevel: e.target.value })} min={0} /></div>
          <div className="md:col-span-2"><Label>Description</Label><Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
          <div className="md:col-span-2"><Button type="submit" disabled={loading}>{loading ? "Creating..." : "Create Product"}</Button></div>
        </form>
      </CardContent>
    </Card>
  );
}
