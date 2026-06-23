import { CatalogController } from "../controllers/catalog.controller.js";
import { InquiryController } from "../controllers/inquiry.controller.js";
import {
  MemoryCatalogItemRepository,
  MemoryInquiryRepository,
  MemoryVendorRepository,
} from "../repositories/in-memory-repositories.js";
import { CatalogService } from "../services/catalog.service.js";
import { InquiryService } from "../services/inquiry.service.js";

export function buildDependencies() {
  const vendorRepository = new MemoryVendorRepository();
  const catalogItemRepository = new MemoryCatalogItemRepository();
  const inquiryRepository = new MemoryInquiryRepository();

  const catalogService = new CatalogService(catalogItemRepository, vendorRepository);
  const inquiryService = new InquiryService(inquiryRepository, catalogItemRepository, vendorRepository);

  return {
    catalogController: new CatalogController(catalogService),
    inquiryController: new InquiryController(inquiryService),
  };
}
