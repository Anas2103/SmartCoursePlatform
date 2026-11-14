# SmartCourse Platform

A production-ready Learning Management System (LMS) built with Laravel 11 (backend) and React + Vite (frontend), inspired by Udemy/Coursera.

---

## Features

- **Authentication** — Register, login, logout, forgot/reset password, email verification, remember me
- **Role-Based Access** — Super Admin, Admin, Teacher, Student with full RBAC
- **Course Management** — Create, edit, publish, sections, lessons (video/text/PDF/quiz/assignment)
- **Student Learning** — Video player, progress tracking, certificates (PDF), quiz attempts
- **Payments** — Stripe integration, free course enrollment, payment history, invoices, refunds
- **Reviews & Ratings** — Star ratings, review CRUD with avg recalculation
- **Notifications** — Real-time badge, mark as read, in-app notifications
- **Wishlist & Bookmarks** — Save courses and lessons for later
- **Admin Panel** — User management (ban/unban), course approval/rejection, analytics, reports
- **Dark Mode** — System-aware dark mode with user toggle
- **Responsive UI** — Mobile-first, animated, modern design

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Laravel 11, Sanctum, DomPDF, Intervention Image |
| Frontend | React 18, Vite, TailwindCSS, TanStack Query v5 |
| Database | MySQL 8+ |
| Payments | Stripe |
| Charts | Recharts |
| Auth | Sanctum token-based (Bearer) |

---

## Project Structure

```
SmartCoursePlatform/
├── backend/          # Laravel 11 API
│   ├── app/
│   │   ├── Http/Controllers/Api/
│   │   │   ├── Admin/      # Admin controllers
│   │   │   ├── Teacher/    # Teacher controllers
│   │   │   ├── Student/    # Student controllers
│   │   │   └── Auth/       # Auth controllers
│   │   ├── Models/         # Eloquent models
│   │   └── Http/Middleware/RoleMiddleware.php
│   ├── database/
│   │   ├── migrations/
│   │   └── seeders/DatabaseSeeder.php
│   ├── resources/views/certificates/
│   └── routes/api.php
└── frontend/         # React + Vite SPA
    └── src/
        ├── pages/
        │   ├── public/    # Landing, CourseCatalog, CourseDetail, etc.
        │   ├── auth/      # Login, Register, ForgotPassword, ResetPassword
        │   ├── student/   # Dashboard, MyCourses, CoursePlayer, QuizPage, etc.
        │   ├── teacher/   # Dashboard, Courses, CreateCourse, EditCourse, etc.
        │   └── admin/     # Dashboard, Users, Courses, Payments, etc.
        ├── components/
        │   ├── common/    # Spinner, Modal, CourseCard, Pagination, etc.
        │   └── layout/    # PublicLayout, DashboardLayout, Navbar, Footer
        ├── contexts/      # AuthContext, ThemeContext
        └── services/api.js
```

---

## Setup Instructions

### Prerequisites

- PHP 8.2+
- Composer
- Node.js 18+ and npm
- MySQL 8+
- A Stripe account (for payments)

---

### Backend Setup

**1. Navigate to the backend directory**

```bash
cd backend
```

**2. Install PHP dependencies**

```bash
composer install
```

**3. Copy and configure the environment file**

```bash
cp .env.example .env
```

Edit `.env` with your settings:

```env
APP_NAME=SmartCourse
APP_URL=http://localhost:8000

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=smartcourse
DB_USERNAME=root
DB_PASSWORD=your_password

MAIL_MAILER=smtp
MAIL_HOST=smtp.mailtrap.io
MAIL_PORT=2525
MAIL_USERNAME=your_mailtrap_user
MAIL_PASSWORD=your_mailtrap_password
MAIL_FROM_ADDRESS=noreply@smartcourse.com
MAIL_FROM_NAME="SmartCourse"

STRIPE_KEY=sk_test_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

FRONTEND_URL=http://localhost:5173
```

**4. Generate application key**

```bash
php artisan key:generate
```

**5. Create the database**

```sql
CREATE DATABASE smartcourse CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

**6. Run migrations**

```bash
php artisan migrate
```

**7. Seed the database** (demo users and courses)

```bash
php artisan db:seed
```

**8. Create storage link** (for file uploads)

```bash
php artisan storage:link
```

**9. Start the backend server**

```bash
php artisan serve
```

The API will be available at `http://localhost:8000`.

---

### Frontend Setup

**1. Navigate to the frontend directory**

```bash
cd frontend
```

**2. Install dependencies**

```bash
npm install
```

**3. Copy and configure the environment file**

```bash
cp .env.example .env
```

Edit `.env`:

```env
VITE_API_URL=http://localhost:8000/api
VITE_APP_NAME=SmartCourse
VITE_STRIPE_PUBLIC_KEY=pk_test_your_stripe_public_key
```

**4. Start the development server**

```bash
npm run dev
```

The frontend will be available at `http://localhost:5173`.

---

## Demo Accounts

After running the seeder, you can log in with these credentials (password: `Password123!`):

| Role | Email | Password |
|---|---|---|
| Super Admin | superadmin@smartcourse.com | Password123! |
| Admin | admin@smartcourse.com | Password123! |
| Teacher | sarah@smartcourse.com | Password123! |
| Teacher | mike@smartcourse.com | Password123! |
| Student | student1@smartcourse.com | Password123! |
| Student | student2@smartcourse.com | Password123! |

---

## Stripe Setup

**Test mode** (development):

1. Use Stripe test keys from [dashboard.stripe.com](https://dashboard.stripe.com)
2. Test card: `4242 4242 4242 4242`, any future expiry, any CVC

**Webhooks** (optional for local dev):

```bash
# Install Stripe CLI
stripe listen --forward-to localhost:8000/api/payments/webhook
```

Copy the webhook signing secret output and set it as `STRIPE_WEBHOOK_SECRET` in `.env`.

---

## Building for Production

### Frontend

```bash
cd frontend
npm run build
```

Static files are output to `frontend/dist/`. Serve via Nginx or Vercel/Netlify.

### Backend

```bash
cd backend
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan optimize
```

---

## API Overview

All API endpoints are prefixed with `/api`.

### Public Endpoints

| Method | Path | Description |
|---|---|---|
| POST | /auth/register | Register a new user |
| POST | /auth/login | Login |
| POST | /auth/forgot-password | Send password reset email |
| POST | /auth/reset-password | Reset password |
| GET | /courses | List published courses (with filters) |
| GET | /courses/{slug} | Course detail |
| GET | /courses/featured | Featured courses |
| GET | /categories | All categories |

### Authenticated Endpoints

All require `Authorization: Bearer {token}` header.

| Method | Path | Description |
|---|---|---|
| POST | /auth/logout | Logout |
| GET | /auth/me | Get current user |
| GET/PUT | /profile | Get/update profile |
| POST | /profile/avatar | Upload avatar |
| PUT | /profile/password | Change password |
| GET | /notifications | Get notifications |
| POST | /payments/checkout | Purchase or enroll in course |

### Student Endpoints (`/student/`)

| Method | Path | Description |
|---|---|---|
| GET | /dashboard | Student stats |
| GET | /enrollments | My courses |
| GET | /enrollments/{courseId} | Course with lesson progress |
| POST | /lessons/{id}/complete | Mark lesson complete |
| GET | /quizzes/{id} | Quiz with questions |
| POST | /quizzes/{id}/start | Start quiz attempt |
| POST | /quizzes/{id}/submit | Submit quiz answers |
| GET | /certificates | My certificates |
| GET | /certificates/{id}/download | Download certificate PDF |
| GET | /wishlist | Wishlist |
| POST | /wishlist/{courseId} | Toggle wishlist |

### Teacher Endpoints (`/teacher/`)

| Method | Path | Description |
|---|---|---|
| GET | /dashboard | Teacher stats |
| GET | /analytics | Enrollment/revenue charts |
| GET/POST | /courses | List/create courses |
| GET/PUT/DELETE | /courses/{id} | Get/update/delete course |
| POST | /courses/{id}/publish | Submit for review |
| POST | /courses/{id}/thumbnail | Upload thumbnail |
| POST | /courses/{courseId}/sections | Add section |
| POST | /sections/{sectionId}/lessons | Add lesson |
| GET | /students | All enrolled students |

### Admin Endpoints (`/admin/`)

| Method | Path | Description |
|---|---|---|
| GET | /dashboard | Platform stats |
| GET | /users | List all users |
| POST | /users/{id}/ban | Ban user |
| POST | /courses/{id}/approve | Approve course |
| POST | /courses/{id}/reject | Reject course |
| GET | /payments | All payments |
| GET/PUT | /settings | Platform settings |
| GET | /reports | Revenue/growth reports |

---

## Course Workflow

```
Teacher creates course (draft)
       ↓
Teacher adds sections + lessons
       ↓
Teacher submits for review
       ↓
Admin reviews → Approve / Reject
       ↓         ↓
  Published   Back to teacher (with reason)
       ↓
Student enrolls (free/paid)
       ↓
Student watches lessons, takes quizzes
       ↓
100% completion → Certificate auto-generated
```

---

## Key Design Decisions

- **Sanctum token auth** (not cookie-based) for SPA compatibility
- **Soft deletes** on users and courses to preserve data integrity
- **Full-text search** on courses table for fast keyword search
- **React Query** for all server state — automatic caching, background refetch
- **Role middleware** checks auth + role + ban status in one place
- **Certificate PDF** generated server-side with DomPDF (A4 landscape)
- **Progress tracking** auto-calculates `progress_percentage` on every lesson completion

---

## Troubleshooting

**CORS errors in development**

Make sure `FRONTEND_URL=http://localhost:5173` is set in backend `.env` and the CORS config allows it.

**File upload failures**

Run `php artisan storage:link` and ensure `storage/app/public` is writable.

**Stripe webhook not working locally**

Use the Stripe CLI: `stripe listen --forward-to localhost:8000/api/payments/webhook`.

**Emails not sending**

Use Mailtrap for development. Set MAIL credentials in `.env`.

---

## License

MIT — free for personal and commercial use.

---

## More projects

- [**CarsRental**](https://github.com/Anas2103/CarsRental) — car rental manager with roles and PayPal (Laravel · React)
- [**E-Commerce**](https://github.com/Anas2103/Ecommerce) — multi-vendor store with Stripe & PayPal (Laravel · React) · [live demo](https://anas2103-ecommerce.vercel.app)
- [**HireMatch**](https://github.com/Anas2103/AiJobBoard) — AI job board that scores CVs against jobs (Laravel · React · OpenAI)
- [**Relay**](https://github.com/Anas2103/Relay) — Telegram-style chat with E2EE secret chats and calls (Cloudflare Workers · React) · [live demo](https://relay-chat.bunbunchat.workers.dev)
- [**Student & Course Manager**](https://github.com/Anas2103/StudentsCourseManager) — school management with 4 roles (Laravel · React)

More about me on my [GitHub profile](https://github.com/Anas2103).
