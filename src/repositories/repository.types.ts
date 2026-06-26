import type { CatalogItem, Inquiry, Vendor } from "../types/entities.js";

export interface CatalogItemFilters {
  search?: string;
  category?: string;
  location?: string;
  availabilityTag?: string;
  vendorId?: string;
  status?: CatalogItem["status"];
  includeInactive?: boolean;
}

export interface VendorAuthRecord {
  vendor: Vendor;
  passwordHash: string;
}

export interface CreateVendorInput extends Omit<Vendor, "id" | "createdAt" | "updatedAt"> {
  passwordHash?: string;
}

export interface CatalogItemRepository {
  findMany(filters: CatalogItemFilters): Promise<CatalogItem[]>;
  findById(id: string): Promise<CatalogItem | null>;
  create(input: Omit<CatalogItem, "id" | "createdAt" | "updatedAt">): Promise<CatalogItem>;
  update(
    id: string,
    input: Partial<Omit<CatalogItem, "id" | "vendorId" | "createdAt" | "updatedAt">>,
  ): Promise<CatalogItem | null>;
  delete(id: string): Promise<boolean>;
}

export interface VendorRepository {
  findMany(): Promise<Vendor[]>;
  findById(id: string): Promise<Vendor | null>;
  findAuthByEmail(email: string): Promise<VendorAuthRecord | null>;
  create(input: CreateVendorInput): Promise<Vendor>;
  update(
    id: string,
    input: Partial<Omit<Vendor, "id" | "ownerUserId" | "createdAt" | "updatedAt">>,
  ): Promise<Vendor | null>;
  delete(id: string): Promise<boolean>;
}

export interface InquiryRepository {
  create(input: Omit<Inquiry, "id" | "status" | "createdAt" | "updatedAt">): Promise<Inquiry>;
  findMany(filters?: { vendorId?: string; status?: Inquiry["status"] }): Promise<Inquiry[]>;
  findById(id: string): Promise<Inquiry | null>;
  update(
    id: string,
    input: Partial<Pick<Inquiry, "customerName" | "customerEmail" | "customerPhone" | "eventType" | "eventDate" | "message" | "status">>,
  ): Promise<Inquiry | null>;
  delete(id: string): Promise<boolean>;
}
