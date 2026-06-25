import { z } from "zod";

export const updateVendorProfileSchema = z.object({
  businessName: z.string().trim().min(2).max(180).optional(),
  description: z.string().trim().min(10).max(4000).optional(),
  location: z.string().trim().min(2).max(160).optional(),
  contactEmail: z.string().trim().email().max(255).optional(),
  contactPhone: z.string().trim().max(40).optional(),
});

export type UpdateVendorProfileDto = z.infer<typeof updateVendorProfileSchema>;
