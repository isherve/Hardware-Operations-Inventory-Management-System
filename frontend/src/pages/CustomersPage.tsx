import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api, ApiClientError } from "@/lib/api";
import type { Customer } from "@/types";
import { useAuth } from "@/hooks/useAuth";
import { can } from "@/lib/permissions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function CustomersPage() {
  const { user } = useAuth();
  const canManage = can(user, "manageCustomers");
  const canDelete = can(user, "deleteCustomers");
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<Customer | null>(null);
  const [showForm, setShowForm] = useState(false);
  const qc = useQueryClient();

  const { data: customers = [], isLoading } = useQuery({
    queryKey: ["customers", search],
    queryFn: () => api.get<Customer[]>(`/customers${search ? `?search=${encodeURIComponent(search)}` : ""}`),
  });

  const save = useMutation({
    mutationFn: (data: { id?: number; customerName: string; phoneNumber?: string; email?: string; address?: string }) =>
      data.id ? api.put(`/customers/${data.id}`, data) : api.post("/customers", data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["customers"] });
      setShowForm(false);
      setEditing(null);
      toast.success("Customer saved");
    },
    onError: (e) => toast.error(e instanceof ApiClientError ? e.message : "Save failed"),
  });

  const remove = useMutation({
    mutationFn: (id: number) => api.delete(`/customers/${id}`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["customers"] }); toast.success("Customer deleted"); },
    onError: (e) => toast.error(e instanceof ApiClientError ? e.message : "Delete failed"),
  });

  if (isLoading) return <p className="text-slate-500">Loading customers...</p>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Customers</h1>
        {canManage && (
          <Button onClick={() => { setEditing(null); setShowForm(true); }}>Add Customer</Button>
        )}
      </div>
      <Input placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-xs" />

      {(showForm || editing) && canManage && (
        <CustomerForm
          customer={editing}
          onCancel={() => { setShowForm(false); setEditing(null); }}
          onSave={(data) => save.mutate(data)}
        />
      )}

      <Card>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-slate-50 text-left text-slate-500 dark:bg-slate-900 dark:text-slate-400">
                <th className="p-3">Name</th>
                <th className="p-3">Phone</th>
                <th className="p-3">Email</th>
                <th className="p-3">Loyalty Points</th>
                {(canManage || canDelete) && <th className="p-3">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {customers.map((c) => (
                <tr key={c.customerId} className="border-b">
                  <td className="p-3 font-medium">{c.customerName}</td>
                  <td className="p-3">{c.phoneNumber || "—"}</td>
                  <td className="p-3">{c.email || "—"}</td>
                  <td className="p-3">{c.loyaltyPoints}</td>
                  {(canManage || canDelete) && (
                    <td className="p-3 space-x-2">
                      {canManage && (
                        <Button variant="outline" size="sm" onClick={() => { setEditing(c); setShowForm(true); }}>Edit</Button>
                      )}
                      {canDelete && (
                        <Button variant="destructive" size="sm" onClick={() => { if (confirm("Delete customer?")) remove.mutate(c.customerId); }}>Delete</Button>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}

function CustomerForm({ customer, onCancel, onSave }: {
  customer: Customer | null;
  onCancel: () => void;
  onSave: (data: { id?: number; customerName: string; phoneNumber?: string; email?: string; address?: string }) => void;
}) {
  const [form, setForm] = useState({
    customerName: customer?.customerName ?? "",
    phoneNumber: customer?.phoneNumber ?? "",
    email: customer?.email ?? "",
    address: customer?.address ?? "",
  });

  return (
    <Card>
      <CardHeader><CardTitle>{customer ? "Edit Customer" : "New Customer"}</CardTitle></CardHeader>
      <CardContent>
        <form onSubmit={(e) => { e.preventDefault(); onSave({ id: customer?.customerId, ...form }); }} className="grid gap-4 md:grid-cols-2">
          <div><Label>Name</Label><Input value={form.customerName} onChange={(e) => setForm({ ...form, customerName: e.target.value })} required /></div>
          <div><Label>Phone</Label><Input value={form.phoneNumber} onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })} /></div>
          <div><Label>Email</Label><Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
          <div><Label>Address</Label><Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} /></div>
          <div className="flex gap-2 md:col-span-2">
            <Button type="submit">Save</Button>
            <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
