import "dotenv/config";
import { createApp } from "./app.js";
import { loadAppConfig } from "./config/app-config.js";

const config = loadAppConfig();
const app = createApp(config);

app.listen(config.port, () => {
  console.log(`API listening on http://localhost:${config.port}`);
});
