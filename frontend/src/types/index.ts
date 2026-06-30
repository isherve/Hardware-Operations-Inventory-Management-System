export type UserType = "ADMIN" | "EMPLOYEE";

export interface AuthUser {
  token: string;
  userId: number;
  username: string;
  displayName: string;
  userType: UserType;
  role: string;
  mustChangePassword: boolean;
}

export interface Product {
  productId: number;
  productName: string;
  description?: string;
  category: string;
  unitPrice: number;
  quantityInStock?: number;
  reorderLevel?: number;
  lowStock?: boolean;
}

export interface InventoryItem {
  inventoryId: number;
  productId: number;
  productName: string;
  category: string;
  unitPrice: number;
  quantityInStock: number;
  reorderLevel: number;
  lowStock: boolean;
}

export interface Customer {
  customerId: number;
  customerName: string;
  phoneNumber?: string;
  email?: string;
  address?: string;
  loyaltyPoints: number;
}

export interface Employee {
  employeeId: number;
  employeeName: string;
  role: string;
  username: string;
  status: string;
  mustChangePassword: boolean;
}

export interface SaleLine {
  productId: number;
  productName: string;
  quantity: number;
  unitPriceAtSale: number;
  lineTotal: number;
}

export interface Sale {
  saleId: number;
  employeeId: number;
  employeeName: string;
  customerId?: number;
  customerName?: string;
  saleDate: string;
  totalAmount: number;
  refunded: boolean;
  lines: SaleLine[];
}

export interface DashboardReport {
  salesToday: number;
  salesCountToday: number;
  salesThisMonth: number;
  salesCountThisMonth: number;
  lowStockCount: number;
  revenueToday: number;
  topProducts: { productId: number; productName: string; quantitySold: number; revenue: number }[];
}

export interface ApiError {
  message: string;
  fieldErrors?: { field: string; message: string }[];
}
