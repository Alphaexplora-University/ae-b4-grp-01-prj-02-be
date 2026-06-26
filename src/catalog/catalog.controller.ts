import type { NextFunction, Request, Response } from "express";
import { requireRouteParam } from "../shared/utils/route-params.js";
import type { CatalogService } from "./catalog.service.js";
import {
  catalogItemFiltersSchema,
  createCatalogItemSchema,
  updateCatalogItemSchema,
} from "./catalog.validator.js";

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
      const item = await this.catalogService.createCatalogItem(input);
      response.status(201).json({ data: item });
    } catch (error) {
      next(error);
    }
  };

  createDraftCatalogItem = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
    try {
      const input = createCatalogItemSchema.omit({ status: true }).parse(request.body);
      const item = await this.catalogService.createDraftCatalogItem(input);
      response.status(201).json({ data: item });
    } catch (error) {
      next(error);
    }
  };

  getCatalogItemById = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
    try {
      const itemId = requireRouteParam(request.params.itemId, "itemId");
      const item = await this.catalogService.getCatalogItemById(itemId);
      response.json({ data: item });
    } catch (error) {
      next(error);
    }
  };

  updateCatalogItem = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
    try {
      const input = updateCatalogItemSchema.parse(request.body);
      const itemId = requireRouteParam(request.params.itemId, "itemId");
      const item = await this.catalogService.updateCatalogItem(itemId, input);
      response.json({ data: item });
    } catch (error) {
      next(error);
    }
  };

  publishDraftCatalogItem = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
    try {
      const itemId = requireRouteParam(request.params.itemId, "itemId");
      const item = await this.catalogService.publishDraftCatalogItem(itemId);
      response.json({ data: item });
    } catch (error) {
      next(error);
    }
  };

  archiveCatalogItem = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
    try {
      const itemId = requireRouteParam(request.params.itemId, "itemId");
      const item = await this.catalogService.archiveCatalogItem(itemId);
      response.json({ data: item });
    } catch (error) {
      next(error);
    }
  };

  deleteCatalogItem = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
    try {
      const itemId = requireRouteParam(request.params.itemId, "itemId");
      await this.catalogService.deleteCatalogItem(itemId);
      response.status(204).send();
    } catch (error) {
      next(error);
    }
  };
}
