import type { RequestHandler } from "express";
import type { VendorRepository } from "../../repositories/repository.types.js";
import { ForbiddenError, UnauthorizedError } from "../utils/app-error.js";

export function requireVendorAuth(vendors: VendorRepository): RequestHandler {
  return async (request, _response, next) => {
    try {
      const vendorId = request.header("x-vendor-id");
      if (!vendorId) {
        throw new UnauthorizedError("Missing x-vendor-id header.");
      }

      const vendor = await vendors.findById(vendorId);
      if (!vendor) {
        throw new ForbiddenError("The supplied x-vendor-id is not linked to a vendor account.");
      }

      request.authenticatedVendor = {
        userId: vendor.ownerUserId,
        vendorId: vendor.id,
      };

      next();
    } catch (error) {
      next(error);
    }
  };
}

export const requireVendorAccess: RequestHandler = (request, _response, next) => {
  const routeVendorId = request.params.vendorId;
  const authenticatedVendorId = request.authenticatedVendor?.vendorId;

  if (!authenticatedVendorId) {
    next(new UnauthorizedError("Vendor authentication is required before authorization can be checked."));
    return;
  }

  if (routeVendorId && routeVendorId !== authenticatedVendorId) {
    next(new ForbiddenError("The authenticated vendor does not own this resource."));
    return;
  }

  next();
};
