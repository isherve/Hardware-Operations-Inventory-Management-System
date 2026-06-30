import { useEffect } from "react";
import { Navigate, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { AppShell } from "@/components/layout/app-shell";

export function DashboardLayout() {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) navigate("/", { replace: true });
    else if (user.mustChangePassword) navigate("/change-password", { replace: true });
  }, [user, navigate]);

  if (!user) return null;
  if (user.mustChangePassword) return <Navigate to="/change-password" replace />;

  return (
    <AppShell>
      <Outlet />
    </AppShell>
  );
}
