import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { api, ApiClientError } from "@/lib/api";
import { formatDate, formatRwf } from "@/lib/utils";
import type { Sale } from "@/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export default function SalesListPage() {
  const qc = useQueryClient();
  const { data: sales = [], isLoading } = useQuery({
    queryKey: ["sales"],
    queryFn: () => api.get<Sale[]>("/sales"),
  });

  const refund = useMutation({
    mutationFn: (id: number) => api.post<Sale>(`/sales/${id}/refund`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["sales"] });
      qc.invalidateQueries({ queryKey: ["inventory"] });
      toast.success("Sale refunded");
    },
    onError: (e) => toast.error(e instanceof ApiClientError ? e.message : "Refund failed"),
  });

  if (isLoading) return <p className="text-slate-500">Loading sales...</p>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Sales</h1>
        <Button asChild><Link to="/sales/new">New Sale</Link></Button>
      </div>
      <Card>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-slate-50 text-left text-slate-500">
                <th className="p-3">ID</th>
                <th className="p-3">Date</th>
                <th className="p-3">Employee</th>
                <th className="p-3">Customer</th>
                <th className="p-3">Amount</th>
                <th className="p-3">Status</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sales.length === 0 ? (
                <tr><td colSpan={7} className="p-8 text-center text-slate-500">No sales yet</td></tr>
              ) : sales.map((s) => (
                <tr key={s.saleId} className="border-b">
                  <td className="p-3">#{s.saleId}</td>
                  <td className="p-3">{formatDate(s.saleDate)}</td>
                  <td className="p-3">{s.employeeName}</td>
                  <td className="p-3">{s.customerName || "Walk-in"}</td>
                  <td className="p-3">{formatRwf(s.totalAmount)}</td>
                  <td className="p-3">{s.refunded ? <Badge variant="destructive">Refunded</Badge> : <Badge>Completed</Badge>}</td>
                  <td className="p-3 space-x-2">
                    <Button variant="outline" size="sm" asChild><Link href={`/sales/${s.saleId}`}>Receipt</Link></Button>
                    {!s.refunded && (
                      <Button variant="destructive" size="sm" onClick={() => { if (confirm("Refund this sale?")) refund.mutate(s.saleId); }}>
                        Refund
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
