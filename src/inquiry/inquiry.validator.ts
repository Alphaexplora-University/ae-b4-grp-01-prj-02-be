import { z } from "zod";

export const inquiryFiltersSchema = z.object({
  vendorId: z.string().uuid().optional(),
  status: z.enum(["new", "reviewed", "closed"]).optional(),
});

export const submitInquirySchema = z.object({
  vendorId: z.string().uuid(),
  catalogItemId: z.string().uuid(),
  customerName: z.string().trim().min(2).max(160),
  customerEmail: z.string().trim().email().max(255),
  customerPhone: z.string().trim().max(40).optional(),
  eventType: z.string().trim().min(2).max(120),
  eventDate: z.string().date().optional(),
  message: z.string().trim().min(10).max(4000),
});

export const updateInquiryStatusSchema = z.object({
  customerName: z.string().trim().min(2).max(160).optional(),
  customerEmail: z.string().trim().email().max(255).optional(),
  customerPhone: z.string().trim().max(40).optional(),
  eventType: z.string().trim().min(2).max(120).optional(),
  eventDate: z.string().date().optional(),
  message: z.string().trim().min(10).max(4000).optional(),
  status: z.enum(["new", "reviewed", "closed"]),
}).partial().refine((value) => Object.keys(value).length > 0, {
  message: "At least one inquiry field must be provided.",
});

export type InquiryFiltersDto = z.infer<typeof inquiryFiltersSchema>;
export type SubmitInquiryDto = z.infer<typeof submitInquirySchema>;
export type UpdateInquiryStatusDto = z.infer<typeof updateInquiryStatusSchema>;
