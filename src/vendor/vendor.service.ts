import type { VendorRepository } from "../repositories/repository.types.js";
import { NotFoundError } from "../shared/utils/app-error.js";
import type { Vendor } from "../types/entities.js";
import type { UpdateVendorProfileDto } from "./vendor.validator.js";

export class VendorService {
  constructor(private readonly vendors: VendorRepository) {}

  async getVendorById(vendorId: string): Promise<Vendor> {
    const vendor = await this.vendors.findById(vendorId);
    if (!vendor) {
      throw new NotFoundError("Vendor");
    }

    return vendor;
  }

  async getVendorByOwnerUserId(ownerUserId: string): Promise<Vendor> {
    const vendor = await this.vendors.findByOwnerUserId(ownerUserId);
    if (!vendor) {
      throw new NotFoundError("Vendor");
    }

    return vendor;
  }

  async updateVendorProfile(vendorId: string, input: UpdateVendorProfileDto): Promise<Vendor> {
    const updated = await this.vendors.update(vendorId, input);
    if (!updated) {
      throw new NotFoundError("Vendor");
    }

    return updated;
  }
}
