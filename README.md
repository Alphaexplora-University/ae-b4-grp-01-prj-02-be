# Vendor Catalog Backend

Standalone Node.js + TypeScript backend for the Vendor Catalog Customer Inquiry system.

This backend now follows a feature-based Express architecture with shared infrastructure:

- `config`: app configuration, database/auth clients, and dependency wiring.
- `shared`: cross-cutting middleware and reusable utilities.
- `auth`, `vendor`, `catalog`, `inquiry`: self-contained feature modules with their own routes, controllers, services, and validators.
- `repositories`: data access, query abstractions, and seed data.
- `types`: shared TypeScript contracts used across the backend.

Admin and Super-Admin scope is intentionally excluded.

## Structure

```text
src/
|-- auth/
|   |-- auth.routes.ts
|   |-- auth.controller.ts
|   |-- auth.service.ts
|   `-- auth.validator.ts
|-- catalog/
|   |-- catalog.routes.ts
|   |-- catalog.controller.ts
|   |-- catalog.service.ts
|   `-- catalog.validator.ts
|-- inquiry/
|   |-- inquiry.routes.ts
|   |-- inquiry.controller.ts
|   |-- inquiry.service.ts
|   `-- inquiry.validator.ts
|-- vendor/
|   |-- vendor.routes.ts
|   |-- vendor.controller.ts
|   |-- vendor.service.ts
|   `-- vendor.validator.ts
|-- shared/
|   |-- middleware/
|   |   |-- auth.middleware.ts
|   |   `-- error.middleware.ts
|   `-- utils/
|       |-- app-error.ts
|       `-- route-params.ts
|-- config/
|   |-- app-config.ts
|   |-- database.ts
|   |-- dependencies.ts
|   `-- supabase-auth.ts
|-- repositories/
|   |-- id.ts
|   |-- in-memory-repositories.ts
|   |-- repository.types.ts
|   |-- seed.ts
|   `-- supabase-repositories.ts
|-- types/
|   |-- entities.ts
|   `-- express.d.ts
|-- app.ts
`-- server.ts
```

## Current Scope

- Customers submit inquiries for catalog items.
- Vendors fetch inquiries sent to their vendor profile.
- Vendors create, update, archive, and delete their own catalog listings.

## API Endpoints

```text
POST   /api/auth/login
POST   /api/auth/signup
GET    /api/catalog-items
GET    /api/catalog-items/:itemId
POST   /api/inquiries
GET    /api/vendors/:vendorId
GET    /api/vendors/me
PATCH  /api/vendors/me
GET    /api/vendors/:vendorId/inquiries
PATCH  /api/vendors/:vendorId/inquiries/:inquiryId/status
GET    /api/vendors/:vendorId/catalog-items
POST   /api/vendors/:vendorId/catalog-items
PATCH  /api/vendors/:vendorId/catalog-items/:itemId
DELETE /api/vendors/:vendorId/catalog-items/:itemId
```

Protected vendor routes require a bearer token and enforce vendor ownership through the shared auth middleware.

## Run

```bash
npm install
npm run dev
```

Default API URL:

```text
http://localhost:4000
```

## Supabase Setup

The backend supports Supabase-authenticated vendors plus PostgreSQL-backed persistence. If `DATABASE_URL` is set, the API uses the Postgres repositories. If it is missing, it falls back to the in-memory demo repositories. If `SUPABASE_URL` and a backend auth key are set, vendor login/signup and bearer-token auth are enabled.

### 1. Create the tables in Supabase

Run this SQL in the Supabase SQL editor:

```sql
create extension if not exists "pgcrypto";

create table if not exists public.vendors (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null,
  business_name text not null,
  description text not null,
  location text not null,
  contact_email text not null,
  contact_phone text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.catalog_items (
  id uuid primary key default gen_random_uuid(),
  vendor_id uuid not null references public.vendors(id) on delete cascade,
  name text not null,
  category text not null,
  description text not null,
  price_from numeric,
  location text not null,
  availability_tags text[] not null default '{}',
  status text not null check (status in ('active', 'draft', 'archived')),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.inquiries (
  id uuid primary key default gen_random_uuid(),
  vendor_id uuid not null references public.vendors(id) on delete cascade,
  catalog_item_id uuid not null references public.catalog_items(id) on delete cascade,
  customer_name text not null,
  customer_email text not null,
  customer_phone text,
  event_type text not null,
  event_date date,
  message text not null,
  status text not null default 'new' check (status in ('new', 'reviewed', 'closed')),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists set_vendors_updated_at on public.vendors;
create trigger set_vendors_updated_at
before update on public.vendors
for each row
execute function public.set_updated_at();

drop trigger if exists set_catalog_items_updated_at on public.catalog_items;
create trigger set_catalog_items_updated_at
before update on public.catalog_items
for each row
execute function public.set_updated_at();

drop trigger if exists set_inquiries_updated_at on public.inquiries;
create trigger set_inquiries_updated_at
before update on public.inquiries
for each row
execute function public.set_updated_at();
```

### 2. Seed at least one vendor

Example:

```sql
insert into public.vendors (
  id,
  owner_user_id,
  business_name,
  description,
  location,
  contact_email,
  contact_phone
) values (
  '0f7dd1b5-e8f9-4dcc-96ce-3172f3ac02b2',
  '2dbd9a4f-e61a-4eaa-918b-c0f5b9b244e5',
  'Liora Table Catering',
  'Seasonal buffet and plated menus for personal events.',
  'Makati',
  'hello@lioratable.example',
  '+63 917 100 1200'
)
on conflict (id) do nothing;
```

### 3. Add your backend env file

Create `.env` in the backend root:

```text
PORT=4000
WEB_ORIGIN=http://localhost:5173
DATABASE_URL=postgresql://postgres:password@db.project-ref.supabase.co:5432/postgres
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

Use the service role key on the backend only.

## Scripts

```bash
npm run dev
npm run build
npm run typecheck
npm run lint
```
