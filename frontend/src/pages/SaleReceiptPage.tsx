import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { formatDate, formatRwf } from "@/lib/utils";
import type { Sale } from "@/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function SaleReceiptPage() {
  const { id } = useParams();
  const { data: sale, isLoading } = useQuery({
    queryKey: ["sale", id],
    queryFn: () => api.get<Sale>(`/sales/${id}`),
  });

  if (isLoading) return <p className="text-slate-500">Loading receipt...</p>;
  if (!sale) return <p>Sale not found</p>;

  return (
    <div className="mx-auto max-w-lg space-y-4">
      <div className="no-print flex gap-2">
        <Button variant="outline" asChild><Link to="/sales">Back</Link></Button>
        <Button onClick={() => window.print()}>Print</Button>
      </div>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-orange-700">Built In Hardware</CardTitle>
          <p className="text-sm text-slate-500">Kigali, Rwanda — Sales Receipt</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between text-sm">
            <span>Sale #{sale.saleId}</span>
            <span>{formatDate(sale.saleDate)}</span>
          </div>
          <div className="text-sm text-slate-600 dark:text-slate-300">
            <p>Cashier: {sale.employeeName}</p>
            <p>Customer: {sale.customerName || "Walk-in"}</p>
            <p>Payment: {sale.paymentMethod || "CASH"}</p>
            {sale.refunded && <Badge variant="destructive">REFUNDED</Badge>}
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left">
                <th className="pb-2">Item</th>
                <th className="pb-2">Qty</th>
                <th className="pb-2 text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {sale.lines.map((l) => (
                <tr key={l.productId} className="border-b">
                  <td className="py-2">{l.productName}</td>
                  <td className="py-2">{l.quantity}</td>
                  <td className="py-2 text-right">{formatRwf(l.lineTotal)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="flex justify-between border-t pt-4 text-lg font-bold">
            <span>Total</span>
            <span>{formatRwf(sale.totalAmount)}</span>
          </div>
          <p className="text-center text-xs text-slate-400">Thank you for your business!</p>
        </CardContent>
      </Card>
    </div>
  );
}
