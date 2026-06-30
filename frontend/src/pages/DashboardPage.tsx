import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { api } from "@/lib/api";
import { formatRwf } from "@/lib/utils";
import type { DashboardReport } from "@/types";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function DashboardPage() {
  const { user } = useAuth();
  const { data, isLoading } = useQuery({
    queryKey: ["dashboard"],
    queryFn: () => api.get<DashboardReport>("/reports/dashboard"),
  });

  if (isLoading) return <p className="text-slate-500">Loading dashboard...</p>;

  const isAdmin = user?.userType === "ADMIN";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-slate-500">Welcome back, {user?.displayName}</p>
        </div>
        {!isAdmin && (
          <Button asChild>
            <Link to="/sales/new">New Sale</Link>
          </Button>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KpiCard title="Sales Today" value={String(data?.salesCountToday ?? 0)} subtitle={formatRwf(data?.salesToday ?? 0)} />
        <KpiCard title="Revenue Today" value={formatRwf(data?.revenueToday ?? 0)} />
        {isAdmin && (
          <KpiCard title="Sales This Month" value={String(data?.salesCountThisMonth ?? 0)} subtitle={formatRwf(data?.salesThisMonth ?? 0)} />
        )}
        <KpiCard
          title="Low Stock Items"
          value={String(data?.lowStockCount ?? 0)}
          alert={(data?.lowStockCount ?? 0) > 0}
        />
      </div>

      {isAdmin && data?.topProducts && data.topProducts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Top Products This Month</CardTitle>
          </CardHeader>
          <CardContent>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-slate-500">
                  <th className="pb-2">Product</th>
                  <th className="pb-2">Qty Sold</th>
                  <th className="pb-2">Revenue</th>
                </tr>
              </thead>
              <tbody>
                {data.topProducts.map((p) => (
                  <tr key={p.productId} className="border-b">
                    <td className="py-2">{p.productName}</td>
                    <td className="py-2">{p.quantitySold}</td>
                    <td className="py-2">{formatRwf(p.revenue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}

      {(data?.lowStockCount ?? 0) > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="flex items-center justify-between p-4">
            <p className="text-sm text-orange-800">
              {data?.lowStockCount} product(s) at or below reorder level
            </p>
            <Button variant="outline" size="sm" asChild>
              <Link to="/inventory">View Inventory</Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function KpiCard({ title, value, subtitle, alert }: { title: string; value: string; subtitle?: string; alert?: boolean }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-slate-500">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold">{value}</span>
          {alert && <Badge variant="destructive">Alert</Badge>}
        </div>
        {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
      </CardContent>
    </Card>
  );
}
