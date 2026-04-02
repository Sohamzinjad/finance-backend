# Finance Data Processing and Access Control Backend

Backend assessment project for a finance dashboard system using Node.js, Express, Prisma, and PostgreSQL.

## Overview

This project implements:

- JWT-based authentication
- Role-based access control with `VIEWER`, `ANALYST`, and `ADMIN`
- User management with active/inactive status
- Financial records CRUD with filtering, pagination, and soft delete
- Dashboard summary endpoints with aggregated analytics
- Centralized validation and error handling

The active API surface is:

- `/api/auth`
- `/api/users`
- `/api/records`
- `/api/dashboard`
- `/docs` for browser-based API documentation
- `/openapi.json` for the OpenAPI spec

The older `transactions` module remains in the repository as a deprecated legacy reference and is not mounted in the Express app.

## Tech Stack

- Node.js
- Express
- Prisma ORM
- PostgreSQL
- Zod
- JWT
- bcryptjs

## Data Model

Core models are defined in [`prisma/schema.prisma`](./prisma/schema.prisma):

- `User`
- `Transaction`
- `AuditLog`

Enums:

- `Role`: `VIEWER`, `ANALYST`, `ADMIN`
- `Status`: `ACTIVE`, `INACTIVE`
- `TransactionType`: `INCOME`, `EXPENSE`

## Role Model

- `VIEWER`
  - Can view dashboard data
  - Can list and read records
  - Cannot create, update, or delete records
- `ANALYST`
  - Can view dashboard data
  - Can create records
  - Can update and delete only their own records
- `ADMIN`
  - Full access to records
  - Full access to user management
  - Can view all dashboard analytics

## Authentication Behavior

- `POST /api/auth/register` always creates a `VIEWER` account
- Elevated roles are managed through admin-controlled user updates
- `POST /api/auth/login` returns a JWT used in `Authorization: Bearer <token>`

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create your environment file:

```bash
cp .env.example .env
```

3. Update `.env` with a valid PostgreSQL connection string and JWT secret.

4. Run database migration:

```bash
npm run migrate
```

5. Seed sample users and records:

```bash
npm run seed
```

6. Start the app:

```bash
npm run dev
```

## Environment Variables

See [`.env.example`](./.env.example).

- `DATABASE_URL`
- `JWT_SECRET`
- `PORT`
- `NODE_ENV`

## API Summary

### Health

- `GET /health`

Response:

```json
{
  "status": "ok",
  "timestamp": "2026-04-02T10:00:00.000Z"
}
```

### Auth

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/profile`

Example register request:

```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "Password1"
}
```

### Users

Admin-only endpoints:

- `GET /api/users`
- `GET /api/users/:id`
- `PATCH /api/users/:id`
- `PATCH /api/users/:id/deactivate`
- `DELETE /api/users/:id`

Supported query filters:

- `role`
- `status`
- `page`
- `limit`

### Records

- `POST /api/records`
- `GET /api/records`
- `GET /api/records/:id`
- `PATCH /api/records/:id`
- `DELETE /api/records/:id`

Supported record filters:

- `type`
- `category`
- `startDate`
- `endDate`
- `userId`
- `page`
- `limit`

Example create request:

```json
{
  "amount": 2500,
  "type": "INCOME",
  "category": "Consulting",
  "date": "2026-04-01T00:00:00.000Z",
  "notes": "Client invoice"
}
```

### Dashboard

- `GET /api/dashboard/summary`
- `GET /api/dashboard/by-category?type=INCOME`
- `GET /api/dashboard/trends?year=2026`
- `GET /api/dashboard/recent?limit=10`

## Validation and Error Handling

- Request validation is handled with Zod
- Standard success and error response helpers are used across modules
- Prisma, JWT, and validation errors are normalized in a global error handler

## Testing

Run the smoke/integration-style test suite:

```bash
npm test
```

The tests exercise:

- app health check
- registration role behavior
- record access control
- paginated record listing
- dashboard summary access and aggregation behavior

The test suite stubs the Prisma singleton in memory, so it does not require a live database.

## Assumptions and Tradeoffs

- Self-registration is allowed, but new users always start as `VIEWER`
- User role changes are admin-controlled through the users module
- Records are soft-deleted using `deletedAt`
- Dashboard analytics exclude soft-deleted records
- The project prioritizes clarity and maintainability over production-grade infrastructure
- Audit logs are modeled in Prisma but not yet fully implemented in the service layer

## Suggested Manual Checks

After seeding, log in with:

- `admin@finance.com` / `Admin@123`
- `analyst@finance.com` / `Analyst@123`
- `viewer@finance.com` / `Viewer@123`

Then verify:

- viewers cannot create or modify records
- analysts can only modify their own records
- admins can manage users and all records
- dashboard summaries exclude soft-deleted records
