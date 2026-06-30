import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { api } from "@/lib/api";
import { formatRwf } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type ReportTab = "daily" | "monthly" | "inventory" | "transactions";

interface DailyData { date: string; saleCount: number; totalRevenue: number; sales: SaleRow[] }
interface MonthlyData { year: number; month: number; saleCount: number; totalRevenue: number; sales: SaleRow[] }
interface SaleRow { saleId: number; saleDate: string; employeeName: string; customerName: string; totalAmount: number; refunded: boolean }
interface InventoryData { totalProducts: number; lowStockCount: number; totalValuation: number; items: InvRow[]; lowStockItems: InvRow[] }
interface InvRow { productName: string; category: string; quantityInStock: number; reorderLevel: number; valuation: number; lowStock: boolean }
interface TransactionData { from: string; to: string; transactionCount: number; totalSales: number; totalRefunds: number; netTotal: number; transactions: TxRow[] }
interface TxRow { transactionId: number; transactionDate: string; transactionType: string; saleId?: number; amount: number }

export default function ReportsPage() {
  const [tab, setTab] = useState<ReportTab>("daily");
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [month, setMonth] = useState(String(new Date().getMonth() + 1));
  const [year, setYear] = useState(String(new Date().getFullYear()));
  const [from, setFrom] = useState(format(new Date(new Date().setDate(new Date().getDate() - 30)), "yyyy-MM-dd"));
  const [to, setTo] = useState(format(new Date(), "yyyy-MM-dd"));

  const daily = useQuery<DailyData>({
    queryKey: ["report-daily", date],
    queryFn: () => api.get<DailyData>(`/reports/daily?date=${date}`),
    enabled: tab === "daily",
  });

  const monthly = useQuery<MonthlyData>({
    queryKey: ["report-monthly", month, year],
    queryFn: () => api.get<MonthlyData>(`/reports/monthly?month=${month}&year=${year}`),
    enabled: tab === "monthly",
  });

  const inventory = useQuery<InventoryData>({
    queryKey: ["report-inventory"],
    queryFn: () => api.get<InventoryData>("/reports/inventory"),
    enabled: tab === "inventory",
  });

  const transactions = useQuery<TransactionData>({
    queryKey: ["report-transactions", from, to],
    queryFn: () => api.get<TransactionData>(`/reports/transactions?from=${from}&to=${to}`),
    enabled: tab === "transactions",
  });

  const exportReport = (format: "csv" | "pdf") => {
    const params = new URLSearchParams();
    if (tab === "daily") params.set("date", date);
    if (tab === "monthly") { params.set("month", month); params.set("year", year); }
    if (tab === "transactions") { params.set("from", from); params.set("to", to); }
    api.download(`/reports/${tab}/export/${format}?${params}`, `${tab}-report.${format}`);
  };

  const tabs: { id: ReportTab; label: string }[] = [
    { id: "daily", label: "Daily Sales" },
    { id: "monthly", label: "Monthly Sales" },
    { id: "inventory", label: "Inventory" },
    { id: "transactions", label: "Transactions" },
  ];

  return (
    <div className="space-y-6 print:space-y-4">
      <div className="no-print flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Reports</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => exportReport("csv")}>Export CSV</Button>
          <Button variant="outline" onClick={() => exportReport("pdf")}>Export PDF</Button>
          <Button onClick={() => window.print()}>Print</Button>
        </div>
      </div>

      <div className="no-print flex flex-wrap gap-2">
        {tabs.map((t) => (
          <Button key={t.id} variant={tab === t.id ? "default" : "outline"} onClick={() => setTab(t.id)}>
            {t.label}
          </Button>
        ))}
      </div>

      {tab === "daily" && (
        <div className="no-print space-y-4">
          <div><Label>Date</Label><Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="max-w-xs" /></div>
        </div>
      )}
      {tab === "monthly" && (
        <div className="no-print flex gap-4">
          <div><Label>Month</Label><Input type="number" min={1} max={12} value={month} onChange={(e) => setMonth(e.target.value)} className="w-24" /></div>
          <div><Label>Year</Label><Input type="number" value={year} onChange={(e) => setYear(e.target.value)} className="w-28" /></div>
        </div>
      )}
      {tab === "transactions" && (
        <div className="no-print flex gap-4">
          <div><Label>From</Label><Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} /></div>
          <div><Label>To</Label><Input type="date" value={to} onChange={(e) => setTo(e.target.value)} /></div>
        </div>
      )}

      {tab === "daily" && daily.data && <DailyReportView data={daily.data} />}
      {tab === "monthly" && monthly.data && <MonthlyReportView data={monthly.data} />}
      {tab === "inventory" && inventory.data && <InventoryReportView data={inventory.data} />}
      {tab === "transactions" && transactions.data && <TransactionReportView data={transactions.data} />}
    </div>
  );
}

function DailyReportView({ data }: { data: DailyData }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Daily Sales — {data.date}</CardTitle>
        <p className="text-sm text-slate-500">{data.saleCount} sales · {formatRwf(data.totalRevenue)} revenue</p>
      </CardHeader>
      <CardContent><SalesTable sales={data.sales} /></CardContent>
    </Card>
  );
}

function MonthlyReportView({ data }: { data: MonthlyData }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Monthly Sales — {data.year}-{String(data.month).padStart(2, "0")}</CardTitle>
        <p className="text-sm text-slate-500">{data.saleCount} sales · {formatRwf(data.totalRevenue)} revenue</p>
      </CardHeader>
      <CardContent><SalesTable sales={data.sales} showDate /></CardContent>
    </Card>
  );
}

function InventoryReportView({ data }: { data: InventoryData }) {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Inventory Summary</CardTitle>
          <p className="text-sm text-slate-500">
            {data.totalProducts} products · {data.lowStockCount} low stock · Valuation {formatRwf(data.totalValuation)}
          </p>
        </CardHeader>
      </Card>
      <Card>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-slate-50 text-left text-slate-500">
                <th className="p-3">Product</th><th className="p-3">Category</th><th className="p-3">Qty</th><th className="p-3">Reorder</th><th className="p-3">Valuation</th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((i, idx) => (
                <tr key={idx} className={i.lowStock ? "bg-red-50 border-b" : "border-b"}>
                  <td className="p-3">{i.productName}</td>
                  <td className="p-3">{i.category}</td>
                  <td className="p-3">{i.quantityInStock}</td>
                  <td className="p-3">{i.reorderLevel}</td>
                  <td className="p-3">{formatRwf(i.valuation)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}

function TransactionReportView({ data }: { data: TransactionData }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Transactions — {data.from} to {data.to}</CardTitle>
        <p className="text-sm text-slate-500">
          Sales {formatRwf(data.totalSales)} · Refunds {formatRwf(data.totalRefunds)} · Net {formatRwf(data.netTotal)}
        </p>
      </CardHeader>
      <CardContent className="p-0">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-slate-50 text-left text-slate-500">
              <th className="p-3">ID</th><th className="p-3">Date</th><th className="p-3">Type</th><th className="p-3">Sale</th><th className="p-3">Amount</th>
            </tr>
          </thead>
          <tbody>
            {data.transactions.map((t) => (
              <tr key={t.transactionId} className="border-b">
                <td className="p-3">{t.transactionId}</td>
                <td className="p-3">{t.transactionDate}</td>
                <td className="p-3">{t.transactionType}</td>
                <td className="p-3">{t.saleId ?? "—"}</td>
                <td className="p-3">{formatRwf(t.amount)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}

function SalesTable({ sales, showDate }: { sales: SaleRow[]; showDate?: boolean }) {
  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="border-b text-left text-slate-500">
          <th className="pb-2">ID</th>
          {showDate && <th className="pb-2">Date</th>}
          <th className="pb-2">Employee</th>
          <th className="pb-2">Customer</th>
          <th className="pb-2">Amount</th>
          <th className="pb-2">Refunded</th>
        </tr>
      </thead>
      <tbody>
        {sales.length === 0 ? (
          <tr><td colSpan={6} className="py-4 text-center text-slate-500">No sales for this period</td></tr>
        ) : sales.map((s) => (
          <tr key={s.saleId} className="border-b">
            <td className="py-2">#{s.saleId}</td>
            {showDate && <td className="py-2">{s.saleDate}</td>}
            <td className="py-2">{s.employeeName}</td>
            <td className="py-2">{s.customerName}</td>
            <td className="py-2">{formatRwf(s.totalAmount)}</td>
            <td className="py-2">{s.refunded ? "Yes" : "No"}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
