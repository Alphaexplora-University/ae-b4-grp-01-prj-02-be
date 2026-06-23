import type { RequestHandler } from "express";
import { ForbiddenError } from "./http-errors.js";

export const requireVendorAccess: RequestHandler = (request, _response, next) => {
  const vendorId = request.params.vendorId;
  const authenticatedVendorId = request.header("x-vendor-id");

  if (!vendorId || authenticatedVendorId !== vendorId) {
    next(new ForbiddenError("Vendor access header does not match the requested vendor."));
    return;
  }

  next();
};
