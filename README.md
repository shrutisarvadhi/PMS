# Project Management System Backend

A secure RESTful API for the PMS application built with Node.js, Express, TypeScript, PostgreSQL, and Sequelize. It provides authentication, RBAC enforcement, and CRUD endpoints for users, employees, projects, tasks, timesheets, and timelogs.

## Prerequisites

- Node.js 18+
- npm 9+
- PostgreSQL 13+
- The `uuid-ossp` extension enabled on the target database (migrations will create it if missing).

## Environment Variables

Copy `PMSB/.env` to `PMSB/.env.local` (or update the existing file) and set the values to match your environment.

```
PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_password
DB_DATABASE=pms_db
JWT_SECRET=replace-with-strong-secret
JWT_EXPIRES_IN=1h
```

Optional: set `DATABASE_URL` for production-style single-string configuration or `DB_SSL=true` when using SSL connections.

## Installation

```bash
cd PMSB
npm install
```

## Database Setup

Run migrations (build step required because migrations load compiled models):

```bash
npm run db:migrate
```

Seed the database with sample users, employees, projects, tasks, timesheets, and timelogs:

```bash
npm run db:seed
```

You can reset the database with:

```bash
npm run db:reset
```

## Development Workflow

- **Type checking / build:** `npm run build`
- **Watch mode:** `npm run dev`
- **Production start (after build):** `npm run start`

The Express app lives in `src/app.ts`; the HTTP server bootstrap is in `src/server.ts`.

## Project Structure

```
PMSB/
  src/
    config/       // environment + sequelize configuration
    controllers/  // request handlers
    dtos/         // DTO and response typings
    middleware/   // auth, validation, error handling
    models/       // typed Sequelize models
    routes/       // Express routers per resource
    services/     // business logic & database access
    utils/        // shared helpers (logger, jwt, async wrapper)
  migrations/     // Sequelize migrations
  seeders/        // Sequelize seeders
  logs/           // Winston error log output (logs/error.log)
```

## Authentication & RBAC

- `POST /api/auth/register` creates an Employee user with a hashed password and returns a JWT.
- `POST /api/auth/login` validates credentials and returns a JWT that encodes `sub`, `username`, `role`, `iat`, and `exp`.
- Attach the token as `Authorization: Bearer <token>` for protected routes.
- Roles:
  - **Admin:** full CRUD across all endpoints.
  - **Project Manager:** full control of projects/tasks they manage; read access to employees they manage, timesheets, and timelogs.
  - **Employee:** read-only access to projects, tasks (assigned to them), their own employee profile, timesheets, and timelogs.

## Logging & Validation

- Requests failing validation or business rules throw structured `AppError` instances handled by `errorHandler`.
- Validation is enforced via `express-validator` definitions per route.
- Errors are logged with Winston (console + `logs/error.log`) including timestamps, endpoint, userId, sanitized body, and stack traces.

## Running Tests

_No automated tests are configured yet. Use `npm run build` to ensure type-safety._

## Next Steps

- Add automated integration/unit tests (e.g., Jest + Supertest).
- Deploy migrations/seeders via CI/CD pipeline.
- Extend validation schemas to cover additional business rules as required.
