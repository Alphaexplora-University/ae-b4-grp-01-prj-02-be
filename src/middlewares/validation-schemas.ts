import { z } from "zod";

export const catalogItemFiltersSchema = z.object({
  search: z.string().trim().optional(),
  category: z.string().trim().optional(),
  location: z.string().trim().optional(),
  availabilityTag: z.string().trim().optional(),
  vendorId: z.string().uuid().optional(),
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

export const createCatalogItemSchema = z.object({
  name: z.string().trim().min(2).max(180),
  category: z.string().trim().min(2).max(120),
  description: z.string().trim().min(10).max(4000),
  priceFrom: z.number().nonnegative().optional(),
  location: z.string().trim().min(2).max(160),
  availabilityTags: z.array(z.string().trim().min(1).max(40)).default([]),
  status: z.enum(["active", "draft", "archived"]).default("active"),
});

export const updateCatalogItemSchema = createCatalogItemSchema.partial();

export type CatalogItemFiltersDto = z.infer<typeof catalogItemFiltersSchema>;
export type SubmitInquiryDto = z.infer<typeof submitInquirySchema>;
export type CreateCatalogItemDto = z.infer<typeof createCatalogItemSchema>;
export type UpdateCatalogItemDto = z.infer<typeof updateCatalogItemSchema>;
