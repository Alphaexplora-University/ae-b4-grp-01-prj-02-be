import type { AppConfig } from "./app-config.js";
import { CatalogController } from "../controllers/catalog.controller.js";
import { InquiryController } from "../controllers/inquiry.controller.js";
import {
  MemoryCatalogItemRepository,
  MemoryInquiryRepository,
  MemoryVendorRepository,
} from "../repositories/in-memory-repositories.js";
import { PostgresCatalogItemRepository, PostgresInquiryRepository, PostgresVendorRepository } from "../repositories/supabase-repositories.js";
import { CatalogService } from "../services/catalog.service.js";
import { InquiryService } from "../services/inquiry.service.js";
import { createDatabaseClient } from "./supabase.js";

export function buildDependencies(config: AppConfig) {
  const useDatabase = Boolean(config.databaseUrl);

  const database = useDatabase
    ? createDatabaseClient(config.databaseUrl!)
    : null;
  const vendorRepository = database ? new PostgresVendorRepository(database) : new MemoryVendorRepository();
  const catalogItemRepository = database
    ? new PostgresCatalogItemRepository(database)
    : new MemoryCatalogItemRepository();
  const inquiryRepository = database ? new PostgresInquiryRepository(database) : new MemoryInquiryRepository();

  const catalogService = new CatalogService(catalogItemRepository, vendorRepository);
  const inquiryService = new InquiryService(inquiryRepository, catalogItemRepository, vendorRepository);

  return {
    catalogController: new CatalogController(catalogService),
    inquiryController: new InquiryController(inquiryService),
  };
}
