import { z } from "zod";

const catalogItemStatusSchema = z.enum(["active", "draft", "archived"]);

export const catalogItemFiltersSchema = z.object({
  search: z.string().trim().optional(),
  category: z.string().trim().optional(),
  location: z.string().trim().optional(),
  availabilityTag: z.string().trim().optional(),
  vendorId: z.string().uuid().optional(),
  status: catalogItemStatusSchema.optional(),
});

export const createCatalogItemSchema = z.object({
  vendorId: z.string().uuid(),
  name: z.string().trim().min(2).max(180),
  category: z.string().trim().min(2).max(120),
  description: z.string().trim().min(10).max(4000),
  priceFrom: z.number().nonnegative().optional(),
  location: z.string().trim().min(2).max(160),
  availabilityTags: z.array(z.string().trim().min(1).max(40)).default([]),
  status: catalogItemStatusSchema.default("active"),
});

export const updateCatalogItemSchema = createCatalogItemSchema.partial();

export type CatalogItemFiltersDto = z.infer<typeof catalogItemFiltersSchema>;
export type CreateCatalogItemDto = z.infer<typeof createCatalogItemSchema>;
export type UpdateCatalogItemDto = z.infer<typeof updateCatalogItemSchema>;
