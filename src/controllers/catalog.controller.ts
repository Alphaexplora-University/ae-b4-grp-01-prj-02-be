import type { NextFunction, Request, Response } from "express";
import type { CatalogService } from "../services/catalog.service.js";
import {
  catalogItemFiltersSchema,
  createCatalogItemSchema,
  updateCatalogItemSchema,
} from "../middlewares/validation-schemas.js";

function requireRouteParam(value: string | undefined, name: string): string {
  if (!value) {
    throw new Error(`Missing route param: ${name}`);
  }

  return value;
}

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
      const vendorId = requireRouteParam(request.params.vendorId, "vendorId");
      const item = await this.catalogService.createCatalogItem(vendorId, input);
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
      const vendorId = requireRouteParam(request.params.vendorId, "vendorId");
      const itemId = requireRouteParam(request.params.itemId, "itemId");
      const item = await this.catalogService.updateCatalogItem(vendorId, itemId, input);
      response.json({ data: item });
    } catch (error) {
      next(error);
    }
  };

  deleteCatalogItem = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
    try {
      const vendorId = requireRouteParam(request.params.vendorId, "vendorId");
      const itemId = requireRouteParam(request.params.itemId, "itemId");
      await this.catalogService.deleteCatalogItem(vendorId, itemId);
      response.status(204).send();
    } catch (error) {
      next(error);
    }
  };

  listVendorCatalogItems = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
    try {
      const vendorId = requireRouteParam(request.params.vendorId, "vendorId");
      const items = await this.catalogService.listVendorCatalogItems(vendorId);
      response.json({ data: items });
    } catch (error) {
      next(error);
    }
  };
}
