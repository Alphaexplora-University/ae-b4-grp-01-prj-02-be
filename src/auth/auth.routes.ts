import { Router } from "express";
import type { AuthController } from "./auth.controller.js";

export function authRoutes(authController: AuthController): Router {
  const router = Router();

  router.post("/auth/login", authController.loginVendor);
  router.post("/auth/signup", authController.signupVendor);

  return router;
}
