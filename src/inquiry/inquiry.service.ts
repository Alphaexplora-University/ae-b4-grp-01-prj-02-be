import type { CatalogItemRepository, InquiryRepository, VendorRepository } from "../repositories/repository.types.js";
import { NotFoundError } from "../shared/utils/app-error.js";
import type { Inquiry } from "../types/entities.js";
import type {
  InquiryFiltersDto,
  SubmitInquiryDto,
  UpdateInquiryStatusDto,
} from "./inquiry.validator.js";

export class InquiryService {
  constructor(
    private readonly inquiries: InquiryRepository,
    private readonly catalogItems: CatalogItemRepository,
    private readonly vendors: VendorRepository,
  ) {}

  async submitInquiry(input: SubmitInquiryDto): Promise<Inquiry> {
    const vendor = await this.vendors.findById(input.vendorId);
    if (!vendor) {
      throw new NotFoundError("Vendor");
    }

    const catalogItem = await this.catalogItems.findById(input.catalogItemId);
    if (!catalogItem) {
      throw new NotFoundError("Catalog item");
    }

    return this.inquiries.create({
      vendorId: input.vendorId,
      catalogItemId: input.catalogItemId,
      customerName: input.customerName,
      customerEmail: input.customerEmail,
      customerPhone: input.customerPhone,
      eventType: input.eventType,
      eventDate: input.eventDate,
      message: input.message,
    });
  }

  listInquiries(filters: InquiryFiltersDto): Promise<Inquiry[]> {
    return this.inquiries.findMany(filters);
  }

  async getInquiryById(inquiryId: string): Promise<Inquiry> {
    const inquiry = await this.inquiries.findById(inquiryId);
    if (!inquiry) {
      throw new NotFoundError("Inquiry");
    }

    return inquiry;
  }

  async updateInquiry(inquiryId: string, input: UpdateInquiryStatusDto): Promise<Inquiry> {
    const updated = await this.inquiries.update(inquiryId, input);
    if (!updated) {
      throw new NotFoundError("Inquiry");
    }

    return updated;
  }

  async deleteInquiry(inquiryId: string): Promise<void> {
    const deleted = await this.inquiries.delete(inquiryId);
    if (!deleted) {
      throw new NotFoundError("Inquiry");
    }
  }
}
