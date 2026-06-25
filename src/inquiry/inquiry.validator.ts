import { z } from "zod";

export const vendorInquiryFiltersSchema = z.object({
  status: z.enum(["new", "reviewed", "closed"]).optional(),
});

export const submitInquirySchema = z.object({
  catalogItemId: z.string().uuid(),
  customerName: z.string().trim().min(2).max(160),
  customerEmail: z.string().trim().email().max(255),
  customerPhone: z.string().trim().max(40).optional(),
  eventType: z.string().trim().min(2).max(120),
  eventDate: z.string().date().optional(),
  message: z.string().trim().min(10).max(4000),
});

export const updateInquiryStatusSchema = z.object({
  status: z.enum(["new", "reviewed", "closed"]),
});

export type VendorInquiryFiltersDto = z.infer<typeof vendorInquiryFiltersSchema>;
export type SubmitInquiryDto = z.infer<typeof submitInquirySchema>;
export type UpdateInquiryStatusDto = z.infer<typeof updateInquiryStatusSchema>;
