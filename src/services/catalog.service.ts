import type { CatalogItem } from "../types/entities.js";
import { NotFoundError } from "../middlewares/http-errors.js";
import type { CatalogItemRepository, VendorRepository } from "../repositories/repository.types.js";
import type { CatalogItemFiltersDto, CreateCatalogItemDto, UpdateCatalogItemDto } from "../middlewares/validation-schemas.js";

export class CatalogService {
  constructor(
    private readonly catalogItems: CatalogItemRepository,
    private readonly vendors: VendorRepository,
  ) {}

  listCatalogItems(filters: CatalogItemFiltersDto): Promise<CatalogItem[]> {
    return this.catalogItems.findMany(filters);
  }

  async createCatalogItem(vendorId: string, input: CreateCatalogItemDto): Promise<CatalogItem> {
    const vendor = await this.vendors.findById(vendorId);
    if (!vendor) {
      throw new NotFoundError("Vendor");
    }

    return this.catalogItems.create({
      vendorId,
      name: input.name,
      category: input.category,
      description: input.description,
      priceFrom: input.priceFrom,
      location: input.location,
      availabilityTags: input.availabilityTags,
      status: input.status,
    });
  }

  async updateCatalogItem(
    vendorId: string,
    itemId: string,
    input: UpdateCatalogItemDto,
  ): Promise<CatalogItem> {
    const updated = await this.catalogItems.update(itemId, vendorId, input);
    if (!updated) {
      throw new NotFoundError("Catalog item");
    }
    return updated;
  }

  async deleteCatalogItem(vendorId: string, itemId: string): Promise<void> {
    const deleted = await this.catalogItems.delete(itemId, vendorId);
    if (!deleted) {
      throw new NotFoundError("Catalog item");
    }
  }
}
