# KEMI Portal — Laravel 11 Backend

REST API powering the KEMI Training Enrollment & Student Portal React frontend.

## Stack
- PHP 8.2+, Laravel 11
- MySQL 8
- Sanctum (bearer-token auth)
- barryvdh/laravel-dompdf (admission letter + certificate PDFs)

## Run locally

```bash
cd laravel-backend
composer install
cp .env.example .env
php artisan key:generate

# Create the MySQL database first:
#   mysql -u root -e "CREATE DATABASE kemi_portal CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

php artisan migrate --seed
php artisan storage:link
php artisan serve --host=0.0.0.0 --port=8080
```

The API now serves at `http://localhost:8080/api`.

## Seeded accounts (password: `password`)
| Role         | Email                   |
|--------------|-------------------------|
| super_admin  | superadmin@kemi.local   |
| admin        | admin@kemi.local        |
| dd_aec       | ddaec@kemi.local        |
| dd_cdt       | ddcdt@kemi.local        |
| student      | student@kemi.local      |

## Frontend wiring
In the React app's `.env`:

```
VITE_API_URL=http://localhost:8080/api
```

## Endpoints (summary)
- `POST /api/auth/signup` `{email,password,full_name}` → `{token, user}`
- `POST /api/auth/login`  → `{token, user}`
- `POST /api/auth/logout`
- `GET  /api/auth/me`
- `GET  /api/courses`
- `GET  /api/profile/me` / `PATCH /api/profile/me`
- `GET  /api/applications/me` / `GET /api/applications`
- `POST /api/applications` `{course_id}`
- `POST /api/applications/{id}/payment-proof` (multipart: `file`, `reference_number`, `amount`)
- `POST /api/applications/{id}/verify-payment` `{verified, reason?}`
- `POST /api/applications/{id}/approve` `{approved, comment?}` → also generates PDF admission letter
- `POST /api/applications/{id}/authorize` `{comment?}`
- `POST /api/applications/{id}/complete-training`
- `POST /api/applications/{id}/graduate`
- `POST /api/applications/{id}/override-status` `{status, reason}` (super_admin)
- `POST /api/applications/{id}/override-payment` `{status, reason}` (super_admin)
- `GET  /api/certificates` / `GET /api/certificates/me`
- `POST /api/certificates` `{application_id, student_id, course_id}`
- `POST /api/certificates/{id}/revoke` `{reason}`
- `GET  /api/certificates/{id}/download` (PDF)
- `GET  /api/admission-letters/{application_id}/download` (PDF)
- `GET  /api/graduations`
- `GET  /api/audit-logs`

All authenticated requests require: `Authorization: Bearer <token>`.

## CORS / origins
Edit `CORS_ALLOWED_ORIGINS` in `.env` to add your frontend origin (defaults cover Vite on `:5173`).
