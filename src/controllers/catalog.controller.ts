import type { NextFunction, Request, Response } from "express";
import type { CatalogService } from "../services/catalog.service.js";
import {
  catalogItemFiltersSchema,
  createCatalogItemSchema,
  updateCatalogItemSchema,
} from "../middlewares/validation-schemas.js";

export class CatalogController {
  constructor(private readonly catalogService: CatalogService) {}

  listCatalogItems = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
    try {
      const filters = catalogItemFiltersSchema.parse(request.query);
      const items = await this.catalogService.listCatalogItems(filters);
      response.json({ data: items });
    } catch (error) {
      next(error);
    }
  };

  createCatalogItem = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
    try {
      const input = createCatalogItemSchema.parse(request.body);
      const item = await this.catalogService.createCatalogItem(request.params.vendorId, input);
      response.status(201).json({ data: item });
    } catch (error) {
      next(error);
    }
  };

  updateCatalogItem = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
    try {
      const input = updateCatalogItemSchema.parse(request.body);
      const item = await this.catalogService.updateCatalogItem(request.params.vendorId, request.params.itemId, input);
      response.json({ data: item });
    } catch (error) {
      next(error);
    }
  };

  deleteCatalogItem = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
    try {
      await this.catalogService.deleteCatalogItem(request.params.vendorId, request.params.itemId);
      response.status(204).send();
    } catch (error) {
      next(error);
    }
  };
}
