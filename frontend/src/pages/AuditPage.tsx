import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { AuditLogEntry } from "@/types";
import { Card, CardContent } from "@/components/ui/card";

export default function AuditPage() {
  const { data: logs = [], isLoading } = useQuery({
    queryKey: ["audit"],
    queryFn: () => api.get<AuditLogEntry[]>("/audit"),
  });

  if (isLoading) return <p className="text-slate-500">Loading audit log...</p>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Audit log</h1>
        <p className="text-sm text-slate-500">Recent important actions (Admin & Manager)</p>
      </div>
      <Card>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-slate-50 text-left text-slate-500 dark:bg-slate-900 dark:text-slate-400">
                <th className="p-3">When</th>
                <th className="p-3">User</th>
                <th className="p-3">Action</th>
                <th className="p-3">Details</th>
              </tr>
            </thead>
            <tbody>
              {logs.length === 0 ? (
                <tr><td colSpan={4} className="p-8 text-center text-slate-500">No audit entries yet</td></tr>
              ) : logs.map((log) => (
                <tr key={log.auditId} className="border-b">
                  <td className="p-3 whitespace-nowrap">{new Date(log.createdAt).toLocaleString()}</td>
                  <td className="p-3">{log.actorUsername || "—"} <span className="text-xs text-slate-400">({log.actorRole})</span></td>
                  <td className="p-3 font-medium">{log.action}</td>
                  <td className="p-3 text-slate-600 dark:text-slate-300">{log.details || `${log.entityType || ""} #${log.entityId ?? ""}`}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
