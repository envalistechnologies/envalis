<p align="center">
  <h1 align="center">Envalis Technologies</h1>
  <p align="center">
    Full-stack company website &amp; admin panel built with the MERN stack.
    <br />
    <a href="https://envalistechnologies.com">Live Site</a> · <a href="https://admin.envalistechnologies.com">Admin Panel</a>
  </p>
</p>

---

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Monorepo Structure](#monorepo-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Environment Variables](#environment-variables)
  - [Installation](#installation)
  - [Running Locally](#running-locally)
- [Architecture](#architecture)
  - [Server](#server-architecture)
  - [Admin Panel](#admin-panel-architecture)
  - [Webapp](#webapp-architecture)
- [API Reference](#api-reference)
- [Authentication & Authorization](#authentication--authorization)
- [Media Management](#media-management)
- [Database Models](#database-models)
- [Deployment](#deployment)
- [Scripts Reference](#scripts-reference)
- [Contributing](#contributing)
- [License](#license)

---

## Overview

Envalis Technologies is a full-stack monorepo for a software development company website. It consists of three independent packages:

| Package | Description | Port |
|---------|-------------|------|
| **`server`** | Express.js REST API with MongoDB | `5000` |
| **`admin`** | React-based admin dashboard | `5174` |
| **`webapp`** | Public-facing company website | `5173` |

The platform provides complete content management for blogs, articles, portfolios, case studies, services, testimonials, resources, careers, employees, and contact forms — all managed through a role-based admin panel.

---

## Tech Stack

### Backend (`server/`)

| Category | Technology |
|----------|------------|
| Runtime | **Node.js** with ES Modules |
| Framework | **Express.js v5** |
| Database | **MongoDB** via **Mongoose v9** |
| Authentication | **JWT** (jsonwebtoken) + **bcryptjs** |
| File Uploads | **Multer** (memory storage) → **Cloudinary** |
| Email | **Nodemailer** |
| Security | Helmet, CORS, rate-limit, hpp, express-mongo-sanitize, xss-clean |
| 2FA | **Speakeasy** (TOTP) + **QRCode** |
| Utilities | Slugify, compression, morgan |

### Frontend — Admin (`admin/`)

| Category | Technology |
|----------|------------|
| Framework | **React 19** + **Vite 8** |
| Routing | **React Router v7** |
| State | **Zustand** (global) + **TanStack React Query v5** (server state) |
| Forms | **React Hook Form** + **Zod** validation |
| UI Library | **shadcn/ui** (Radix UI + Tailwind CSS v4) |
| Styling | **Tailwind CSS v4** + Inter font |
| Icons | **Phosphor Icons** |
| Charts | **Recharts** |
| Toasts | **Sonner** |
| HTTP | **Axios** |

### Frontend — Webapp (`webapp/`)

| Category | Technology |
|----------|------------|
| Framework | **React 19** + **Vite 8** |
| Routing | **React Router v7** |
| Server State | **TanStack React Query v5** |
| UI Library | **shadcn/ui** (Radix UI + Tailwind CSS v4) |
| Styling | **Tailwind CSS v4** + Inter font |
| Icons | **Phosphor Icons** |
| HTTP | **Axios** |

---

## Monorepo Structure

```
envalis/
├── server/                    # Express.js REST API
│   └── src/
│       ├── config/            # Database & Cloudinary config
│       ├── controllers/       # Route handlers (15 controllers)
│       ├── middleware/         # Auth, upload, error, rate-limit, validation
│       ├── models/            # Mongoose schemas (15 models)
│       ├── routes/            # Express route definitions (16 route files)
│       ├── seed/              # Super admin seeder
│       ├── services/          # Upload & email services
│       ├── utils/             # Helpers (response formatters, etc.)
│       └── server.js          # App entry point
│
├── admin/                     # React admin dashboard
│   └── src/
│       ├── api/               # Axios API modules per entity
│       ├── components/
│       │   ├── common/        # Shared components (DataTable, ImageUploader, RichTextEditor, etc.)
│       │   ├── layout/        # Sidebar, header, app shell
│       │   └── ui/            # shadcn/ui primitives
│       ├── hooks/             # Custom React hooks
│       ├── lib/               # Utility functions (buildFormData, formatters, etc.)
│       ├── pages/             # Page components organized by entity
│       │   ├── admins/        # Admin user management
│       │   ├── articles/      # Article CRUD
│       │   ├── audit/         # Audit log viewer
│       │   ├── auth/          # Login, forgot password, reset
│       │   ├── blogs/         # Blog CRUD + gallery
│       │   ├── careers/       # Job listing management
│       │   ├── caseStudies/   # Case study CRUD + gallery
│       │   ├── contacts/      # Contact form submissions
│       │   ├── dashboard/     # Analytics dashboard
│       │   ├── emails/        # Email template management
│       │   ├── employees/     # Employee management (HR)
│       │   ├── portfolios/    # Portfolio CRUD + gallery
│       │   ├── profile/       # Admin profile & 2FA setup
│       │   ├── projects/      # Internal project tracker
│       │   ├── resources/     # Downloadable resource management
│       │   ├── services/      # Service page CRUD
│       │   └── testimonials/  # Client testimonial CRUD
│       ├── store/             # Zustand auth store
│       └── styles/            # Global CSS & Tailwind config
│
├── webapp/                    # Public-facing website
│   └── src/
│       ├── api/               # Axios API modules (public endpoints)
│       ├── components/
│       │   ├── common/        # Shared UI components
│       │   ├── layout/        # Navbar, footer, page layout
│       │   ├── sections/      # Homepage sections (hero, features, etc.)
│       │   └── ui/            # shadcn/ui primitives
│       ├── pages/             # Public page views
│       │   ├── home/          # Homepage
│       │   ├── blog/          # Blog listing & detail
│       │   ├── articles/      # Article listing & detail
│       │   ├── portfolio/     # Portfolio showcase
│       │   ├── caseStudies/   # Case study pages
│       │   ├── services/      # Services listing & detail
│       │   ├── testimonials/  # Testimonials page
│       │   ├── careers/       # Career listings & apply
│       │   ├── resources/     # Downloadable resources
│       │   ├── projects/      # Project showcase
│       │   ├── contact/       # Contact form
│       │   └── static/        # About, Privacy, Terms, etc.
│       └── styles/            # Global CSS
│
├── LICENSE                    # Apache 2.0
└── README.md                  # ← You are here
```

---

## Getting Started

### Prerequisites

- **Node.js** >= 18.x
- **npm** >= 9.x
- **MongoDB** (local instance or [MongoDB Atlas](https://www.mongodb.com/atlas))
- **Cloudinary** account (for media uploads)

### Environment Variables

Create a `.env` file inside `server/`:

```env
# ── Server ──────────────────────────────────────────
NODE_ENV=development
PORT=5000

# ── Database ────────────────────────────────────────
MONGO_URI=mongodb://localhost:27017/envalis
# or MongoDB Atlas: mongodb+srv://<user>:<pass>@cluster.mongodb.net/envalis

# ── Authentication ──────────────────────────────────
JWT_SECRET=your-jwt-secret-key
JWT_EXPIRES_IN=7d

# ── Cloudinary (Media Uploads) ──────────────────────
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# ── Email (Nodemailer) ─────────────────────────────
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
FROM_EMAIL=noreply@envalistechnologies.com
FROM_NAME=Envalis Technologies

# ── Super Admin Seed ───────────────────────────────
SUPER_ADMIN_EMAIL=admin@envalistechnologies.com
SUPER_ADMIN_PASSWORD=your-secure-password

# ── Frontend URLs (for CORS) ───────────────────────
CLIENT_URL=http://localhost:5173
ADMIN_URL=http://localhost:5174
```

### Installation

Clone the repository and install dependencies for all three packages:

```bash
# Clone
git clone https://github.com/envalistechnologies/envalis.git
cd envalis

# Install server dependencies
cd server && npm install

# Install admin dependencies
cd ../admin && npm install

# Install webapp dependencies
cd ../webapp && npm install
```

### Running Locally

Open **three terminal windows** and run each package:

```bash
# Terminal 1 — API Server (port 5000)
cd server
npm run dev

# Terminal 2 — Public Website (port 5173)
cd webapp
npm run dev

# Terminal 3 — Admin Dashboard (port 5174)
cd admin
npm run dev
```

On first run in development mode, the server automatically seeds a **Super Admin** account using the credentials from your `.env` file.

---

## Architecture

### Server Architecture

The server follows a standard **MVC pattern** with Express.js:

```
Request → Middleware Pipeline → Route → Controller → Model → Response
```

**Middleware pipeline** (applied in order):

1. **CORS** — Whitelisted origins (production domains + localhost)
2. **Helmet** — Security headers
3. **Compression** — Gzip response compression
4. **Rate Limiting** — 100 req/15min (API), 20 req/15min (auth endpoints)
5. **Body Parser** — JSON & URL-encoded (10MB limit)
6. **Request Logger** — Custom logging middleware
7. **Morgan** — HTTP request logging (dev only)

**Controller pattern:**

- Every controller uses `try/catch` with standardized JSON responses
- File uploads use `multer` memory storage → uploaded to Cloudinary via `uploadService.js`
- All entities support soft-delete (`isDeleted` + `deletedAt` fields)
- Audit logging tracks create/update/delete operations

### Admin Panel Architecture

```
App.jsx (Router)
├── AuthLayout          → Login, Forgot Password, Reset Password
└── DashboardLayout     → Sidebar + Header
    ├── Dashboard       → Stats, charts, recent activity
    ├── Entity Pages    → List (DataTable) + Form (Create/Edit)
    ├── Audit Logs      → Activity history
    └── Profile         → Admin profile, password, 2FA
```

**State management:**

- **Zustand** — Auth state (token, user, permissions)
- **TanStack Query** — All server data (caching, invalidation, optimistic updates)
- **React Hook Form + Zod** — Form state with schema validation

**Key shared components:**

| Component | Purpose |
|-----------|---------|
| `DataTable` | Sortable, filterable data tables with pagination |
| `ImageUploader` | Single image upload with preview, replace, remove |
| `MultiImageUploader` | Gallery-style multi-image upload |
| `RichTextEditor` | WYSIWYG content editor |
| `TagInput` | Tokenized tag/keyword input |
| `SearchFilter` | Debounced search with filter dropdowns |
| `StatusBadge` | Color-coded status indicators |
| `ConfirmDialog` | Delete confirmation modals |

### Webapp Architecture

The public website consumes the server's **public API endpoints** (`/api/*/public`) and renders content dynamically:

```
App.jsx (Router)
└── MainLayout          → Navbar + Footer
    ├── Home            → Hero, Services, Testimonials, Blog, CTA
    ├── Blog            → Listing + Detail (by slug)
    ├── Articles        → Listing + Detail (by slug)
    ├── Services        → Listing + Detail (by slug)
    ├── Portfolio       → Project showcase grid
    ├── Case Studies    → Listing + Detail
    ├── Testimonials    → Client testimonial wall
    ├── Careers         → Job listings + Application form
    ├── Resources       → Downloadable content library
    ├── Contact         → Contact form (submits to API)
    └── Static Pages    → About, Privacy Policy, Terms
```

---

## API Reference

All API routes are prefixed with `/api`. Public routes don't require authentication. Admin routes require a valid JWT Bearer token.

### Public Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/health` | Server health check |
| `GET` | `/api/blogs/public` | Published blogs (paginated) |
| `GET` | `/api/blogs/public/:slug` | Single blog by slug |
| `GET` | `/api/articles/public` | Published articles |
| `GET` | `/api/articles/public/:slug` | Single article by slug |
| `GET` | `/api/services/public` | Published services |
| `GET` | `/api/services/public/:slug` | Single service by slug |
| `GET` | `/api/portfolios/public` | Published portfolios |
| `GET` | `/api/portfolios/public/:slug` | Single portfolio by slug |
| `GET` | `/api/case-studies/public` | Published case studies |
| `GET` | `/api/case-studies/public/:slug` | Single case study by slug |
| `GET` | `/api/testimonials/public` | Published testimonials |
| `GET` | `/api/careers/public` | Active job listings |
| `GET` | `/api/careers/public/:slug` | Single career listing |
| `POST` | `/api/careers/public/:id/apply` | Submit job application |
| `GET` | `/api/resources/public` | Published resources |
| `GET` | `/api/resources/public/:slug` | Single resource by slug |
| `POST` | `/api/contact` | Submit contact form |

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/login` | Admin login (returns JWT) |
| `POST` | `/api/auth/forgot-password` | Send password reset email |
| `POST` | `/api/auth/reset-password/:token` | Reset password with token |
| `POST` | `/api/auth/verify-2fa` | Verify TOTP 2FA code |

### Admin CRUD (Protected)

Each entity follows the same RESTful pattern:

| Method | Route Pattern | Action |
|--------|---------------|--------|
| `GET` | `/api/{entity}` | List all (paginated, filterable) |
| `GET` | `/api/{entity}/stats` | Aggregated statistics |
| `GET` | `/api/{entity}/:id` | Get by ID |
| `POST` | `/api/{entity}` | Create new |
| `PUT` | `/api/{entity}/:id` | Update existing |
| `DELETE` | `/api/{entity}/:id` | Soft delete |
| `PATCH` | `/api/{entity}/:id/publish` | Publish (where applicable) |
| `PATCH` | `/api/{entity}/:id/unpublish` | Unpublish (where applicable) |

**Entities:** `blogs`, `articles`, `services`, `portfolios`, `case-studies`, `testimonials`, `careers`, `resources`, `employees`, `projects`, `admins`

**Additional admin routes:**

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/dashboard` | Dashboard aggregate stats |
| `GET` | `/api/audit-logs` | Activity audit trail |
| `GET/PUT` | `/api/emails/templates` | Email template management |
| `POST` | `/api/emails/send` | Send email from admin |

---

## Authentication & Authorization

### JWT Flow

1. Admin submits credentials to `/api/auth/login`
2. Server validates credentials, returns JWT token
3. Client stores token in Zustand store (memory) + localStorage
4. All subsequent requests include `Authorization: Bearer <token>`
5. `protect` middleware verifies token on every admin route

### Role-Based Access Control (RBAC)

| Role | Permissions |
|------|-------------|
| `super_admin` | Full access to everything |
| `admin` | Configurable per-resource permissions (CRUD granularity) |
| `editor` | Content creation and editing |
| `viewer` | Read-only access |

Permissions are checked per route using the `checkPermission(resource, action)` middleware:

```js
router.put("/:id", checkPermission("blogs", "update"), updateBlog);
```

### Two-Factor Authentication (2FA)

Admins can enable TOTP-based 2FA from their profile:
1. Generate a secret → display QR code (via `speakeasy` + `qrcode`)
2. User scans with Google Authenticator / Authy
3. On login, if 2FA is enabled, a second verification step is required

---

## Media Management

### Upload Flow

```
Client (FormData) → Multer (memory buffer) → Cloudinary SDK → Store URL + publicId in MongoDB
```

- **Images** — max 5MB, formats: JPG, PNG, WebP, GIF, SVG
- **Documents** — max 20MB, formats: PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, CSV, TXT
- **Resumes** — max 10MB, formats: PDF, DOC, DOCX

### Image Deletion

Images are automatically deleted from Cloudinary when:

- A **new image replaces** an existing one (old image is deleted before upload)
- A user **removes an image** from a form without replacement (sends `removeCoverImage=true` flag)
- **Gallery items** are removed individually (sends `removeGalleryIds` with publicId array)

### Cloudinary Organization

Files are organized into folders on Cloudinary:

```
envalis/
├── blogs/           # Blog cover images & gallery
├── articles/        # Article cover images
├── services/        # Service cover & banner images
├── portfolios/      # Portfolio cover & gallery
├── case-studies/    # Case study cover, banner & gallery
├── testimonials/    # Client avatar images
├── employee-avatars/# Employee profile photos
├── resources/       # Resource cover images & files
└── careers/         # Resume uploads
```

---

## Database Models

| Model | Key Fields | Features |
|-------|------------|----------|
| **Admin** | email, role, permissions, twoFactorSecret | RBAC, 2FA, password change tracking |
| **Blog** | title, slug, content, coverImage, gallery, author | Auto-slug, read-time calc, scheduling |
| **Article** | title, slug, content, coverImage, author | Auto-slug, read-time calc |
| **Service** | title, slug, content, coverImage, bannerImage | Feature list, process steps |
| **Portfolio** | title, coverImage, gallery, client, results | Tech stack, testimonial embed |
| **CaseStudy** | title, overview, coverImage, bannerImage, gallery | Phases, metrics, challenge/solution |
| **Testimonial** | clientName, clientAvatar, quote, rating | Company, designation |
| **Employee** | firstName, lastName, avatar, department, salary | Education, skills, emergency contact |
| **Career** | title, slug, description, requirements | Applications, resume upload |
| **Resource** | title, coverImage, file, type, category | Download tracking, email gate |
| **Project** | title, description, status, team | Internal project tracking |
| **Contact** | name, email, message, status | Form submission management |
| **AuditLog** | action, entity, admin, changes | Activity tracking |
| **EmailLog** | to, subject, status, template | Email delivery tracking |
| **EmailTemplate** | name, subject, body, variables | Dynamic email templates |

All content models include:
- `status` — draft / published / archived
- `isDeleted` + `deletedAt` — soft delete
- `createdBy` + `updatedBy` — admin tracking
- `timestamps` — automatic createdAt / updatedAt

---

## Deployment

### Server (Vercel Serverless)

The server is configured for **Vercel** deployment:

- Exports `app` as default for serverless function handling
- Listens on port only in development mode
- CORS whitelist includes Vercel preview URLs (`*.vercel.app`)

```bash
cd server
vercel --prod
```

### Admin & Webapp (Vercel Static)

Both frontend packages are standard Vite apps:

```bash
# Build for production
cd admin && npm run build    # outputs to dist/
cd webapp && npm run build   # outputs to dist/

# Deploy
vercel --prod
```

### Production URLs

| Package | URL |
|---------|-----|
| Webapp | `https://envalistechnologies.com` |
| Admin | `https://admin.envalistechnologies.com` |
| API | `https://api.envalistechnologies.com` |

---

## Scripts Reference

### Server

| Script | Command | Description |
|--------|---------|-------------|
| `dev` | `nodemon src/server.js` | Start with hot reload |

### Admin & Webapp

| Script | Command | Description |
|--------|---------|-------------|
| `dev` | `vite` | Start dev server with HMR |
| `build` | `vite build` | Production build |
| `preview` | `vite preview` | Preview production build locally |
| `lint` | `eslint .` | Run ESLint |

---

## Contributing

1. **Fork** the repository
2. Create a **feature branch** (`git checkout -b feature/amazing-feature`)
3. **Commit** changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. Open a **Pull Request**

### Code Conventions

- **ES Modules** (`import/export`) throughout
- **Async/await** for all asynchronous operations
- **Consistent error handling** with try/catch in controllers
- **Soft deletes** — never hard-delete user data
- **Audit logging** — all admin mutations are tracked

---

## License

Distributed under the **Apache License 2.0**. See [LICENSE](./LICENSE) for details.

```
Copyright 2026 Envalis Technologies
```
