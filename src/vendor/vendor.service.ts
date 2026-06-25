import type { VendorRepository } from "../repositories/repository.types.js";
import { NotFoundError } from "../shared/utils/app-error.js";
import type { Vendor } from "../types/entities.js";
import type { CreateVendorDto, UpdateVendorProfileDto } from "./vendor.validator.js";

export class VendorService {
  constructor(private readonly vendors: VendorRepository) {}

  listVendors(): Promise<Vendor[]> {
    return this.vendors.findMany();
  }

  async getVendorById(vendorId: string): Promise<Vendor> {
    const vendor = await this.vendors.findById(vendorId);
    if (!vendor) {
      throw new NotFoundError("Vendor");
    }

    return vendor;
  }

  createVendor(input: CreateVendorDto): Promise<Vendor> {
    return this.vendors.create({
      ownerUserId: input.ownerUserId,
      businessName: input.businessName,
      description: input.description,
      location: input.location,
      contactEmail: input.contactEmail,
      contactPhone: input.contactPhone,
    });
  }

  async updateVendor(vendorId: string, input: UpdateVendorProfileDto): Promise<Vendor> {
    const updated = await this.vendors.update(vendorId, input);
    if (!updated) {
      throw new NotFoundError("Vendor");
    }

    return updated;
  }

  async deleteVendor(vendorId: string): Promise<void> {
    const deleted = await this.vendors.delete(vendorId);
    if (!deleted) {
      throw new NotFoundError("Vendor");
    }
  }
}
