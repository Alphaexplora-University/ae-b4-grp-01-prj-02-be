import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import type { AppConfig } from "./config/app-config.js";
import { buildDependencies } from "./config/dependencies.js";
import { errorHandler } from "./middlewares/error-handler.js";
import { catalogRoutes } from "./routes/catalog.routes.js";
import { inquiryRoutes } from "./routes/inquiry.routes.js";

export function createApp(config: AppConfig) {
  const app = express();
  const { catalogController, inquiryController } = buildDependencies();

  app.use(helmet());
  app.use(cors({ origin: config.webOrigin }));
  app.use(express.json({ limit: config.jsonLimit }));
  app.use(morgan("dev"));

  app.get("/health", (_request, response) => {
    response.json({ status: "ok" });
  });

  app.use("/api", catalogRoutes(catalogController));
  app.use("/api", inquiryRoutes(inquiryController));
  app.use(errorHandler);

  return app;
}
