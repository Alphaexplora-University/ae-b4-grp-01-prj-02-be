import type { CatalogItem, Inquiry, Vendor } from "../types/entities.js";

export interface CatalogItemFilters {
  search?: string;
  category?: string;
  location?: string;
  availabilityTag?: string;
  vendorId?: string;
  includeInactive?: boolean;
}

export interface CatalogItemRepository {
  findMany(filters: CatalogItemFilters): Promise<CatalogItem[]>;
  findById(id: string): Promise<CatalogItem | null>;
  create(input: Omit<CatalogItem, "id" | "createdAt" | "updatedAt">): Promise<CatalogItem>;
  update(
    id: string,
    vendorId: string,
    input: Partial<Omit<CatalogItem, "id" | "vendorId" | "createdAt" | "updatedAt">>,
  ): Promise<CatalogItem | null>;
  delete(id: string, vendorId: string): Promise<boolean>;
}

export interface VendorRepository {
  findById(id: string): Promise<Vendor | null>;
  findByOwnerUserId(ownerUserId: string): Promise<Vendor | null>;
  update(
    id: string,
    input: Partial<Omit<Vendor, "id" | "ownerUserId" | "createdAt" | "updatedAt">>,
  ): Promise<Vendor | null>;
}

export interface InquiryRepository {
  create(input: Omit<Inquiry, "id" | "status" | "createdAt" | "updatedAt">): Promise<Inquiry>;
  findByVendorId(vendorId: string, status?: Inquiry["status"]): Promise<Inquiry[]>;
  updateStatus(id: string, vendorId: string, status: Inquiry["status"]): Promise<Inquiry | null>;
}
