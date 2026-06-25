import { Router } from "express";
import type { InquiryController } from "./inquiry.controller.js";

export function inquiryRoutes(inquiryController: InquiryController): Router {
  const router = Router();

  router.get("/inquiries", inquiryController.listInquiries);
  router.post("/inquiries", inquiryController.submitInquiry);
  router.get("/inquiries/:inquiryId", inquiryController.getInquiryById);
  router.patch("/inquiries/:inquiryId", inquiryController.updateInquiry);
  router.delete("/inquiries/:inquiryId", inquiryController.deleteInquiry);

  return router;
}
