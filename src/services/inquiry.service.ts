import type { Inquiry } from "../types/entities.js";
import { NotFoundError } from "../middlewares/http-errors.js";
import type { CatalogItemRepository, InquiryRepository, VendorRepository } from "../repositories/repository.types.js";
import type {
  SubmitInquiryDto,
  UpdateInquiryStatusDto,
  VendorInquiryFiltersDto,
} from "../middlewares/validation-schemas.js";

export class InquiryService {
  constructor(
    private readonly inquiries: InquiryRepository,
    private readonly catalogItems: CatalogItemRepository,
    private readonly vendors: VendorRepository,
  ) {}

  async submitInquiry(input: SubmitInquiryDto): Promise<Inquiry> {
    const catalogItem = await this.catalogItems.findById(input.catalogItemId);
    if (!catalogItem || catalogItem.status !== "active") {
      throw new NotFoundError("Catalog item");
    }

    return this.inquiries.create({
      vendorId: catalogItem.vendorId,
      catalogItemId: input.catalogItemId,
      customerName: input.customerName,
      customerEmail: input.customerEmail,
      customerPhone: input.customerPhone,
      eventType: input.eventType,
      eventDate: input.eventDate,
      message: input.message,
    });
  }

  async listVendorInquiries(vendorId: string, filters: VendorInquiryFiltersDto): Promise<Inquiry[]> {
    const vendor = await this.vendors.findById(vendorId);
    if (!vendor) {
      throw new NotFoundError("Vendor");
    }

    return this.inquiries.findByVendorId(vendorId, filters.status);
  }

  async updateInquiryStatus(vendorId: string, inquiryId: string, input: UpdateInquiryStatusDto): Promise<Inquiry> {
    const vendor = await this.vendors.findById(vendorId);
    if (!vendor) {
      throw new NotFoundError("Vendor");
    }

    const updated = await this.inquiries.updateStatus(inquiryId, vendorId, input.status);
    if (!updated) {
      throw new NotFoundError("Inquiry");
    }

    return updated;
  }
}
