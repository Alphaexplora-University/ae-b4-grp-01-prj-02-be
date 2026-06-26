import { Router } from "express";
import type { CatalogController } from "./catalog.controller.js";

export function catalogRoutes(catalogController: CatalogController): Router {
  const router = Router();

  router.get("/catalog-items", catalogController.listCatalogItems);
  router.post("/catalog-items", catalogController.createCatalogItem);
  router.post("/catalog-items/drafts", catalogController.createDraftCatalogItem);
  router.get("/catalog-items/:itemId", catalogController.getCatalogItemById);
  router.patch("/catalog-items/:itemId", catalogController.updateCatalogItem);
  router.post("/catalog-items/:itemId/publish", catalogController.publishDraftCatalogItem);
  router.post("/catalog-items/:itemId/archive", catalogController.archiveCatalogItem);
  router.delete("/catalog-items/:itemId", catalogController.deleteCatalogItem);

  return router;
}
