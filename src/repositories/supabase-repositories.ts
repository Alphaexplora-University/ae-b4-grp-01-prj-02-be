import type { CatalogItem, Inquiry, Vendor } from "../types/entities.js";
import type {
  CatalogItemFilters,
  CatalogItemRepository,
  CreateVendorInput,
  InquiryRepository,
  VendorAuthRecord,
  VendorRepository,
} from "./repository.types.js";
import type { Pool, QueryResult, QueryResultRow } from "pg";

interface VendorRow {
  id: string;
  owner_user_id: string;
  business_name: string;
  description: string;
  location: string;
  contact_email: string;
  contact_phone: string | null;
  password_hash?: string | null;
  created_at: string;
  updated_at: string;
}

interface CatalogItemRow {
  id: string;
  vendor_id: string;
  name: string;
  category: string;
  description: string;
  price_from: number | null;
  location: string;
  availability_tags: string[] | null;
  status: CatalogItem["status"];
  created_at: string;
  updated_at: string;
}

interface InquiryRow {
  id: string;
  vendor_id: string;
  catalog_item_id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string | null;
  event_type: string;
  event_date: string | null;
  message: string;
  status: Inquiry["status"];
  created_at: string;
  updated_at: string;
}

function mapVendor(row: VendorRow): Vendor {
  return {
    id: row.id,
    ownerUserId: row.owner_user_id,
    businessName: row.business_name,
    description: row.description,
    location: row.location,
    contactEmail: row.contact_email,
    contactPhone: row.contact_phone ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapCatalogItem(row: CatalogItemRow): CatalogItem {
  return {
    id: row.id,
    vendorId: row.vendor_id,
    name: row.name,
    category: row.category,
    description: row.description,
    priceFrom: row.price_from ?? undefined,
    location: row.location,
    availabilityTags: row.availability_tags ?? [],
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapInquiry(row: InquiryRow): Inquiry {
  return {
    id: row.id,
    vendorId: row.vendor_id,
    catalogItemId: row.catalog_item_id,
    customerName: row.customer_name,
    customerEmail: row.customer_email,
    customerPhone: row.customer_phone ?? undefined,
    eventType: row.event_type,
    eventDate: row.event_date ?? undefined,
    message: row.message,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapRows<T extends QueryResultRow>(result: QueryResult<T>): T[] {
  return result.rows;
}

export class PostgresVendorRepository implements VendorRepository {
  constructor(private readonly database: Pool) {}

  async findMany(): Promise<Vendor[]> {
    const rows = mapRows(await this.database.query<VendorRow>(
      `select *
       from vendors
       order by business_name asc`,
    ));

    return rows.map(mapVendor);
  }

  async findById(id: string): Promise<Vendor | null> {
    const rows = mapRows(await this.database.query<VendorRow>(
      `select *
       from vendors
       where id = $1
       limit 1`,
      [id],
    ));

    return rows[0] ? mapVendor(rows[0]) : null;
  }

  async findAuthByEmail(email: string): Promise<VendorAuthRecord | null> {
    const rows = mapRows(await this.database.query<VendorRow>(
      `select *
       from vendors
       where lower(contact_email) = lower($1)
       limit 1`,
      [email],
    ));

    const [row] = rows;
    if (!row?.password_hash) {
      return null;
    }

    return {
      vendor: mapVendor(row),
      passwordHash: row.password_hash,
    };
  }

  async create(input: CreateVendorInput): Promise<Vendor> {
    const rows = mapRows(await this.database.query<VendorRow>(
      `insert into vendors (
         owner_user_id,
         business_name,
         description,
         location,
         contact_email,
         contact_phone,
         password_hash
       ) values ($1, $2, $3, $4, $5, $6, $7)
       returning *`,
      [
        input.ownerUserId,
        input.businessName,
        input.description,
        input.location,
        input.contactEmail,
        input.contactPhone ?? null,
        input.passwordHash ?? null,
      ],
    ));

    const [createdRow] = rows;
    if (!createdRow) {
      throw new Error("Database vendor creation returned no rows");
    }

    return mapVendor(createdRow);
  }

  async update(
    id: string,
    input: Partial<Omit<Vendor, "id" | "ownerUserId" | "createdAt" | "updatedAt">>,
  ): Promise<Vendor | null> {
    const rows = mapRows(await this.database.query<VendorRow>(
      `update vendors
       set
         business_name = coalesce($1, business_name),
         description = coalesce($2, description),
         location = coalesce($3, location),
         contact_email = coalesce($4, contact_email),
         contact_phone = coalesce($5, contact_phone),
         updated_at = now()
       where id = $6
       returning *`,
      [
        input.businessName ?? null,
        input.description ?? null,
        input.location ?? null,
        input.contactEmail ?? null,
        input.contactPhone ?? null,
        id,
      ],
    ));

    return rows[0] ? mapVendor(rows[0]) : null;
  }

  async delete(id: string): Promise<boolean> {
    const rows = mapRows(await this.database.query<{ id: string }>(
      `delete from vendors
       where id = $1
       returning id`,
      [id],
    ));

    return rows.length > 0;
  }
}

export class PostgresCatalogItemRepository implements CatalogItemRepository {
  constructor(private readonly database: Pool) {}

  async findMany(filters: CatalogItemFilters): Promise<CatalogItem[]> {
    const values: unknown[] = [];
    const where: string[] = [];

    if (filters.vendorId) {
      values.push(filters.vendorId);
      where.push(`vendor_id = $${values.length}`);
    }

    if (!filters.includeInactive) {
      values.push("active");
      where.push(`status = $${values.length}`);
    }

    const query = `select *
       from catalog_items
       ${where.length > 0 ? `where ${where.join(" and ")}` : ""}
       order by name asc`;
    const rows = mapRows(await this.database.query<CatalogItemRow>(query, values));

    return rows
      .map(mapCatalogItem)
      .filter((item) => !filters.category || item.category.toLowerCase() === filters.category.toLowerCase())
      .filter((item) => !filters.location || item.location.toLowerCase().includes(filters.location.toLowerCase()))
      .filter((item) => !filters.availabilityTag || item.availabilityTags.some((tag) => tag.toLowerCase() === filters.availabilityTag?.toLowerCase()))
      .filter((item) => {
        if (!filters.search) {
          return true;
        }

        const search = filters.search.toLowerCase();
        return `${item.name} ${item.description} ${item.category}`.toLowerCase().includes(search);
      });
  }

  async findById(id: string): Promise<CatalogItem | null> {
    const rows = mapRows(await this.database.query<CatalogItemRow>(
      `select *
       from catalog_items
       where id = $1
       limit 1`,
      [id],
    ));

    return rows[0] ? mapCatalogItem(rows[0]) : null;
  }

  async create(input: Omit<CatalogItem, "id" | "createdAt" | "updatedAt">): Promise<CatalogItem> {
    const rows = mapRows(await this.database.query<CatalogItemRow>(
      `insert into catalog_items (
         vendor_id,
         name,
         category,
         description,
         price_from,
         location,
         availability_tags,
         status
       ) values ($1, $2, $3, $4, $5, $6, $7, $8)
       returning *`,
      [
        input.vendorId,
        input.name,
        input.category,
        input.description,
        input.priceFrom ?? null,
        input.location,
        input.availabilityTags,
        input.status,
      ],
    ));

    const [createdRow] = rows;
    if (!createdRow) {
      throw new Error("Database catalog item creation returned no rows");
    }

    return mapCatalogItem(createdRow);
  }

  async update(
    id: string,
    input: Partial<Omit<CatalogItem, "id" | "vendorId" | "createdAt" | "updatedAt">>,
  ): Promise<CatalogItem | null> {
    const rows = mapRows(await this.database.query<CatalogItemRow>(
      `update catalog_items
       set
         name = coalesce($1, name),
         category = coalesce($2, category),
         description = coalesce($3, description),
         price_from = coalesce($4, price_from),
         location = coalesce($5, location),
         availability_tags = coalesce($6, availability_tags),
         status = coalesce($7, status),
         updated_at = now()
       where id = $8
       returning *`,
      [
        input.name ?? null,
        input.category ?? null,
        input.description ?? null,
        input.priceFrom ?? null,
        input.location ?? null,
        input.availabilityTags ?? null,
        input.status ?? null,
        id,
      ],
    ));

    const [updatedRow] = rows;
    return updatedRow ? mapCatalogItem(updatedRow) : null;
  }

  async delete(id: string): Promise<boolean> {
    const rows = mapRows(await this.database.query<{ id: string }>(
      `delete from catalog_items
       where id = $1
       returning id`,
      [id],
    ));

    return rows.length > 0;
  }
}

export class PostgresInquiryRepository implements InquiryRepository {
  constructor(private readonly database: Pool) {}

  async create(input: Omit<Inquiry, "id" | "status" | "createdAt" | "updatedAt">): Promise<Inquiry> {
    const rows = mapRows(await this.database.query<InquiryRow>(
      `insert into inquiries (
         vendor_id,
         catalog_item_id,
         customer_name,
         customer_email,
         customer_phone,
         event_type,
         event_date,
         message,
         status
       ) values ($1, $2, $3, $4, $5, $6, $7, $8, 'new')
       returning *`,
      [
        input.vendorId,
        input.catalogItemId,
        input.customerName,
        input.customerEmail,
        input.customerPhone ?? null,
        input.eventType,
        input.eventDate ?? null,
        input.message,
      ],
    ));

    const [createdRow] = rows;
    if (!createdRow) {
      throw new Error("Database inquiry creation returned no rows");
    }

    return mapInquiry(createdRow);
  }

  async findMany(filters?: { vendorId?: string; status?: Inquiry["status"] }): Promise<Inquiry[]> {
    const values: unknown[] = [];
    const where: string[] = [];

    if (filters?.vendorId) {
      values.push(filters.vendorId);
      where.push(`vendor_id = $${values.length}`);
    }

    if (filters?.status) {
      values.push(filters.status);
      where.push(`status = $${values.length}`);
    }

    let query = `select *
      from inquiries`;
    if (where.length > 0) {
      query += ` where ${where.join(" and ")}`;
    }

    query += ` order by created_at desc`;
    const rows = mapRows(await this.database.query<InquiryRow>(query, values));

    return rows.map(mapInquiry);
  }

  async findById(id: string): Promise<Inquiry | null> {
    const rows = mapRows(await this.database.query<InquiryRow>(
      `select *
       from inquiries
       where id = $1
       limit 1`,
      [id],
    ));

    return rows[0] ? mapInquiry(rows[0]) : null;
  }

  async update(
    id: string,
    input: Partial<Pick<Inquiry, "customerName" | "customerEmail" | "customerPhone" | "eventType" | "eventDate" | "message" | "status">>,
  ): Promise<Inquiry | null> {
    const rows = mapRows(await this.database.query<InquiryRow>(
      `update inquiries
       set
         customer_name = coalesce($1, customer_name),
         customer_email = coalesce($2, customer_email),
         customer_phone = coalesce($3, customer_phone),
         event_type = coalesce($4, event_type),
         event_date = coalesce($5, event_date),
         message = coalesce($6, message),
         status = coalesce($7, status),
         updated_at = now()
       where id = $8
       returning *`,
      [
        input.customerName ?? null,
        input.customerEmail ?? null,
        input.customerPhone ?? null,
        input.eventType ?? null,
        input.eventDate ?? null,
        input.message ?? null,
        input.status ?? null,
        id,
      ],
    ));

    return rows[0] ? mapInquiry(rows[0]) : null;
  }

  async delete(id: string): Promise<boolean> {
    const rows = mapRows(await this.database.query<{ id: string }>(
      `delete from inquiries
       where id = $1
       returning id`,
      [id],
    ));

    return rows.length > 0;
  }
}
