import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { can, type Permission } from "@/lib/permissions";

export function RequirePermission({
  permission,
  children,
}: {
  permission: Permission;
  children: React.ReactNode;
}) {
  const { user } = useAuth();
  if (!can(user, permission)) {
    return <Navigate to="/dashboard" replace />;
  }
  return <>{children}</>;
}
