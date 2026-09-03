# Brandify

Brandify is an e-commerce platform built around a single-brand storefront (think: one brand's own online shop rather than a multi-vendor marketplace). This repository currently contains the **backend REST API**; the Flutter mobile frontend is being developed separately and is not yet part of this codebase.

> **Status: Work in progress.** The backend covers the core commerce flow end-to-end (auth, catalog, cart, orders, discounts, reviews, notifications), but it has not been deployed or connected to a finished frontend yet. See [Project Status & Known Limitations](#project-status--known-limitations) below.

## Table of Contents

- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Features](#features)
- [API Overview](#api-overview)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Running Tests](#running-tests)
- [Project Status & Known Limitations](#project-status--known-limitations)
- [Folder Structure](#folder-structure)

## Tech Stack

- **Runtime:** Node.js + Express
- **Database:** MongoDB with Mongoose
- **Auth:** JWT-based authentication, role-based access control (`user` / `admin`)
- **File uploads:** Multer (product images, brand logo)
- **Email:** Nodemailer (password reset, email verification via OTP)
- **Testing:** Jest + Supertest, with `mongodb-memory-server` so tests run against an in-memory database (no live MongoDB instance needed)

## Architecture

The backend follows a **feature-based structure**: instead of grouping files globally by type (all controllers together, all models together), each business feature owns its own slice of the stack:

```
features/<feature-name>/
  controllers/   # request handling
  services/      # business logic / DB access
  models/        # Mongoose schemas
  routes/        # Express route definitions
  tests/         # feature-specific tests (where present)
```

Shared, cross-feature concerns live outside `features/`:

- `middleware/authentication` — verifies the JWT and attaches the user to the request
- `middleware/roles` — restricts routes to specific roles (e.g. `admin`-only)
- `middleware/fileUpload` — Multer configuration for image uploads
- `utils/` — token signing/verification, email sending, OTP generation, query-filter building

## Features

| Feature | What it does |
|---|---|
| **Users** | Registration, login, email verification via OTP, password reset via email, profile fetch/update/delete, paginated admin user listing |
| **Products** | CRUD for products (admin-only writes), public browsing/filtering, image upload (up to 5 images) |
| **Categories & Subcategories** | CRUD (admin-only writes), browsing products by category |
| **Brand** | Single brand profile (name, description, logo, social links, contact info, store location) — create/update/delete is admin-only |
| **Cart** | Add/update/remove items, supports per-item customizations |
| **Orders** | Place an order, view own orders (user), view/update/delete any order (admin), discount code applied at checkout |
| **Discounts** | Admin-managed discount codes with percentage, min/max amount rules, expiration, and usage tracking |
| **Reviews** | Users can review products (rating + comment), fetch product reviews / top-rated reviews |
| **Notifications** | Admin-created notifications, per-user or broadcast, read/unread tracking |

## API Overview

All routes are mounted from `Backend/app.js`. Endpoints marked 🔒 require a valid JWT; 🔒👑 additionally require the `admin` role.

| Base path | Examples |
|---|---|
| `/users` | `POST /register`, `POST /login`, `POST /request-password-reset`, `POST /reset-password/:token`, `POST /verify-email`, 🔒 `GET/PUT /:id`, 🔒👑 `DELETE /:id`, `GET /` |
| `/products` | `GET /`, `GET /:id`, 🔒👑 `POST /`, `PUT /:id`, `DELETE /:id` |
| `/Category` | `GET /`, `GET /:name/products`, 🔒👑 `POST /`, `PUT /:id`, `DELETE /:id` |
| `/subcategory` | `GET /`, `GET /:id`, 🔒👑 `POST /`, `PUT /:id`, `DELETE /:id` |
| `/brand` | `GET /`, 🔒👑 `POST /`, `PUT /`, `DELETE /` |
| `/Cart` | 🔒 `POST /`, `GET /`, `PUT /`, `DELETE /:productId`, `DELETE /` |
| `/order` | 🔒 `POST /`, `GET /` (own orders), 🔒👑 `GET /allOrders`, `GET /:id`, `PUT /:id`, `DELETE /:id` |
| `/discounts` | 🔒👑 `POST /`, `GET /:code`, `GET /`, `PUT /:code`, `DELETE /:code` |
| `/reviews` | `GET /`, `GET /top`, 🔒 `POST /`, `DELETE /:id` |
| `/notifications` | 🔒👑 `POST /`, 🔒 `GET /:userId`, `PUT /:id`, `DELETE /:id` |

Responses generally follow the shape `{ success: boolean, data?: ..., message?: string }`.

A more detailed reference for the Users API (request/response bodies, error cases) is in [`Backend/features/users/documentation/readme.md`](Backend/features/users/documentation/readme.md); the same level of detail hasn't been written up yet for the other features.

## Getting Started

1. **Clone and install**

   ```bash
   git clone https://github.com/karim029/Brandify.git
   cd Brandify/Backend
   npm install
   ```

2. **Set up MongoDB** — either run it locally or use a hosted connection string (e.g. MongoDB Atlas).

3. **Create a `.env` file** inside `Backend/` (see [Environment Variables](#environment-variables) below).

4. **Run the server**

   ```bash
   npm run dev
   ```

   The API will be available at `http://localhost:5000` (or whatever `PORT` you set).

## Environment Variables

Create `Backend/.env` with the following:

```bash
PORT=5000
MONGO_URL=mongodb://localhost:27017/brandify
JWT_SECRET=your_jwt_secret

# Required for password reset / email verification emails
EMAIL_USER=your_gmail_address@gmail.com
EMAIL_PASS=your_gmail_app_password
```

Uploaded files (product images, brand logo) are written to `Backend/uploads/`, which is created automatically on first run and served statically at `/uploads`.

## Running Tests

```bash
cd Backend
npm test
```

Tests spin up an in-memory MongoDB instance (`mongodb-memory-server`), so no separate database setup is needed to run them. Coverage currently exists for the **Users** and **Products** features; other features don't have automated tests yet.

## Project Status & Known Limitations

This is an in-progress project, not a finished product. Worth flagging explicitly:

- **Frontend is not in this repo yet.** The `Frontend/` folder only contains generated platform scaffolding (iOS/Linux/macOS/Windows config) left over from a Flutter project setup — the actual Flutter app code has been deliberately excluded (see `.gitignore` and the `removed unnecessary frontend files` commit). The mobile app is being built separately.
- **Test coverage is partial.** Only the Users and Products features have automated tests; Cart, Orders, Discounts, Brand, Category, Subcategory, Reviews, and Notifications do not yet.
- **No CI/CD, no deployment.** The project has only been run and tested locally so far.
- **No API documentation tooling** (e.g. Swagger/OpenAPI) — the table above and the Users feature doc are the only current references.
- **Single-brand assumption.** The `Brand` model represents one store profile, not a multi-vendor marketplace — this is a deliberate scope decision, not an oversight.

## Folder Structure

```
Brandify/
├── Backend/
│   ├── app.js                # Express app setup, route mounting
│   ├── index.js               # Server entry point
│   ├── config/
│   │   └── db.js              # MongoDB connection
│   ├── features/
│   │   ├── users/
│   │   ├── products/
│   │   ├── Category/
│   │   ├── subcategory/
│   │   ├── Brand/
│   │   ├── Cart/
│   │   ├── order/
│   │   ├── discount/
│   │   ├── reviews/
│   │   └── notifications/
│   │       └── (each: controllers/ services/ models/ routes/ [tests/])
│   ├── middleware/
│   │   ├── authentication/
│   │   ├── roles/
│   │   └── fileUpload/
│   └── utils/
└── Frontend/                  # Flutter platform scaffolding only (see Known Limitations)
```
