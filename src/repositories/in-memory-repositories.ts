import type { CatalogItem, Inquiry, Vendor } from "../types/entities.js";
import type {
  CatalogItemFilters,
  CatalogItemRepository,
  InquiryRepository,
  VendorRepository,
} from "./repository.types.js";
import { createId, nowIso } from "./id.js";
import { catalogItemsSeed, vendorsSeed } from "./seed.js";

export class MemoryVendorRepository implements VendorRepository {
  private readonly vendors = new Map(vendorsSeed.map((vendor) => [vendor.id, vendor]));

  async findById(id: string): Promise<Vendor | null> {
    return this.vendors.get(id) ?? null;
  }
}

export class MemoryCatalogItemRepository implements CatalogItemRepository {
  private readonly items = new Map(catalogItemsSeed.map((item) => [item.id, item]));

  async findMany(filters: CatalogItemFilters): Promise<CatalogItem[]> {
    const search = filters.search?.toLowerCase();
    const category = filters.category?.toLowerCase();
    const location = filters.location?.toLowerCase();
    const availabilityTag = filters.availabilityTag?.toLowerCase();

    return [...this.items.values()]
      .filter((item) => item.status === "active" || filters.vendorId === item.vendorId)
      .filter((item) => !filters.vendorId || item.vendorId === filters.vendorId)
      .filter((item) => !category || item.category.toLowerCase() === category)
      .filter((item) => !location || item.location.toLowerCase().includes(location))
      .filter((item) => !availabilityTag || item.availabilityTags.some((tag) => tag.toLowerCase() === availabilityTag))
      .filter((item) => {
        if (!search) return true;
        return `${item.name} ${item.description} ${item.category}`.toLowerCase().includes(search);
      })
      .sort((left, right) => left.name.localeCompare(right.name));
  }

  async findById(id: string): Promise<CatalogItem | null> {
    return this.items.get(id) ?? null;
  }

  async create(input: Omit<CatalogItem, "id" | "createdAt" | "updatedAt">): Promise<CatalogItem> {
    const timestamp = nowIso();
    const item: CatalogItem = {
      ...input,
      id: createId(),
      createdAt: timestamp,
      updatedAt: timestamp,
    };
    this.items.set(item.id, item);
    return item;
  }

  async update(
    id: string,
    vendorId: string,
    input: Partial<Omit<CatalogItem, "id" | "vendorId" | "createdAt" | "updatedAt">>,
  ): Promise<CatalogItem | null> {
    const current = this.items.get(id);
    if (!current || current.vendorId !== vendorId) {
      return null;
    }

    const updated: CatalogItem = {
      ...current,
      ...input,
      updatedAt: nowIso(),
    };
    this.items.set(id, updated);
    return updated;
  }

  async delete(id: string, vendorId: string): Promise<boolean> {
    const current = this.items.get(id);
    if (!current || current.vendorId !== vendorId) {
      return false;
    }
    return this.items.delete(id);
  }
}

export class MemoryInquiryRepository implements InquiryRepository {
  private readonly inquiries = new Map<string, Inquiry>();

  async create(input: Omit<Inquiry, "id" | "status" | "createdAt" | "updatedAt">): Promise<Inquiry> {
    const timestamp = nowIso();
    const inquiry: Inquiry = {
      ...input,
      id: createId(),
      status: "new",
      createdAt: timestamp,
      updatedAt: timestamp,
    };
    this.inquiries.set(inquiry.id, inquiry);
    return inquiry;
  }

  async findByVendorId(vendorId: string): Promise<Inquiry[]> {
    return [...this.inquiries.values()]
      .filter((inquiry) => inquiry.vendorId === vendorId)
      .sort((left, right) => right.createdAt.localeCompare(left.createdAt));
  }
}
