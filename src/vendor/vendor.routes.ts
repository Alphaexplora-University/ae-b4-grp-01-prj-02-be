import { Router, type RequestHandler } from "express";
import type { VendorController } from "./vendor.controller.js";

export function vendorRoutes(
  vendorController: VendorController,
  requireVendorAuth: RequestHandler,
): Router {
  const router = Router();

  router.get("/vendors/:vendorId", vendorController.getVendorById);
  router.get("/vendors/me", requireVendorAuth, vendorController.getAuthenticatedVendorProfile);
  router.patch("/vendors/me", requireVendorAuth, vendorController.updateAuthenticatedVendorProfile);

  return router;
}
