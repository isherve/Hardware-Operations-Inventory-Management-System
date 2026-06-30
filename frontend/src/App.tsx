import { Navigate, Route, Routes } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
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
        <Route path="/sales" element={<SalesPage />} />
        <Route path="/sales/new" element={<NewSalePage />} />
        <Route path="/sales/:id" element={<SaleReceiptPage />} />
        <Route path="/customers" element={<CustomersPage />} />
        <Route path="/employees" element={<EmployeesPage />} />
        <Route path="/reports" element={<ReportsPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
