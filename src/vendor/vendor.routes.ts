import { Router } from "express";
import type { VendorController } from "./vendor.controller.js";

export function vendorRoutes(vendorController: VendorController): Router {
  const router = Router();

  router.get("/vendors", vendorController.listVendors);
  router.post("/vendors", vendorController.createVendor);
  router.get("/vendors/:vendorId", vendorController.getVendorById);
  router.patch("/vendors/:vendorId", vendorController.updateVendor);
  router.delete("/vendors/:vendorId", vendorController.deleteVendor);

  return router;
}
