# KEMI Gateway — Monorepo

```
kemi-gateway/
├── laravel-backend/   ← Laravel 11 API  (php artisan serve --port=8000)
└── frontend/          ← React + Vite    (npm run dev  →  http://localhost:8081)
```

## Quick Start

### 1. Backend
```bash
cd laravel-backend
php artisan serve --port=8000
```

### 2. Frontend
```bash
cd frontend
npm run dev
# opens http://localhost:8081
# API calls go to http://localhost:8000 automatically
```

## Authentication
Students can log in using any of:
- **TSC Number** (e.g. `TSC/0001/2024`)
- **DELM Number**
- **Email address**

New students are prompted to complete their profile (TSC/DELM, phone, ID, designation, county) before accessing the portal.

## Fee Structure
Per application, the fee invoice includes:
| Item             | Amount (KSh) |
|------------------|-------------|
| Registration Fee | 2,000        |
| Unit Fee         | 3,000 / unit |
| Transcript Fee   | 1,500        |
| Exam Card Fee    | 1,000        |
| Course/Programme Fee | per course |

## Seed Accounts (password: `password`)
| Role              | Email                   | TSC         |
|-------------------|-------------------------|-------------|
| Super Admin       | superadmin@kemi.local   | —           |
| Admission Officer | admin@kemi.local        | —           |
| DD AEC            | ddaec@kemi.local        | —           |
| DD CD&T           | ddcdt@kemi.local        | —           |
| Test Student      | student@kemi.local      | TSC/0001/2024 |
