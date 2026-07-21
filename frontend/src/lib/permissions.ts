import type { AuthUser } from "@/types";

export type AppRole = "ADMIN" | "MANAGER" | "CASHIER" | "SALES_ASSISTANT" | "DRIVER";

export type Permission =
  | "viewDashboard"
  | "viewInventory"
  | "adjustInventory"
  | "manageProducts"
  | "createSale"
  | "viewSales"
  | "refundSale"
  | "viewCustomers"
  | "manageCustomers"
  | "deleteCustomers"
  | "manageEmployees"
  | "viewReports"
  | "viewAudit"
  | "stockIn";

const ROLE_PERMISSIONS: Record<AppRole, Permission[]> = {
  ADMIN: [
    "viewDashboard",
    "viewInventory",
    "adjustInventory",
    "manageProducts",
    "viewSales",
    "refundSale",
    "viewCustomers",
    "manageCustomers",
    "deleteCustomers",
    "manageEmployees",
    "viewReports",
    "viewAudit",
    "stockIn",
  ],
  MANAGER: [
    "viewDashboard",
    "viewInventory",
    "adjustInventory",
    "createSale",
    "viewSales",
    "refundSale",
    "viewCustomers",
    "manageCustomers",
    "deleteCustomers",
    "viewReports",
    "viewAudit",
    "stockIn",
  ],
  CASHIER: [
    "viewDashboard",
    "viewInventory",
    "createSale",
    "viewSales",
    "viewCustomers",
    "manageCustomers",
  ],
  SALES_ASSISTANT: [
    "viewDashboard",
    "viewInventory",
    "createSale",
    "viewSales",
    "viewCustomers",
    "manageCustomers",
  ],
  DRIVER: ["viewDashboard", "viewInventory", "viewCustomers"],
};

export function getEffectiveRole(user: AuthUser | null | undefined): AppRole | null {
  if (!user) return null;
  if (user.userType === "ADMIN") return "ADMIN";
  const role = user.role as AppRole;
  return ROLE_PERMISSIONS[role] ? role : null;
}

export function can(user: AuthUser | null | undefined, permission: Permission): boolean {
  const role = getEffectiveRole(user);
  if (!role) return false;
  return ROLE_PERMISSIONS[role].includes(permission);
}
