import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import { authRoutes } from "./auth/auth.routes.js";
import { catalogRoutes } from "./catalog/catalog.routes.js";
import type { AppConfig } from "./config/app-config.js";
import { buildDependencies } from "./config/dependencies.js";
import { inquiryRoutes } from "./inquiry/inquiry.routes.js";
import { errorHandler } from "./shared/middleware/error.middleware.js";
import { vendorRoutes } from "./vendor/vendor.routes.js";

export function createApp(config: AppConfig) {
  const app = express();
  const { authController, catalogController, inquiryController, vendorController } = buildDependencies(config);

  app.use(helmet());
  app.use(cors({ origin: config.webOrigin }));
  app.use(express.json({ limit: config.jsonLimit }));
  app.use(morgan("dev"));

  app.get("/health", (_request, response) => {
    response.json({ status: "ok" });
  });

  app.use("/api", authRoutes(authController));
  app.use("/api", vendorRoutes(vendorController));
  app.use("/api", catalogRoutes(catalogController));
  app.use("/api", inquiryRoutes(inquiryController));
  app.use(errorHandler);

  return app;
}
