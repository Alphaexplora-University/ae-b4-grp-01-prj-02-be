import "dotenv/config";
import { createApp } from "./app.js";
import { loadAppConfig } from "./config/app-config.js";
import { createDatabaseClient, initializeDatabaseSchema } from "./config/database.js";

const config = loadAppConfig();
console.log(`[startup] DATABASE_URL loaded: ${Boolean(process.env.DATABASE_URL)}`);

if (config.databaseUrl) {
  const database = createDatabaseClient(config.databaseUrl);
  await initializeDatabaseSchema(database);
  console.log("[startup] Database schema initialized");
}

const app = createApp(config);

app.listen(config.port, () => {
  console.log(`API listening on http://localhost:${config.port}`);
});
