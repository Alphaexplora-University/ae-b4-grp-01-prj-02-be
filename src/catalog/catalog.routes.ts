import { Router } from "express";
import type { CatalogController } from "./catalog.controller.js";

export function catalogRoutes(catalogController: CatalogController): Router {
  const router = Router();

  router.get("/catalog-items", catalogController.listCatalogItems);
  router.post("/catalog-items", catalogController.createCatalogItem);
  router.get("/catalog-items/:itemId", catalogController.getCatalogItemById);
  router.patch("/catalog-items/:itemId", catalogController.updateCatalogItem);
  router.delete("/catalog-items/:itemId", catalogController.deleteCatalogItem);

  return router;
}
