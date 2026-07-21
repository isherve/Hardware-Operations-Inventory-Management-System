import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api, ApiClientError } from "@/lib/api";
import type { Employee } from "@/types";
import { useAuth } from "@/hooks/useAuth";
import { can } from "@/lib/permissions";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const ROLES = ["CASHIER", "SALES_ASSISTANT", "MANAGER", "DRIVER"];

export default function EmployeesPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Employee | null>(null);
  const qc = useQueryClient();
  const isAdmin = can(user, "manageEmployees");

  const { data: employees = [], isLoading } = useQuery({
    queryKey: ["employees"],
    queryFn: () => api.get<Employee[]>("/employees"),
    enabled: isAdmin,
  });

  const save = useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      editing ? api.put(`/employees/${editing.employeeId}`, data) : api.post("/employees", data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["employees"] });
      setShowForm(false);
      setEditing(null);
      toast.success("Employee saved");
    },
    onError: (e) => toast.error(e instanceof ApiClientError ? e.message : "Save failed"),
  });

  const terminate = useMutation({
    mutationFn: (id: number) => api.put(`/employees/${id}/terminate`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["employees"] }); toast.success("Employee terminated"); },
    onError: (e) => toast.error(e instanceof ApiClientError ? e.message : "Failed"),
  });

  const resetPassword = useMutation({
    mutationFn: (id: number) => api.put(`/employees/${id}/reset-password`, { newPassword: "BuiltIn@2024" }),
    onSuccess: () => toast.success("Password reset to BuiltIn@2024"),
    onError: (e) => toast.error(e instanceof ApiClientError ? e.message : "Failed"),
  });

  useEffect(() => {
    if (!isAdmin) navigate("/dashboard", { replace: true });
  }, [isAdmin, navigate]);

  if (!isAdmin) return null;

  if (isLoading) return <p className="text-slate-500">Loading employees...</p>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Employee Management</h1>
        <Button onClick={() => { setEditing(null); setShowForm(true); }}>New Employee</Button>
      </div>

      {(showForm || editing) && (
        <EmployeeForm
          employee={editing}
          onCancel={() => { setShowForm(false); setEditing(null); }}
          onSave={(data) => save.mutate(data)}
        />
      )}

      <Card>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-slate-50 text-left text-slate-500">
                <th className="p-3">Name</th>
                <th className="p-3">Role</th>
                <th className="p-3">Username</th>
                <th className="p-3">Status</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((e) => (
                <tr key={e.employeeId} className="border-b">
                  <td className="p-3 font-medium">{e.employeeName}</td>
                  <td className="p-3">{e.role}</td>
                  <td className="p-3">{e.username}</td>
                  <td className="p-3">
                    <Badge variant={e.status === "ACTIVE" ? "default" : "destructive"}>{e.status}</Badge>
                  </td>
                  <td className="p-3 space-x-2">
                    <Button variant="outline" size="sm" onClick={() => { setEditing(e); setShowForm(true); }}>Edit</Button>
                    {e.status === "ACTIVE" && (
                      <Button variant="destructive" size="sm" onClick={() => { if (confirm("Terminate employee?")) terminate.mutate(e.employeeId); }}>
                        Terminate
                      </Button>
                    )}
                    <Button variant="secondary" size="sm" onClick={() => { if (confirm("Reset password?")) resetPassword.mutate(e.employeeId); }}>
                      Reset PW
                    </Button>
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

function EmployeeForm({ employee, onCancel, onSave }: {
  employee: Employee | null;
  onCancel: () => void;
  onSave: (data: Record<string, unknown>) => void;
}) {
  const [form, setForm] = useState({
    employeeName: employee?.employeeName ?? "",
    role: employee?.role ?? "CASHIER",
    username: employee?.username ?? "",
    password: "",
    mustChangePassword: true,
  });

  return (
    <Card>
      <CardHeader><CardTitle>{employee ? "Update Employee" : "New Employee"}</CardTitle></CardHeader>
      <CardContent>
        <form onSubmit={(e) => {
          e.preventDefault();
          const data: Record<string, unknown> = { ...form };
          if (!form.password) delete data.password;
          onSave(data);
        }} className="grid gap-4 md:grid-cols-2">
          <div><Label>Name</Label><Input value={form.employeeName} onChange={(e) => setForm({ ...form, employeeName: e.target.value })} required /></div>
          <div>
            <Label>Role</Label>
            <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm">
              {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <div><Label>Username</Label><Input value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} required /></div>
          <div><Label>Password {employee && "(leave blank to keep)"}</Label><Input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></div>
          <div className="flex items-center gap-2 md:col-span-2">
            <input type="checkbox" checked={form.mustChangePassword} onChange={(e) => setForm({ ...form, mustChangePassword: e.target.checked })} />
            <Label>Force password change on first login</Label>
          </div>
          <div className="flex gap-2 md:col-span-2">
            <Button type="submit">Save</Button>
            <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
