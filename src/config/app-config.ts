export interface AppConfig {
  port: number;
  webOrigin: string;
  jsonLimit: string;
}

export function loadAppConfig(): AppConfig {
  return {
    port: Number(process.env.PORT ?? 4000),
    webOrigin: process.env.WEB_ORIGIN ?? "http://localhost:5173",
    jsonLimit: process.env.JSON_LIMIT ?? "1mb",
  };
}
