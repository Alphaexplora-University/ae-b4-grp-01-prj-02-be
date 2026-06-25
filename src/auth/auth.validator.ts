import { z } from "zod";

export const loginVendorSchema = z.object({
  email: z.string().trim().email().max(255),
  password: z.string().min(8).max(255),
});

export const signupVendorSchema = z.object({
  email: z.string().trim().email().max(255),
  password: z.string().min(8).max(255),
  businessName: z.string().trim().min(2).max(180),
  description: z.string().trim().min(10).max(4000),
  location: z.string().trim().min(2).max(160),
  contactEmail: z.string().trim().email().max(255),
  contactPhone: z.string().trim().max(40).optional(),
});

export type LoginVendorDto = z.infer<typeof loginVendorSchema>;
export type SignupVendorDto = z.infer<typeof signupVendorSchema>;
