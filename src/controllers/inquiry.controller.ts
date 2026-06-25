import type { NextFunction, Request, Response } from "express";
import {
  submitInquirySchema,
  updateInquiryStatusSchema,
  vendorInquiryFiltersSchema,
} from "../middlewares/validation-schemas.js";
import type { InquiryService } from "../services/inquiry.service.js";

function requireRouteParam(value: string | undefined, name: string): string {
  if (!value) {
    throw new Error(`Missing route param: ${name}`);
  }

  return value;
}

export class InquiryController {
  constructor(private readonly inquiryService: InquiryService) {}

  submitInquiry = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
    try {
      const input = submitInquirySchema.parse(request.body);
      const inquiry = await this.inquiryService.submitInquiry(input);
      response.status(201).json({ data: inquiry });
    } catch (error) {
      next(error);
    }
  };

  listVendorInquiries = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
    try {
      const vendorId = requireRouteParam(request.params.vendorId, "vendorId");
      const filters = vendorInquiryFiltersSchema.parse(request.query);
      const inquiries = await this.inquiryService.listVendorInquiries(vendorId, filters);
      response.json({ data: inquiries });
    } catch (error) {
      next(error);
    }
  };

  updateInquiryStatus = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
    try {
      const vendorId = requireRouteParam(request.params.vendorId, "vendorId");
      const inquiryId = requireRouteParam(request.params.inquiryId, "inquiryId");
      const input = updateInquiryStatusSchema.parse(request.body);
      const inquiry = await this.inquiryService.updateInquiryStatus(vendorId, inquiryId, input);
      response.json({ data: inquiry });
    } catch (error) {
      next(error);
    }
  };
}
