const fs = require("fs");
const path = require("path");

const map = {
  "app/page.tsx": "src/pages/HomePage.tsx",
  "app/login/admin/page.tsx": "src/pages/AdminLoginPage.tsx",
  "app/login/user/page.tsx": "src/pages/UserLoginPage.tsx",
  "app/change-password/page.tsx": "src/pages/ChangePasswordPage.tsx",
  "app/(dashboard)/dashboard/page.tsx": "src/pages/DashboardPage.tsx",
  "app/(dashboard)/inventory/page.tsx": "src/pages/InventoryPage.tsx",
  "app/(dashboard)/sales/page.tsx": "src/pages/SalesPage.tsx",
  "app/(dashboard)/sales/new/page.tsx": "src/pages/NewSalePage.tsx",
  "app/(dashboard)/sales/[id]/page.tsx": "src/pages/SaleReceiptPage.tsx",
  "app/(dashboard)/customers/page.tsx": "src/pages/CustomersPage.tsx",
  "app/(dashboard)/employees/page.tsx": "src/pages/EmployeesPage.tsx",
  "app/(dashboard)/reports/page.tsx": "src/pages/ReportsPage.tsx",
};

for (const [src, dst] of Object.entries(map)) {
  let c = fs.readFileSync(src, "utf8");
  c = c.replace(/^"use client";\r?\n\r?\n/m, "");
  c = c.replace(/import Link from "next\/link";/g, 'import { Link } from "react-router-dom";');
  c = c.replace(
    /import \{ useRouter \} from "next\/navigation";/g,
    'import { useNavigate, Navigate } from "react-router-dom";'
  );
  c = c.replace(/const router = useRouter\(\);/g, "const navigate = useNavigate();");
  c = c.replace(/router\.push\(/g, "navigate(");
  c = c.replace(/router\.replace\(/g, "navigate(");
  c = c.replace(/\bhref="/g, 'to="');
  c = c.replace(/import \{ use \} from "react";\r?\n/g, "");

  if (dst.includes("SaleReceipt")) {
    c =
      'import { Link, useParams } from "react-router-dom";\n' +
      c.replace(/import \{ Link \} from "react-router-dom";\r?\n/, "");
    c = c.replace(
      /export default function SaleReceiptPage\(\{ params \}: \{ params: Promise<\{ id: string \}> \}\) \{\s*const \{ id \} = use\(params\);/,
      "export default function SaleReceiptPage() {\n  const { id } = useParams();"
    );
  }

  if (dst.includes("ChangePassword")) {
    c = c.replace(
      /if \(!user\) \{\s*navigate\("\/"\);\s*return null;\s*\}/,
      'if (!user) return <Navigate to="/" replace />;'
    );
  }

  if (dst.includes("Employees")) {
    c = c.replace(
      /import \{ useNavigate, Navigate \} from "react-router-dom";/,
      'import { useNavigate } from "react-router-dom";'
    );
  }

  if (dst.includes("NewSale")) {
    c = c.replace(
      /import \{ useNavigate, Navigate \} from "react-router-dom";/,
      'import { Link, useNavigate } from "react-router-dom";'
    );
  }

  fs.mkdirSync(path.dirname(dst), { recursive: true });
  fs.writeFileSync(dst, c);
}

console.log("converted", Object.keys(map).length, "pages");
