import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { api, ApiClientError } from "@/lib/api";
import { formatRwf } from "@/lib/utils";
import type { Customer, Product, Sale } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface LineItem {
  productId: number;
  productName: string;
  quantity: number;
  unitPrice: number;
  maxStock: number;
}

export default function NewSalePage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [customerId, setCustomerId] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState("CASH");
  const [lines, setLines] = useState<LineItem[]>([]);
  const [selectedProduct, setSelectedProduct] = useState("");
  const [qty, setQty] = useState("1");

  const { data: products = [] } = useQuery({
    queryKey: ["products"],
    queryFn: () => api.get<Product[]>("/products"),
  });

  const { data: customers = [] } = useQuery({
    queryKey: ["customers"],
    queryFn: () => api.get<Customer[]>("/customers"),
  });

  const total = lines.reduce((sum, l) => sum + l.unitPrice * l.quantity, 0);

  const addLine = () => {
    const product = products.find((p) => p.productId === parseInt(selectedProduct));
    if (!product) return;
    const quantity = parseInt(qty);
    if (quantity < 1) { toast.error("Quantity must be at least 1"); return; }
    if ((product.quantityInStock ?? 0) < quantity) {
      toast.error(`Only ${product.quantityInStock} in stock`);
      return;
    }
    const existing = lines.find((l) => l.productId === product.productId);
    if (existing) {
      setLines(lines.map((l) => l.productId === product.productId ? { ...l, quantity: l.quantity + quantity } : l));
    } else {
      setLines([...lines, {
        productId: product.productId,
        productName: product.productName,
        quantity,
        unitPrice: product.unitPrice,
        maxStock: product.quantityInStock ?? 0,
      }]);
    }
    setQty("1");
  };

  const createSale = useMutation({
    mutationFn: () => api.post<Sale>("/sales", {
      customerId: customerId ? parseInt(customerId) : null,
      paymentMethod,
      lines: lines.map((l) => ({ productId: l.productId, quantity: l.quantity })),
    }),
    onSuccess: (sale) => {
      qc.invalidateQueries({ queryKey: ["inventory"] });
      qc.invalidateQueries({ queryKey: ["sales"] });
      toast.success("Sale completed");
      navigate(`/sales/${sale.saleId}`);
    },
    onError: (e) => toast.error(e instanceof ApiClientError ? e.message : "Sale failed"),
  });

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <h1 className="text-2xl font-bold">New Sale</h1>

      <Card>
        <CardHeader><CardTitle>Customer (optional)</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <select value={customerId} onChange={(e) => setCustomerId(e.target.value)} className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm dark:border-slate-700 dark:bg-slate-950">
            <option value="">Walk-in customer</option>
            {customers.map((c) => <option key={c.customerId} value={c.customerId}>{c.customerName}</option>)}
          </select>
          <div>
            <Label>Payment method</Label>
            <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} className="mt-1 h-10 w-full rounded-md border border-slate-300 px-3 text-sm dark:border-slate-700 dark:bg-slate-950">
              <option value="CASH">Cash</option>
              <option value="MOMO">Mobile Money (MoMo)</option>
              <option value="BANK">Bank transfer</option>
            </select>
          </div>
          <Button variant="link" className="mt-2 px-0" asChild>
            <Link to="/customers">Manage customers</Link>
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Add Items</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-3">
            <div className="flex-1">
              <Label>Product</Label>
              <select value={selectedProduct} onChange={(e) => setSelectedProduct(e.target.value)} className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm">
                <option value="">Select product</option>
                {products.map((p) => (
                  <option key={p.productId} value={p.productId}>
                    {p.sku ? `[${p.sku}] ` : ""}{p.productName} — {formatRwf(p.unitPrice)} (stock: {p.quantityInStock ?? 0})
                  </option>
                ))}
              </select>
            </div>
            <div className="w-24">
              <Label>Qty</Label>
              <Input type="number" min={1} value={qty} onChange={(e) => setQty(e.target.value)} />
            </div>
            <div className="flex items-end">
              <Button type="button" onClick={addLine}>Add</Button>
            </div>
          </div>

          {lines.length > 0 && (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-slate-500">
                  <th className="pb-2">Product</th>
                  <th className="pb-2">Qty</th>
                  <th className="pb-2">Price</th>
                  <th className="pb-2">Total</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {lines.map((l) => (
                  <tr key={l.productId} className="border-b">
                    <td className="py-2">{l.productName}</td>
                    <td className="py-2">{l.quantity}</td>
                    <td className="py-2">{formatRwf(l.unitPrice)}</td>
                    <td className="py-2">{formatRwf(l.unitPrice * l.quantity)}</td>
                    <td className="py-2">
                      <Button variant="ghost" size="sm" onClick={() => setLines(lines.filter((x) => x.productId !== l.productId))}>Remove</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          <div className="flex items-center justify-between border-t pt-4">
            <span className="text-lg font-bold">Total: {formatRwf(total)}</span>
            <Button disabled={lines.length === 0 || createSale.isPending} onClick={() => createSale.mutate()}>
              {createSale.isPending ? "Processing..." : "Complete Sale"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
