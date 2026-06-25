import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { randomUUID } from "node:crypto";
import type { AppConfig } from "../config/app-config.js";
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
    private readonly vendors: VendorRepository,
    private readonly config: Pick<AppConfig, "jwtSecret">,
  ) {}

  private createAccessToken(vendor: Vendor): string {
    return jwt.sign(
      {
        sub: vendor.id,
        role: "vendor",
        email: vendor.contactEmail,
      },
      this.config.jwtSecret,
      { expiresIn: "7d" },
    );
  }

  async loginVendor(email: string, password: string): Promise<AuthResult> {
    const authRecord = await this.vendors.findAuthByEmail(email);
    if (!authRecord) {
      throw new UnauthorizedError("Invalid email or password.");
    }

    const isValid = await bcrypt.compare(password, authRecord.passwordHash);
    if (!isValid) {
      throw new UnauthorizedError("Invalid email or password.");
    }

    return {
      accessToken: this.createAccessToken(authRecord.vendor),
      vendor: authRecord.vendor,
    };
  }

  async signupVendor(input: SignupVendorDto): Promise<AuthResult> {
    const existing = await this.vendors.findAuthByEmail(input.email);
    if (existing) {
      throw new ValidationError("A vendor account with this email already exists.");
    }

    const passwordHash = await bcrypt.hash(input.password, 10);
    const vendor = await this.vendors.create({
      ownerUserId: randomUUID(),
      businessName: input.businessName,
      description: input.description,
      location: input.location,
      contactEmail: input.email,
      contactPhone: input.contactPhone,
      passwordHash,
    });

    return {
      accessToken: this.createAccessToken(vendor),
      vendor,
    };
  }
}
