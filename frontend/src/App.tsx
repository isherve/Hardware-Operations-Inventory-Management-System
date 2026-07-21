import { Navigate, Route, Routes } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { RequirePermission } from "@/components/RequirePermission";
import HomePage from "@/pages/HomePage";
import AdminLoginPage from "@/pages/AdminLoginPage";
import UserLoginPage from "@/pages/UserLoginPage";
import ChangePasswordPage from "@/pages/ChangePasswordPage";
import DashboardPage from "@/pages/DashboardPage";
import InventoryPage from "@/pages/InventoryPage";
import SalesPage from "@/pages/SalesPage";
import NewSalePage from "@/pages/NewSalePage";
import SaleReceiptPage from "@/pages/SaleReceiptPage";
import CustomersPage from "@/pages/CustomersPage";
import EmployeesPage from "@/pages/EmployeesPage";
import ReportsPage from "@/pages/ReportsPage";
import AuditPage from "@/pages/AuditPage";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login/admin" element={<AdminLoginPage />} />
      <Route path="/login/user" element={<UserLoginPage />} />
      <Route path="/change-password" element={<ChangePasswordPage />} />
      <Route element={<DashboardLayout />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/inventory" element={<InventoryPage />} />
        <Route
          path="/sales"
          element={
            <RequirePermission permission="viewSales">
              <SalesPage />
            </RequirePermission>
          }
        />
        <Route
          path="/sales/new"
          element={
            <RequirePermission permission="createSale">
              <NewSalePage />
            </RequirePermission>
          }
        />
        <Route
          path="/sales/:id"
          element={
            <RequirePermission permission="viewSales">
              <SaleReceiptPage />
            </RequirePermission>
          }
        />
        <Route
          path="/customers"
          element={
            <RequirePermission permission="viewCustomers">
              <CustomersPage />
            </RequirePermission>
          }
        />
        <Route
          path="/employees"
          element={
            <RequirePermission permission="manageEmployees">
              <EmployeesPage />
            </RequirePermission>
          }
        />
        <Route
          path="/reports"
          element={
            <RequirePermission permission="viewReports">
              <ReportsPage />
            </RequirePermission>
          }
        />
        <Route
          path="/audit"
          element={
            <RequirePermission permission="viewAudit">
              <AuditPage />
            </RequirePermission>
          }
        />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
