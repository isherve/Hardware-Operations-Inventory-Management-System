export const en = {
  app: {
    name: "Built In Hardware",
    tagline: "Operations & Inventory Management",
    location: "Kigali, Rwanda",
  },
  nav: {
    dashboard: "Dashboard",
    inventory: "Inventory",
    sales: "Sales",
    salesHistory: "Sales History",
    newSale: "New Sale",
    customers: "Customers",
    employees: "Employees",
    reports: "Reports",
    changePassword: "Change Password",
    logout: "Logout",
  },
  auth: {
    adminLogin: "Admin Login",
    staffLogin: "Staff Login",
    adminDesc: "Full system access",
    staffDesc: "Cashier, sales & operations",
    username: "Username",
    password: "Password",
    signIn: "Sign In",
    signingIn: "Signing in...",
    backHome: "Back to home",
    welcome: "Welcome, {{name}}",
    loginFailed: "Login failed",
  },
  settings: {
    theme: "Theme",
    light: "Light",
    dark: "Dark",
    language: "Language",
    english: "English",
    french: "French",
  },
  common: {
    loading: "Loading...",
    save: "Save",
    cancel: "Cancel",
    delete: "Delete",
    edit: "Edit",
    search: "Search",
    actions: "Actions",
  },
  home: {
    chooseLogin: "Choose your login type",
  },
} as const;

export type TranslationKey = typeof en;
