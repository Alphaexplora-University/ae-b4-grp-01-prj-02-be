import type { CatalogItemRepository, VendorRepository } from "../repositories/repository.types.js";
import { NotFoundError } from "../shared/utils/app-error.js";
import type { CatalogItem, CatalogItemStatus } from "../types/entities.js";
import type {
  CatalogItemFiltersDto,
  CreateCatalogItemDto,
  UpdateCatalogItemDto,
} from "./catalog.validator.js";

export class CatalogService {
  constructor(
    private readonly catalogItems: CatalogItemRepository,
    private readonly vendors: VendorRepository,
  ) {}

  listCatalogItems(filters: CatalogItemFiltersDto): Promise<CatalogItem[]> {
    return this.catalogItems.findMany(filters);
  }

  async getCatalogItemById(itemId: string): Promise<CatalogItem> {
    const item = await this.catalogItems.findById(itemId);
    if (!item) {
      throw new NotFoundError("Catalog item");
    }

    return item;
  }

  async createCatalogItem(input: CreateCatalogItemDto): Promise<CatalogItem> {
    const vendor = await this.vendors.findById(input.vendorId);
    if (!vendor) {
      throw new NotFoundError("Vendor");
    }

    return this.catalogItems.create({
      vendorId: input.vendorId,
      name: input.name,
      category: input.category,
      description: input.description,
      priceFrom: input.priceFrom,
      location: input.location,
      availabilityTags: input.availabilityTags,
      status: input.status,
    });
  }

  createDraftCatalogItem(input: Omit<CreateCatalogItemDto, "status">): Promise<CatalogItem> {
    return this.createCatalogItem({
      ...input,
      status: "draft",
    });
  }

  async updateCatalogItem(itemId: string, input: UpdateCatalogItemDto): Promise<CatalogItem> {
    const updated = await this.catalogItems.update(itemId, input);
    if (!updated) {
      throw new NotFoundError("Catalog item");
    }
    return updated;
  }

  async deleteCatalogItem(itemId: string): Promise<void> {
    const deleted = await this.catalogItems.delete(itemId);
    if (!deleted) {
      throw new NotFoundError("Catalog item");
    }
  }

  async updateCatalogItemStatus(itemId: string, status: CatalogItemStatus): Promise<CatalogItem> {
    const updated = await this.catalogItems.update(itemId, { status });
    if (!updated) {
      throw new NotFoundError("Catalog item");
    }

    return updated;
  }

  publishDraftCatalogItem(itemId: string): Promise<CatalogItem> {
    return this.updateCatalogItemStatus(itemId, "active");
  }

  archiveCatalogItem(itemId: string): Promise<CatalogItem> {
    return this.updateCatalogItemStatus(itemId, "archived");
  }
}
