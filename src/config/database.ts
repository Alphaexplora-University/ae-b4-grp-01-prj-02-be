import pg from "pg";

const { Pool } = pg;

let cachedClient: pg.Pool | null = null;

export function createDatabaseClient(connectionString: string): pg.Pool {
  if (cachedClient) {
    return cachedClient;
  }

  cachedClient = new Pool({
    connectionString,
    max: 10,
    idleTimeoutMillis: 30000,
  });

  return cachedClient;
}

export async function initializeDatabaseSchema(database: pg.Pool): Promise<void> {
  await database.query(`
    create extension if not exists "pgcrypto";

    create table if not exists public.vendors (
      id uuid primary key default gen_random_uuid(),
      owner_user_id uuid not null,
      business_name text not null,
      description text not null,
      location text not null,
      contact_email text not null,
      contact_phone text,
      password_hash text,
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
  `);
}
