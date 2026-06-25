import type { NextFunction, Request, Response } from "express";
import type { AuthService } from "./auth.service.js";
import { loginVendorSchema, signupVendorSchema } from "./auth.validator.js";

export class AuthController {
  constructor(private readonly authService: AuthService) {}

  loginVendor = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
    try {
      const input = loginVendorSchema.parse(request.body);
      const result = await this.authService.loginVendor(input.email, input.password);
      response.json({ data: result });
    } catch (error) {
      next(error);
    }
  };

  signupVendor = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
    try {
      const input = signupVendorSchema.parse(request.body);
      const result = await this.authService.signupVendor(input);
      response.status(201).json({ data: result });
    } catch (error) {
      next(error);
    }
  };
}
