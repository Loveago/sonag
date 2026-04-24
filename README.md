# Learnify — Premium Online Course Platform

A production-ready, feature-rich online learning platform.

- **Frontend**: Next.js 14 (App Router) + TypeScript + Tailwind CSS + Framer Motion
- **Backend**: Node.js + Express.js (REST API, modular architecture)
- **Database**: PostgreSQL via Prisma ORM (SQLite-compatible for quick dev)
- **Storage**: AWS S3 (signed URLs for secure streaming; local fallback in dev)
- **Auth**: JWT access + refresh tokens, bcrypt hashing
- **Animations**: Framer Motion, smooth micro-interactions, Stripe/Linear-inspired UI
- **Admin Panel**: full SaaS-style dashboard with Recharts, drag-and-drop course builder

## Project Structure

```
sonag/
├── web/        # Next.js frontend + admin panel
├── api/        # Express backend + Prisma
└── README.md
```

## Quick Start

### 1. Backend (api)

```bash
cd api
npm install
cp .env.example .env        # set DATABASE_URL, JWT secrets, S3 creds
npx prisma generate
npx prisma migrate dev --name init
npm run seed                # seeds admin user + demo courses
npm run dev                 # http://localhost:4000
```

Default admin: `admin@learnify.dev` / `admin123`

### 2. Frontend (web)

```bash
cd web
npm install
cp .env.local.example .env.local   # NEXT_PUBLIC_API_URL=http://localhost:4000
npm run dev                         # http://localhost:3000
```

## Architecture

### Frontend
- **App Router** with server components for performance
- **Framer Motion** for animations, page transitions, hover effects
- **Theme**: dark/light toggle via `next-themes`, premium dark default
- **UI primitives** in `web/components/ui/*`, fully typed, Tailwind-based
- **State**: React Query for API caching, Zustand for client state
- **Auth**: JWT stored in httpOnly-like localStorage + refresh rotation

### Backend (modular clean architecture)
```
api/src/
├── modules/
│   ├── auth/        # register, login, refresh, logout
│   ├── users/       # profile, enrolled courses, progress
│   ├── courses/     # CRUD, sections, lessons
│   ├── video/       # S3 presign, signed stream URLs
│   └── progress/    # watch-progress, completion %
├── middleware/      # auth, error, rate-limit, validate
├── lib/             # prisma, s3, jwt, logger
└── index.ts         # app bootstrap
```

### Security
- bcrypt password hashing
- JWT signed access tokens (15m) + refresh tokens (7d), rotation
- Zod validation on every route
- Rate-limiting on auth endpoints
- Helmet + CORS
- Signed S3 URLs (no direct-download links stored client-side)

## Feature Checklist

- [x] Landing page (hero, features, testimonials, CTA)
- [x] Courses listing (filters, search with debounce, categories, difficulty)
- [x] Course details (curriculum, preview, pricing)
- [x] Custom video player (resume, progress autosave, secure stream)
- [x] Dashboard (enrolled, progress, recently watched)
- [x] Auth (login/register + JWT refresh)
- [x] Profile page (edit, avatar)
- [x] Admin dashboard (stats, charts)
- [x] Admin course manager (drag-drop sections/lessons, rich text, S3 upload)
- [x] Admin user management
- [x] Admin analytics (engagement, completion)
- [x] Bookmarks + per-lesson notes
- [x] Toast notifications + skeletons + error boundaries
- [x] PWA manifest + basic offline caching
- [x] Stripe placeholder for monetization

## Environment Variables

See `api/.env.example` and `web/.env.local.example`.

## License

MIT
