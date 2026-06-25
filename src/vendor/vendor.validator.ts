import { z } from "zod";

export const createVendorSchema = z.object({
  ownerUserId: z.string().uuid(),
  password: z.string().trim().min(8).max(255).optional(),
  businessName: z.string().trim().min(2).max(180),
  description: z.string().trim().min(10).max(4000),
  location: z.string().trim().min(2).max(160),
  contactEmail: z.string().trim().email().max(255),
  contactPhone: z.string().trim().max(40).optional(),
});

export const updateVendorProfileSchema = createVendorSchema.omit({ ownerUserId: true }).partial();

export type CreateVendorDto = z.infer<typeof createVendorSchema>;
export type UpdateVendorProfileDto = z.infer<typeof updateVendorProfileSchema>;
