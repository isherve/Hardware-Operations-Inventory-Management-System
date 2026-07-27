import { useState } from "react";
import { useNavigate } from "react-router-dom";
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
import { ProductScanner } from "@/components/ProductScanner";
import { productScanCode } from "@/components/ProductCodes";

export default function InventoryPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const canManageProducts = can(user, "manageProducts");
  const canAdjust = can(user, "adjustInventory");
  const canStockIn = can(user, "stockIn");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [showStockIn, setShowStockIn] = useState(false);
  const [showScan, setShowScan] = useState(true);
  const qc = useQueryClient();

  const openProductCard = (product: Product) => {
    navigate(`/p/${encodeURIComponent(productScanCode(product))}`);
  };

  const { data: inventory = [], isLoading } = useQuery({
    queryKey: ["inventory"],
    queryFn: () => api.get<InventoryItem[]>("/inventory"),
  });

  const categories = [...new Set(inventory.map((i) => i.category))].sort();

  const filtered = inventory.filter((item) => {
    const q = search.toLowerCase();
    const matchSearch =
      !search ||
      item.productName.toLowerCase().includes(q) ||
      (item.sku || "").toLowerCase().includes(q) ||
      (item.brand || "").toLowerCase().includes(q) ||
      (item.manufacturerCode || "").toLowerCase().includes(q) ||
      (item.shelfLocation || "").toLowerCase().includes(q);
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

  const toProduct = (item: InventoryItem): Product => ({
    productId: item.productId,
    productName: item.productName,
    description: item.description,
    category: item.category,
    sku: item.sku,
    brand: item.brand,
    unit: item.unit,
    shelfLocation: item.shelfLocation,
    manufacturerCode: item.manufacturerCode,
    unitPrice: item.unitPrice,
    quantityInStock: item.quantityInStock,
    reorderLevel: item.reorderLevel,
    lowStock: item.lowStock,
  });

  if (isLoading) return <p className="text-slate-500">Loading inventory...</p>;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Inventory</h1>
        <div className="flex flex-wrap gap-2">
          <Button variant={showScan ? "default" : "outline"} onClick={() => setShowScan(!showScan)}>
            {showScan ? "Hide scanner" : "Scan product"}
          </Button>
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

      {showScan && (
        <Card>
          <CardHeader>
            <CardTitle>Scan barcode / QR</CardTitle>
          </CardHeader>
          <CardContent>
            <ProductScanner
              onProduct={openProductCard}
              placeholder="Scan to open product card (e.g. BI-0012)"
            />
          </CardContent>
        </Card>
      )}

      {showStockIn && canStockIn && (
        <StockInForm
          inventory={inventory}
          onSave={(data) => stockIn.mutate(data)}
          loading={stockIn.isPending}
        />
      )}

      {showForm && canManageProducts && (
        <NewProductForm
          onSuccess={() => {
            setShowForm(false);
            qc.invalidateQueries({ queryKey: ["inventory"] });
            qc.invalidateQueries({ queryKey: ["products"] });
          }}
        />
      )}

      <div className="flex flex-wrap gap-3">
        <Input
          placeholder="Search name, SKU, brand, shelf..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs"
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="h-10 rounded-md border border-slate-300 px-3 text-sm dark:border-slate-700 dark:bg-slate-950"
        >
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-slate-50 text-left text-slate-500 dark:bg-slate-900">
                  <th className="p-3">SKU</th>
                  <th className="p-3">Product</th>
                  <th className="p-3">Brand / Unit</th>
                  <th className="p-3">Shelf</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Unit Price</th>
                  <th className="p-3">In Stock</th>
                  <th className="p-3">Reorder</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Codes</th>
                  {canAdjust && <th className="p-3">Actions</th>}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={canAdjust ? 11 : 10} className="p-8 text-center text-slate-500">
                      No products found
                    </td>
                  </tr>
                ) : (
                  filtered.map((item) => (
                    <tr key={item.inventoryId} className={item.lowStock ? "bg-red-50 dark:bg-red-950/30" : "border-b"}>
                      <td className="p-3 font-mono text-xs">{item.sku || "—"}</td>
                      <td className="p-3 font-medium">{item.productName}</td>
                      <td className="p-3 text-xs">
                        {item.brand || "—"}
                        <span className="text-slate-400"> · </span>
                        {item.unit || "PCS"}
                      </td>
                      <td className="p-3 font-mono text-xs">{item.shelfLocation || "—"}</td>
                      <td className="p-3">{item.category}</td>
                      <td className="p-3">{formatRwf(item.unitPrice)}</td>
                      <td className="p-3">{item.quantityInStock}</td>
                      <td className="p-3">{item.reorderLevel}</td>
                      <td className="p-3">
                        {item.lowStock ? (
                          <Badge variant="destructive">Low Stock</Badge>
                        ) : (
                          <Badge variant="secondary">OK</Badge>
                        )}
                      </td>
                      <td className="p-3">
                        <Button size="sm" variant="outline" onClick={() => openProductCard(toProduct(item))}>
                          View
                        </Button>
                      </td>
                      {canAdjust && (
                        <td className="p-3">
                          <StockAdjust
                            item={item}
                            onSave={(qty, reorder) =>
                              updateStock.mutate({ productId: item.productId, qty, reorder })
                            }
                          />
                        </td>
                      )}
                    </tr>
                  ))
                )}
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
      <CardHeader>
        <CardTitle>Stock In (supplier delivery)</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <ProductScanner
          onProduct={(p) => setProductId(String(p.productId))}
          placeholder="Scan product to stock in"
        />
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
            <select
              required
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
              className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm dark:border-slate-700 dark:bg-slate-950"
            >
              <option value="">Select product</option>
              {inventory.map((i) => (
                <option key={i.productId} value={i.productId}>
                  {i.sku ? `[${i.sku}] ` : ""}
                  {i.productName} (now {i.quantityInStock})
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
            <Button type="submit" disabled={loading || !productId}>
              {loading ? "Saving..." : "Receive stock"}
            </Button>
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
      <Button size="sm" variant="outline" onClick={() => onSave(parseInt(qty), parseInt(reorder))}>
        Save
      </Button>
    </div>
  );
}

function NewProductForm({ onSuccess }: { onSuccess: () => void }) {
  const [form, setForm] = useState({
    productName: "",
    description: "",
    category: "",
    sku: "",
    brand: "",
    unit: "PCS",
    shelfLocation: "",
    manufacturerCode: "",
    unitPrice: "",
    initialStock: "0",
    reorderLevel: "10",
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post<Product>("/products", {
        productName: form.productName,
        description: form.description || undefined,
        category: form.category,
        sku: form.sku || undefined,
        brand: form.brand || undefined,
        unit: form.unit || "PCS",
        shelfLocation: form.shelfLocation || undefined,
        manufacturerCode: form.manufacturerCode || undefined,
        unitPrice: parseFloat(form.unitPrice),
        initialStock: parseInt(form.initialStock),
        reorderLevel: parseInt(form.reorderLevel),
      });
      toast.success("Product created with barcode/QR code");
      onSuccess();
    } catch (err) {
      toast.error(err instanceof ApiClientError ? err.message : "Failed to create product");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>New Product</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
          <div>
            <Label>Product Name</Label>
            <Input value={form.productName} onChange={(e) => setForm({ ...form, productName: e.target.value })} required />
          </div>
          <div>
            <Label>SKU / Barcode (auto BI-#### if empty)</Label>
            <Input
              value={form.sku}
              onChange={(e) => setForm({ ...form, sku: e.target.value })}
              placeholder="BI-0017"
              className="font-mono"
            />
          </div>
          <div>
            <Label>Brand</Label>
            <Input value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} placeholder="e.g. Dulux" />
          </div>
          <div>
            <Label>Unit</Label>
            <select
              value={form.unit}
              onChange={(e) => setForm({ ...form, unit: e.target.value })}
              className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm dark:border-slate-700 dark:bg-slate-950"
            >
              <option value="PCS">PCS (pieces)</option>
              <option value="M">M (meters)</option>
              <option value="L">L (liters)</option>
              <option value="KG">KG</option>
              <option value="BAG">BAG</option>
              <option value="BOX">BOX</option>
            </select>
          </div>
          <div>
            <Label>Shelf / bin location</Label>
            <Input
              value={form.shelfLocation}
              onChange={(e) => setForm({ ...form, shelfLocation: e.target.value })}
              placeholder="A-12"
            />
          </div>
          <div>
            <Label>Manufacturer code (EAN/UPC optional)</Label>
            <Input
              value={form.manufacturerCode}
              onChange={(e) => setForm({ ...form, manufacturerCode: e.target.value })}
              className="font-mono"
              placeholder="Optional supplier barcode"
            />
          </div>
          <div>
            <Label>Category</Label>
            <Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} required />
          </div>
          <div>
            <Label>Unit Price (RWF)</Label>
            <Input
              type="number"
              value={form.unitPrice}
              onChange={(e) => setForm({ ...form, unitPrice: e.target.value })}
              required
              min={1}
            />
          </div>
          <div>
            <Label>Initial Stock</Label>
            <Input
              type="number"
              value={form.initialStock}
              onChange={(e) => setForm({ ...form, initialStock: e.target.value })}
              min={0}
            />
          </div>
          <div>
            <Label>Reorder Level</Label>
            <Input
              type="number"
              value={form.reorderLevel}
              onChange={(e) => setForm({ ...form, reorderLevel: e.target.value })}
              min={0}
            />
          </div>
          <div className="md:col-span-2">
            <Label>Description</Label>
            <Input
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Full product description shown after scan"
            />
          </div>
          <div className="md:col-span-2">
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create Product"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
