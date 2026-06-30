# Bettina Hardware — Default Login Credentials

> **Development / demo only.** Change all passwords before production deployment.

| Role | Username | Password | Notes |
|------|----------|----------|-------|
| **Admin** | `admin` | `Admin@Bettina2024` | Full system access |
| **Manager** | `manager1` | `Manager@2024` | Sales, inventory, reports |
| **Cashier** | `cashier1` | `Cashier@2024` | Point of sale |
| **Sales Assistant** | `sales1` | `Sales@2024` | Sales & customers |
| **Driver** | `driver1` | `Driver@2024` | Must change password on first login |

## Login URLs

- **Home:** `http://localhost:3000`
- **Admin login:** `http://localhost:3000/login/admin`
- **Staff login:** `http://localhost:3000/login/user`

## Resetting seed data (local H2)

If you already ran the app with old passwords, delete the H2 database and restart:

```bash
# Windows
rmdir /s /q backend\data
cd backend
mvnw.cmd spring-boot:run -Dspring-boot.run.profiles=dev
```

Flyway will re-apply migrations with the credentials above.
