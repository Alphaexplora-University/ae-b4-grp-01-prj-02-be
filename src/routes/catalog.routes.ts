import { Router, type RequestHandler } from "express";
import type { CatalogController } from "../controllers/catalog.controller.js";
import { requireVendorAccess } from "../middlewares/vendor-auth.js";

export function catalogRoutes(
  catalogController: CatalogController,
  requireVendorAuth: RequestHandler,
): Router {
  const router = Router();

  router.get("/catalog-items", catalogController.listCatalogItems);
  router.get("/catalog-items/:itemId", catalogController.getCatalogItemById);
  router.get("/vendors/:vendorId/catalog-items", requireVendorAuth, requireVendorAccess, catalogController.listVendorCatalogItems);
  router.post("/vendors/:vendorId/catalog-items", requireVendorAuth, requireVendorAccess, catalogController.createCatalogItem);
  router.patch("/vendors/:vendorId/catalog-items/:itemId", requireVendorAuth, requireVendorAccess, catalogController.updateCatalogItem);
  router.delete("/vendors/:vendorId/catalog-items/:itemId", requireVendorAuth, requireVendorAccess, catalogController.deleteCatalogItem);

  return router;
}
