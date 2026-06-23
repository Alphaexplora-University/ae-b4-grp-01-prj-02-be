import { Router } from "express";
import type { CatalogController } from "../controllers/catalog.controller.js";
import { requireVendorAccess } from "../middlewares/vendor-auth.js";

export function catalogRoutes(catalogController: CatalogController): Router {
  const router = Router();

  router.get("/catalog-items", catalogController.listCatalogItems);
  router.post("/vendors/:vendorId/catalog-items", requireVendorAccess, catalogController.createCatalogItem);
  router.patch("/vendors/:vendorId/catalog-items/:itemId", requireVendorAccess, catalogController.updateCatalogItem);
  router.delete("/vendors/:vendorId/catalog-items/:itemId", requireVendorAccess, catalogController.deleteCatalogItem);

  return router;
}
