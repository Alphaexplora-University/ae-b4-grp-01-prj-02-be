import type { NextFunction, Request, Response } from "express";
import { UnauthorizedError } from "../middlewares/http-errors.js";
import { updateVendorProfileSchema } from "../middlewares/validation-schemas.js";
import type { VendorService } from "../services/vendor.service.js";

function requireRouteParam(value: string | undefined, name: string): string {
  if (!value) {
    throw new Error(`Missing route param: ${name}`);
  }

  return value;
}

function requireAuthenticatedVendor(request: Request): { userId: string; vendorId: string } {
  if (!request.authenticatedVendor) {
    throw new UnauthorizedError("Vendor authentication is required.");
  }

  return request.authenticatedVendor;
}

export class VendorController {
  constructor(private readonly vendorService: VendorService) {}

  getVendorById = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
    try {
      const vendorId = requireRouteParam(request.params.vendorId, "vendorId");
      const vendor = await this.vendorService.getVendorById(vendorId);
      response.json({ data: vendor });
    } catch (error) {
      next(error);
    }
  };

  getAuthenticatedVendorProfile = async (
    request: Request,
    response: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const auth = requireAuthenticatedVendor(request);
      const vendor = await this.vendorService.getVendorByOwnerUserId(auth.userId);
      response.json({ data: vendor });
    } catch (error) {
      next(error);
    }
  };

  updateAuthenticatedVendorProfile = async (
    request: Request,
    response: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const auth = requireAuthenticatedVendor(request);
      const input = updateVendorProfileSchema.parse(request.body);
      const vendor = await this.vendorService.updateVendorProfile(auth.vendorId, input);
      response.json({ data: vendor });
    } catch (error) {
      next(error);
    }
  };
}
