# Vendor Catalog Backend

Basic CRUD backend for vendors, catalog items, and inquiries, with simple local vendor auth.

## API

```text
GET    /health

POST   /api/auth/signup
POST   /api/auth/login

GET    /api/vendors
POST   /api/vendors
GET    /api/vendors/:vendorId
PATCH  /api/vendors/:vendorId
DELETE /api/vendors/:vendorId

GET    /api/catalog-items
POST   /api/catalog-items
POST   /api/catalog-items/drafts
GET    /api/catalog-items/:itemId
PATCH  /api/catalog-items/:itemId
POST   /api/catalog-items/:itemId/publish
POST   /api/catalog-items/:itemId/archive
DELETE /api/catalog-items/:itemId

GET    /api/inquiries
POST   /api/inquiries
GET    /api/inquiries/:inquiryId
PATCH  /api/inquiries/:inquiryId
DELETE /api/inquiries/:inquiryId
```

## Example Bodies

Signup vendor:

```json
{
  "email": "vendor@example.com",
  "password": "Password123!",
  "businessName": "Test Vendor Studio",
  "description": "A sample vendor profile for auth testing.",
  "location": "Makati",
  "contactEmail": "vendor@example.com",
  "contactPhone": "+63 917 333 4444"
}
```

Login vendor:

```json
{
  "email": "vendor@example.com",
  "password": "Password123!"
}
```

Create vendor directly:

```json
{
  "ownerUserId": "2dbd9a4f-e61a-4eaa-918b-c0f5b9b244e5",
  "businessName": "Test Vendor Studio",
  "description": "A sample vendor profile for CRUD testing.",
  "location": "Makati",
  "contactEmail": "testvendor@example.com",
  "contactPhone": "+63 917 333 4444"
}
```

Create catalog item:

```json
{
  "vendorId": "0f7dd1b5-e8f9-4dcc-96ce-3172f3ac02b2",
  "name": "Family Celebration Buffet",
  "category": "Catering",
  "description": "Buffet package for birthdays and reunions.",
  "priceFrom": 45000,
  "location": "Makati",
  "availabilityTags": ["weekends", "indoor"],
  "status": "active"
}
```

Create inquiry:

```json
{
  "vendorId": "0f7dd1b5-e8f9-4dcc-96ce-3172f3ac02b2",
  "catalogItemId": "a1a559a7-6a1c-49a5-8d77-c9771698de3d",
  "customerName": "Jane Customer",
  "customerEmail": "jane@example.com",
  "customerPhone": "+63 917 555 5555",
  "eventType": "Birthday Party",
  "eventDate": "2026-07-01",
  "message": "I want to ask about availability and package inclusions."
}
```

Update inquiry:

```json
{
  "status": "reviewed",
  "message": "Customer asked for a revised quotation."
}
```

## Environment

`.env`

```text
PORT=4000
WEB_ORIGIN=http://localhost:5173
JSON_LIMIT=1mb
DATABASE_URL=postgresql://postgres:password@db.project-ref.supabase.co:5432/postgres
JWT_SECRET=change-this-secret
```

## Database Notes

When `DATABASE_URL` is set, the backend now attempts to create these tables automatically on startup:

- `vendors`
- `catalog_items`
- `inquiries`

It also creates the `password_hash` column and the `updated_at` triggers automatically.

This means a fresh Supabase database should initialize itself as soon as the server starts, as long as the connected user has permission to create tables, functions, and triggers.

## Run

```bash
npm install
npm run dev
```

## Notes

- When `DATABASE_URL` is not set, the app uses the in-memory seed data in [src/repositories/seed.ts](/C:/Users/Vincent%20Paul/Documents/dev/ae-b4-grp-01-prj-02-be/src/repositories/seed.ts).
- Login returns a JWT, but the CRUD routes are still open and do not yet enforce token auth.
