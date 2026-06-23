# Vendor Catalog Backend

Standalone Node.js + TypeScript backend for the Vendor Catalog Customer Inquiry system.

This backend follows the layered Express architecture requested for the project:

- `config`: app configuration, environment values, and dependency wiring.
- `routes`: URL path definitions and middleware attachment.
- `controllers`: request handling and response orchestration.
- `services`: business rules and workflow logic.
- `repositories`: data access, query abstractions, and seed data.
- `middlewares`: auth guards, validation schemas, HTTP errors, and error handlers.
- `types`: shared TypeScript contracts used across layers.

Admin and Super-Admin scope is intentionally excluded.

## Structure

```text
src/
├── config/
│   ├── app-config.ts
│   └── dependencies.ts
├── routes/
│   ├── catalog.routes.ts
│   └── inquiry.routes.ts
├── controllers/
│   ├── catalog.controller.ts
│   └── inquiry.controller.ts
├── services/
│   ├── catalog.service.ts
│   └── inquiry.service.ts
├── repositories/
│   ├── id.ts
│   ├── in-memory-repositories.ts
│   ├── repository.types.ts
│   └── seed.ts
├── middlewares/
│   ├── error-handler.ts
│   ├── http-errors.ts
│   ├── validation-schemas.ts
│   └── vendor-auth.ts
├── types/
│   └── entities.ts
├── app.ts
└── server.ts
```

## Current Scope

- Customers submit inquiries for catalog items.
- Vendors fetch inquiries sent to their vendor profile.
- Vendors create, update, archive, and delete their own catalog listings.

## API Endpoints

```text
GET    /api/catalog-items
POST   /api/inquiries
GET    /api/vendors/:vendorId/inquiries
POST   /api/vendors/:vendorId/catalog-items
PATCH  /api/vendors/:vendorId/catalog-items/:itemId
DELETE /api/vendors/:vendorId/catalog-items/:itemId
```

Vendor routes expect `x-vendor-id` to match the `:vendorId` route param. This is a lightweight placeholder for real vendor authentication.

## Run

```bash
npm install
npm run dev
```

Default API URL:

```text
http://localhost:4000
```

## Scripts

```bash
npm run dev
npm run build
npm run typecheck
npm run lint
```
