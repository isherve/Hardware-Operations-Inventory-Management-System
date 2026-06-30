# Bettina Hardware — Operations & Inventory Management System

Production-ready hardware store management platform for **Bettina Hardware**, Kigali, Rwanda. Replaces manual ledgers with automated inventory, sales, customer, employee, financial, and reporting workflows.

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 19 + Vite, TypeScript, React Router, Tailwind CSS, TanStack Query, shadcn-style UI |
| Backend | Java 17, Spring Boot 3.4, Spring Security (JWT), Spring Data JPA |
| Database | PostgreSQL 17 (local/Docker/Supabase) or H2 file DB for dev |
| API Docs | Swagger UI at `/swagger-ui` |

## Prerequisites

- **Java 17+** (JDK 17 required for Spring Boot 3)
- **Node.js 18+** and npm
- **PostgreSQL 17** (local install or Docker)
- **Docker** (optional, for `docker-compose`)

## Quick Start

### Database options

| Profile | Database | When to use |
|---------|----------|-------------|
| `dev` | H2 file (`backend/data/`) | Fast local dev, no PostgreSQL install |
| *(default)* | Local PostgreSQL / Docker | Production-like local setup |
| `supabase` | Supabase cloud PostgreSQL | Hosted database |

### 1. PostgreSQL (default profile)

**Option A — Docker:**

```bash
docker-compose up -d
```

**Option B — Local PostgreSQL / pgAdmin 4:**

Create database `bettina_hardware` with user `bettina` / password `bettina_secret`.

### 2. Environment

Copy `.env.example` to `.env` in the project root and adjust if needed:

```bash
cp .env.example .env
```

Backend reads env vars (or uses defaults matching docker-compose).

### 3. Backend

**Local H2 (easiest — no PostgreSQL):**

```bash
cd backend
set JAVA_HOME=C:\Program Files\Microsoft\jdk-17.0.19.10-hotspot   # Windows example
mvnw.cmd spring-boot:run -Dspring-boot.run.profiles=dev
```

API: `http://localhost:8081` (dev profile)

**Local PostgreSQL / Docker:**

```bash
cd backend
mvnw.cmd spring-boot:run
```

API: `http://localhost:8080`

**Supabase (cloud):**

1. Create a project at [supabase.com](https://supabase.com)
2. Copy database URL, user, and password from **Project Settings → Database**
3. Set env vars (see `.env.example`): `SUPABASE_DB_URL`, `SUPABASE_DB_USER`, `SUPABASE_DB_PASSWORD`
4. Run:

```bash
cd backend
mvnw.cmd spring-boot:run -Dspring-boot.run.profiles=supabase
```

Swagger: `http://localhost:8080/swagger-ui` (or `:8081` with `dev` profile)

### 4. Frontend (React + Vite)

```bash
cd frontend
npm install
npm run dev
```

App: `http://localhost:3000`

Set `VITE_API_URL` in `frontend/.env` to match your backend port (`8081` for `dev`, `8080` otherwise).

## UI: Theme & Language

- **Light / Dark mode** — toggle from the home screen or sidebar (saved in browser)
- **English / French** — EN / FR buttons next to the theme toggle

## Default Credentials

See [CREDENTIALS.md](CREDENTIALS.md) for the full list.

| Role | Username | Password |
|------|----------|----------|
| Admin | `admin` | `Admin@Bettina2024` |
| Manager | `manager1` | `Manager@2024` |
| Cashier | `cashier1` | `Cashier@2024` |
| Sales Assistant | `sales1` | `Sales@2024` |
| Driver | `driver1` | `Driver@2024` (must change password on first login) |

## Project Structure

```
backend/          Spring Boot REST API (/api)
frontend/         React + Vite SPA
docker-compose.yml
.env.example
```

## Key Features

- **Transactional sales** — stock decrement, financial record, loyalty points in one DB transaction
- **Refunds** — restore inventory and create REFUND financial records
- **Low-stock alerts** — products where `quantity_in_stock <= reorder_level`
- **RBAC** — Admin vs Employee roles enforced server-side
- **Reports** — daily/monthly sales, inventory valuation, transaction ledger with CSV/PDF export
- **Currency** — RWF (stored as DECIMAL, displayed without decimals)

## Loyalty Points

Configurable via `LOYALTY_POINTS_PER_1000_RWF` (default: **1 point per 1,000 RWF** spent).

## Database Backup & Restore

**Backup:**

```bash
pg_dump -h localhost -U bettina -d bettina_hardware -F c -f bettina_backup.dump
```

**Restore:**

```bash
pg_restore -h localhost -U bettina -d bettina_hardware --clean --if-exists bettina_backup.dump
```

For plain SQL backup:

```bash
pg_dump -h localhost -U bettina bettina_hardware > bettina_backup.sql
psql -h localhost -U bettina -d bettina_hardware < bettina_backup.sql
```

## Testing

**Backend:**

```bash
cd backend
mvnw.cmd test
```

**Frontend:**

```bash
cd frontend
npm run lint
npm run build
npm test
```

## API Overview

| Module | Endpoints |
|--------|-----------|
| Auth | `POST /api/auth/login`, `POST /api/auth/change-password`, `GET /api/auth/me` |
| Products | CRUD `/api/products` (write: Admin only) |
| Inventory | `GET /api/inventory`, `PUT /api/inventory/{productId}`, `GET /api/inventory/low-stock` |
| Sales | `POST /api/sales`, `GET /api/sales`, `POST /api/sales/{id}/refund` |
| Customers | CRUD `/api/customers` |
| Employees | `/api/employees` (Admin only) |
| Reports | `/api/reports/daily`, `/monthly`, `/inventory`, `/transactions`, `/dashboard` + CSV/PDF export |

Full interactive docs: `http://localhost:8080/swagger-ui`

## Deploy Live

See **[DEPLOY.md](DEPLOY.md)** for full instructions.

| Layer | Host |
|-------|------|
| Frontend | [Vercel](https://vercel.com) (`frontend/`) |
| Backend | [Render](https://render.com) (Docker, `render.yaml`) |
| Database | [Supabase](https://supabase.com) PostgreSQL |

## License

Internal use — Bettina Hardware, Kigali, Rwanda.
