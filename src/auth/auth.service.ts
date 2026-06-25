import type { SupabaseAuthClient } from "../config/supabase-auth.js";
import type { VendorRepository } from "../repositories/repository.types.js";
import { UnauthorizedError, ValidationError } from "../shared/utils/app-error.js";
import type { Vendor } from "../types/entities.js";
import type { SignupVendorDto } from "./auth.validator.js";

export interface AuthResult {
  accessToken: string;
  vendor: Vendor;
}

export class AuthService {
  constructor(
    private readonly authClient: SupabaseAuthClient | null,
    private readonly vendors: VendorRepository,
  ) {}

  private requireAuthClient(): SupabaseAuthClient {
    if (!this.authClient) {
      throw new UnauthorizedError("Authentication is not configured on the backend.");
    }

    return this.authClient;
  }

  async loginVendor(email: string, password: string): Promise<AuthResult> {
    const auth = await this.requireAuthClient().signInWithPassword(email, password);
    const vendor = await this.vendors.findByOwnerUserId(auth.user.id);
    if (!vendor) {
      throw new UnauthorizedError("The authenticated user is not linked to a vendor account.");
    }

    return {
      accessToken: auth.accessToken,
      vendor,
    };
  }

  async signupVendor(input: SignupVendorDto): Promise<AuthResult> {
    const authClient = this.requireAuthClient();
    const existingByEmail = await this.loginIfExisting(input.email, input.password);
    if (existingByEmail) {
      throw new ValidationError("A vendor account with this email already exists.");
    }

    const auth = await authClient.signUpWithPassword(input.email, input.password);
    const existingVendor = await this.vendors.findByOwnerUserId(auth.user.id);
    if (existingVendor) {
      return {
        accessToken: auth.accessToken,
        vendor: existingVendor,
      };
    }

    const vendor = await this.vendors.create({
      ownerUserId: auth.user.id,
      businessName: input.businessName,
      description: input.description,
      location: input.location,
      contactEmail: input.contactEmail,
      contactPhone: input.contactPhone,
    });

    return {
      accessToken: auth.accessToken,
      vendor,
    };
  }

  private async loginIfExisting(email: string, password: string) {
    try {
      return await this.loginVendor(email, password);
    } catch {
      return null;
    }
  }
}
