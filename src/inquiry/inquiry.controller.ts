import type { NextFunction, Request, Response } from "express";
import { requireRouteParam } from "../shared/utils/route-params.js";
import type { InquiryService } from "./inquiry.service.js";
import {
  inquiryFiltersSchema,
  submitInquirySchema,
  updateInquiryStatusSchema,
} from "./inquiry.validator.js";

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

  listInquiries = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
    try {
      const filters = inquiryFiltersSchema.parse(request.query);
      const inquiries = await this.inquiryService.listInquiries(filters);
      response.json({ data: inquiries });
    } catch (error) {
      next(error);
    }
  };

  getInquiryById = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
    try {
      const inquiryId = requireRouteParam(request.params.inquiryId, "inquiryId");
      const inquiry = await this.inquiryService.getInquiryById(inquiryId);
      response.json({ data: inquiry });
    } catch (error) {
      next(error);
    }
  };

  updateInquiry = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
    try {
      const inquiryId = requireRouteParam(request.params.inquiryId, "inquiryId");
      const input = updateInquiryStatusSchema.parse(request.body);
      const inquiry = await this.inquiryService.updateInquiry(inquiryId, input);
      response.json({ data: inquiry });
    } catch (error) {
      next(error);
    }
  };

  deleteInquiry = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
    try {
      const inquiryId = requireRouteParam(request.params.inquiryId, "inquiryId");
      await this.inquiryService.deleteInquiry(inquiryId);
      response.status(204).send();
    } catch (error) {
      next(error);
    }
  };
}
