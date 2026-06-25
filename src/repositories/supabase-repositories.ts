import type { CatalogItem, Inquiry, Vendor } from "../types/entities.js";
import type {
  CatalogItemFilters,
  CatalogItemRepository,
  InquiryRepository,
  VendorRepository,
} from "./repository.types.js";
import type { Sql } from "postgres";

interface VendorRow {
  id: string;
  owner_user_id: string;
  business_name: string;
  description: string;
  location: string;
  contact_email: string;
  contact_phone: string | null;
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

export class PostgresVendorRepository implements VendorRepository {
  constructor(private readonly database: Sql) {}

  async findById(id: string): Promise<Vendor | null> {
    const rows = await this.database<VendorRow[]>`
      select *
      from vendors
      where id = ${id}
      limit 1
    `;

    return rows[0] ? mapVendor(rows[0]) : null;
  }

  async findByOwnerUserId(ownerUserId: string): Promise<Vendor | null> {
    const rows = await this.database<VendorRow[]>`
      select *
      from vendors
      where owner_user_id = ${ownerUserId}
      limit 1
    `;

    return rows[0] ? mapVendor(rows[0]) : null;
  }

  async update(
    id: string,
    input: Partial<Omit<Vendor, "id" | "ownerUserId" | "createdAt" | "updatedAt">>,
  ): Promise<Vendor | null> {
    const rows = await this.database<VendorRow[]>`
      update vendors
      set
        business_name = coalesce(${input.businessName ?? null}, business_name),
        description = coalesce(${input.description ?? null}, description),
        location = coalesce(${input.location ?? null}, location),
        contact_email = coalesce(${input.contactEmail ?? null}, contact_email),
        contact_phone = coalesce(${input.contactPhone ?? null}, contact_phone),
        updated_at = now()
      where id = ${id}
      returning *
    `;

    return rows[0] ? mapVendor(rows[0]) : null;
  }
}

export class PostgresCatalogItemRepository implements CatalogItemRepository {
  constructor(private readonly database: Sql) {}

  async findMany(filters: CatalogItemFilters): Promise<CatalogItem[]> {
    const rows = await this.database<CatalogItemRow[]>`
      select *
      from catalog_items
      where ${filters.vendorId ? this.database`vendor_id = ${filters.vendorId}` : this.database`true`}
        and ${filters.includeInactive ? this.database`true` : this.database`status = 'active'`}
      order by name asc
    `;

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
    const rows = await this.database<CatalogItemRow[]>`
      select *
      from catalog_items
      where id = ${id}
      limit 1
    `;

    return rows[0] ? mapCatalogItem(rows[0]) : null;
  }

  async create(input: Omit<CatalogItem, "id" | "createdAt" | "updatedAt">): Promise<CatalogItem> {
    const rows = await this.database<CatalogItemRow[]>`
      insert into catalog_items (
        vendor_id,
        name,
        category,
        description,
        price_from,
        location,
        availability_tags,
        status
      ) values (
        ${input.vendorId},
        ${input.name},
        ${input.category},
        ${input.description},
        ${input.priceFrom ?? null},
        ${input.location},
        ${this.database.array(input.availabilityTags)},
        ${input.status}
      )
      returning *
    `;

    const [createdRow] = rows;
    if (!createdRow) {
      throw new Error("Database catalog item creation returned no rows");
    }

    return mapCatalogItem(createdRow);
  }

  async update(
    id: string,
    vendorId: string,
    input: Partial<Omit<CatalogItem, "id" | "vendorId" | "createdAt" | "updatedAt">>,
  ): Promise<CatalogItem | null> {
    const existing = await this.findById(id);
    if (!existing || existing.vendorId !== vendorId) {
      return null;
    }

    const rows = await this.database<CatalogItemRow[]>`
      update catalog_items
      set
        name = coalesce(${input.name ?? null}, name),
        category = coalesce(${input.category ?? null}, category),
        description = coalesce(${input.description ?? null}, description),
        price_from = coalesce(${input.priceFrom ?? null}, price_from),
        location = coalesce(${input.location ?? null}, location),
        availability_tags = coalesce(${input.availabilityTags ? this.database.array(input.availabilityTags) : null}, availability_tags),
        status = coalesce(${input.status ?? null}, status),
        updated_at = now()
      where id = ${id} and vendor_id = ${vendorId}
      returning *
    `;

    const [updatedRow] = rows;
    return updatedRow ? mapCatalogItem(updatedRow) : null;
  }

  async delete(id: string, vendorId: string): Promise<boolean> {
    const rows = await this.database<{ id: string }[]>`
      delete from catalog_items
      where id = ${id} and vendor_id = ${vendorId}
      returning id
    `;

    return rows.length > 0;
  }
}

export class PostgresInquiryRepository implements InquiryRepository {
  constructor(private readonly database: Sql) {}

  async create(input: Omit<Inquiry, "id" | "status" | "createdAt" | "updatedAt">): Promise<Inquiry> {
    const rows = await this.database<InquiryRow[]>`
      insert into inquiries (
        vendor_id,
        catalog_item_id,
        customer_name,
        customer_email,
        customer_phone,
        event_type,
        event_date,
        message,
        status
      ) values (
        ${input.vendorId},
        ${input.catalogItemId},
        ${input.customerName},
        ${input.customerEmail},
        ${input.customerPhone ?? null},
        ${input.eventType},
        ${input.eventDate ?? null},
        ${input.message},
        'new'
      )
      returning *
    `;

    const [createdRow] = rows;
    if (!createdRow) {
      throw new Error("Database inquiry creation returned no rows");
    }

    return mapInquiry(createdRow);
  }

  async findByVendorId(vendorId: string, status?: Inquiry["status"]): Promise<Inquiry[]> {
    const rows = await this.database<InquiryRow[]>`
      select *
      from inquiries
      where vendor_id = ${vendorId}
        and ${status ? this.database`status = ${status}` : this.database`true`}
      order by created_at desc
    `;

    return rows.map(mapInquiry);
  }

  async updateStatus(id: string, vendorId: string, status: Inquiry["status"]): Promise<Inquiry | null> {
    const rows = await this.database<InquiryRow[]>`
      update inquiries
      set
        status = ${status},
        updated_at = now()
      where id = ${id} and vendor_id = ${vendorId}
      returning *
    `;

    return rows[0] ? mapInquiry(rows[0]) : null;
  }
}
