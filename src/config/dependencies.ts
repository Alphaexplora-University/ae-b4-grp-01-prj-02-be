import type { AppConfig } from "./app-config.js";
import { AuthController } from "../auth/auth.controller.js";
import { AuthService } from "../auth/auth.service.js";
import { CatalogController } from "../catalog/catalog.controller.js";
import { CatalogService } from "../catalog/catalog.service.js";
import { InquiryController } from "../inquiry/inquiry.controller.js";
import { InquiryService } from "../inquiry/inquiry.service.js";
import {
  MemoryCatalogItemRepository,
  MemoryInquiryRepository,
  MemoryVendorRepository,
} from "../repositories/in-memory-repositories.js";
import { PostgresCatalogItemRepository, PostgresInquiryRepository, PostgresVendorRepository } from "../repositories/supabase-repositories.js";
import { requireVendorAuth } from "../shared/middleware/auth.middleware.js";
import { VendorController } from "../vendor/vendor.controller.js";
import { VendorService } from "../vendor/vendor.service.js";
import { createDatabaseClient } from "./database.js";
import { createSupabaseAuthClient } from "./supabase-auth.js";

export function buildDependencies(config: AppConfig) {
  const useDatabase = Boolean(config.databaseUrl);
  const authKey = config.supabaseServiceRoleKey ?? config.supabaseAnonKey;

  const database = useDatabase
    ? createDatabaseClient(config.databaseUrl!)
    : null;
  const vendorRepository = database ? new PostgresVendorRepository(database) : new MemoryVendorRepository();
  const catalogItemRepository = database
    ? new PostgresCatalogItemRepository(database)
    : new MemoryCatalogItemRepository();
  const inquiryRepository = database ? new PostgresInquiryRepository(database) : new MemoryInquiryRepository();
  const authClient = config.supabaseUrl && authKey
    ? createSupabaseAuthClient(config.supabaseUrl, authKey)
    : null;

  const authService = new AuthService(authClient, vendorRepository);
  const catalogService = new CatalogService(catalogItemRepository, vendorRepository);
  const inquiryService = new InquiryService(inquiryRepository, catalogItemRepository, vendorRepository);
  const vendorService = new VendorService(vendorRepository);

  return {
    authController: new AuthController(authService),
    catalogController: new CatalogController(catalogService),
    inquiryController: new InquiryController(inquiryService),
    vendorController: new VendorController(vendorService),
    requireVendorAuth: requireVendorAuth(authClient, vendorRepository),
  };
}
