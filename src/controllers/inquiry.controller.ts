import type { NextFunction, Request, Response } from "express";
import { submitInquirySchema } from "../middlewares/validation-schemas.js";
import type { InquiryService } from "../services/inquiry.service.js";

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
      const inquiries = await this.inquiryService.listVendorInquiries(request.params.vendorId);
      response.json({ data: inquiries });
    } catch (error) {
      next(error);
    }
  };
}
