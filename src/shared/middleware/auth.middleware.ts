import type { RequestHandler } from "express";
import type { SupabaseAuthClient } from "../../config/supabase-auth.js";
import type { VendorRepository } from "../../repositories/repository.types.js";
import { ForbiddenError, UnauthorizedError } from "../utils/app-error.js";

function extractBearerToken(authorizationHeader?: string): string | null {
  if (!authorizationHeader) {
    return null;
  }

  const [scheme, token] = authorizationHeader.split(" ");
  if (scheme?.toLowerCase() !== "bearer" || !token) {
    return null;
  }

  return token;
}

export function requireVendorAuth(
  authClient: SupabaseAuthClient | null,
  vendors: VendorRepository,
): RequestHandler {
  return async (request, _response, next) => {
    try {
      if (!authClient) {
        throw new UnauthorizedError("Vendor authentication is not configured on the backend.");
      }

      const token = extractBearerToken(request.header("authorization"));
      if (!token) {
        throw new UnauthorizedError("Missing bearer token.");
      }

      const user = await authClient.getUser(token);
      const vendor = await vendors.findByOwnerUserId(user.id);
      if (!vendor) {
        throw new ForbiddenError("The authenticated user is not linked to a vendor account.");
      }

      request.authenticatedVendor = {
        userId: user.id,
        vendorId: vendor.id,
      };

      next();
    } catch (error) {
      next(error);
    }
  };
}

export const requireVendorAccess: RequestHandler = (request, _response, next) => {
  const routeVendorId = request.params.vendorId;
  const authenticatedVendorId = request.authenticatedVendor?.vendorId;

  if (!authenticatedVendorId) {
    next(new UnauthorizedError("Vendor authentication is required before authorization can be checked."));
    return;
  }

  if (routeVendorId && routeVendorId !== authenticatedVendorId) {
    next(new ForbiddenError("The authenticated vendor does not own this resource."));
    return;
  }

  next();
};
