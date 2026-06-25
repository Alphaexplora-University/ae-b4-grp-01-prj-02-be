import type { NextFunction, Request, Response } from "express";
import { requireRouteParam } from "../shared/utils/route-params.js";
import type { VendorService } from "./vendor.service.js";
import { createVendorSchema, updateVendorProfileSchema } from "./vendor.validator.js";

export class VendorController {
  constructor(private readonly vendorService: VendorService) {}

  listVendors = async (_request: Request, response: Response, next: NextFunction): Promise<void> => {
    try {
      const vendors = await this.vendorService.listVendors();
      response.json({ data: vendors });
    } catch (error) {
      next(error);
    }
  };

  getVendorById = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
    try {
      const vendorId = requireRouteParam(request.params.vendorId, "vendorId");
      const vendor = await this.vendorService.getVendorById(vendorId);
      response.json({ data: vendor });
    } catch (error) {
      next(error);
    }
  };

  createVendor = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
    try {
      const input = createVendorSchema.parse(request.body);
      const vendor = await this.vendorService.createVendor(input);
      response.status(201).json({ data: vendor });
    } catch (error) {
      next(error);
    }
  };

  updateVendor = async (
    request: Request,
    response: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const vendorId = requireRouteParam(request.params.vendorId, "vendorId");
      const input = updateVendorProfileSchema.parse(request.body);
      const vendor = await this.vendorService.updateVendor(vendorId, input);
      response.json({ data: vendor });
    } catch (error) {
      next(error);
    }
  };

  deleteVendor = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
    try {
      const vendorId = requireRouteParam(request.params.vendorId, "vendorId");
      await this.vendorService.deleteVendor(vendorId);
      response.status(204).send();
    } catch (error) {
      next(error);
    }
  };
}
