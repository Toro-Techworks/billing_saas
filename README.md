# Multi-Tenant Billing SaaS

Full-stack SaaS starter with:
- Frontend: React (Vite + TypeScript + TailwindCSS + Axios + React Router + Chart.js)
- Backend: Laravel API (Sanctum auth + RBAC + queues + mail + DomPDF)
- Database: MySQL (tenant-isolated tables with `tenant_id`)

## 1) Laravel Project Setup

Backend is in `backend`.

```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
php artisan vendor:publish --provider="Laravel\Sanctum\SanctumServiceProvider"
php artisan storage:link
```

Set `.env` database + mail + queue values:
- `DB_CONNECTION=mysql`
- `DB_DATABASE=billing_saas`
- `QUEUE_CONNECTION=database`
- `MAIL_MAILER=smtp`

Then run:

```bash
php artisan migrate --seed
php artisan queue:work
php artisan serve
```

## 2) Database Schema + Migrations

Implemented tables:
- `tenants`
- `users`
- `customers`
- `products`
- `invoices`
- `invoice_items`
- `payments`
- `tax_rates`
- `settings`
- `activity_logs`
- `personal_access_tokens`

All business tables include `tenant_id`.

## 3) Authentication + RBAC

- Sanctum token auth
- Register/login/logout endpoints
- Role values: `admin`, `accountant`, `viewer`
- Tenant middleware isolates every API request using authenticated user's `tenant_id`
- Role middleware protects admin-only routes

## 4) Core Modules (Backend API)

### Example endpoints

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/dashboard`
- `GET /api/customers`
- `POST /api/customers`
- `GET /api/products`
- `POST /api/invoices`
- `POST /api/invoices/{id}/send-email`
- `GET /api/invoices/{id}/download-pdf`
- `POST /api/payments`
- `GET /api/reports/revenue?from=2026-01-01&to=2026-12-31`
- `GET /api/reports/revenue?export_csv=1`
- `GET /api/search?q=inv`

### Service architecture

- `app/Services/InvoiceService.php` for item totals/tax calculations
- `app/Services/ReportService.php` for report aggregation
- `app/Repositories/*` for query abstraction
- Form Requests for validation
- API Resources for response shaping

### Queue + Mail + PDF

- Invoice emails are queued via `SendInvoiceEmailJob`
- Email template: `resources/views/emails/invoice.blade.php`
- PDF template: `resources/views/pdf/invoice.blade.php`

## 5) React Frontend

Frontend is in `frontend`.

```bash
cd frontend
npm install
npm run dev
```

Create `frontend/.env`:

```env
VITE_API_URL=http://127.0.0.1:8000/api
```

### Implemented pages/layout

- Sidebar SaaS layout with navigation
- Login
- Dashboard metrics + Chart.js monthly sales chart + recent invoices
- Customers
- Products
- Invoices
- Payments
- Reports (JSON + CSV-capable backend endpoints)
- Users
- Settings

## Seeded Demo Credentials

- Email: `admin@acme.test`
- Password: `password`

## Notes

- Repository currently uses Laravel `^12`; code is Laravel 11-compatible patterns.
- Install Composer before running backend commands.
