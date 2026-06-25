import { Router, type RequestHandler } from "express";
import { requireVendorAccess } from "../shared/middleware/auth.middleware.js";
import type { InquiryController } from "./inquiry.controller.js";

export function inquiryRoutes(
  inquiryController: InquiryController,
  requireVendorAuth: RequestHandler,
): Router {
  const router = Router();

  router.post("/inquiries", inquiryController.submitInquiry);
  router.get("/vendors/:vendorId/inquiries", requireVendorAuth, requireVendorAccess, inquiryController.listVendorInquiries);
  router.patch(
    "/vendors/:vendorId/inquiries/:inquiryId/status",
    requireVendorAuth,
    requireVendorAccess,
    inquiryController.updateInquiryStatus,
  );

  return router;
}
