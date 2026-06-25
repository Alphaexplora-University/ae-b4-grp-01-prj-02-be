import type { AuthenticatedVendor } from "./entities.js";

declare global {
  namespace Express {
    interface Request {
      authenticatedVendor?: AuthenticatedVendor;
    }
  }
}

export {};
