import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  UserCog,
  BarChart3,
  LogOut,
  KeyRound,
  ClipboardList,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { useI18n } from "@/hooks/useI18n";
import { can } from "@/lib/permissions";
import { Button } from "@/components/ui/button";
import { AppSettings } from "@/components/app-settings";
import { ApiStatusBanner } from "@/components/ApiStatusBanner";

export function AppShell({ children }: { children: React.ReactNode }) {
  const { pathname } = useLocation();
  const { user, logout } = useAuth();
  const { t } = useI18n();

  const links = [
    { href: "/dashboard", label: t("nav.dashboard"), icon: LayoutDashboard, show: can(user, "viewDashboard") },
    { href: "/inventory", label: t("nav.inventory"), icon: Package, show: can(user, "viewInventory") },
    { href: "/sales/new", label: t("nav.newSale"), icon: ShoppingCart, show: can(user, "createSale") },
    { href: "/sales", label: t("nav.sales"), icon: ShoppingCart, show: can(user, "viewSales") },
    { href: "/customers", label: t("nav.customers"), icon: Users, show: can(user, "viewCustomers") },
    { href: "/employees", label: t("nav.employees"), icon: UserCog, show: can(user, "manageEmployees") },
    { href: "/reports", label: t("nav.reports"), icon: BarChart3, show: can(user, "viewReports") },
    { href: "/audit", label: "Audit", icon: ClipboardList, show: can(user, "viewAudit") },
  ].filter((l) => l.show);

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
      <aside className="flex w-64 flex-col border-r border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <div className="border-b border-slate-200 p-6 dark:border-slate-800">
          <h1 className="text-lg font-bold text-orange-700 dark:text-orange-400">{t("app.name")}</h1>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{t("app.location")}</p>
        </div>
        <nav className="flex-1 space-y-1 p-4">
          {links.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              to={href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                pathname === href || (href !== "/sales" && pathname.startsWith(href + "/")) || (href === "/sales" && pathname === "/sales")
                  ? "bg-orange-50 text-orange-700 dark:bg-orange-950 dark:text-orange-300"
                  : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          ))}
        </nav>
        <div className="border-t border-slate-200 p-4 dark:border-slate-800">
          <p className="mb-2 truncate text-sm font-medium text-slate-900 dark:text-slate-100">{user?.displayName}</p>
          <p className="mb-3 text-xs text-slate-500 dark:text-slate-400">{user?.role}</p>
          <div className="mb-3">
            <AppSettings />
          </div>
          <div className="flex flex-col gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link to="/change-password">
                <KeyRound className="h-4 w-4" /> {t("nav.changePassword")}
              </Link>
            </Button>
            <Button variant="ghost" size="sm" onClick={logout}>
              <LogOut className="h-4 w-4" /> {t("nav.logout")}
            </Button>
          </div>
        </div>
      </aside>
      <div className="flex flex-1 flex-col overflow-auto">
        <ApiStatusBanner />
        <main className="flex-1 p-8">{children}</main>
      </div>
    </div>
  );
}
