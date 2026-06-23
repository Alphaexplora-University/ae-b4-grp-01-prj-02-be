import { Router } from "express";
import type { InquiryController } from "../controllers/inquiry.controller.js";
import { requireVendorAccess } from "../middlewares/vendor-auth.js";

export function inquiryRoutes(inquiryController: InquiryController): Router {
  const router = Router();

  router.post("/inquiries", inquiryController.submitInquiry);
  router.get("/vendors/:vendorId/inquiries", requireVendorAccess, inquiryController.listVendorInquiries);

  return router;
}
