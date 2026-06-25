import postgres, { type Sql } from "postgres";

let cachedClient: Sql | null = null;

export function createDatabaseClient(connectionString: string): Sql {
  if (cachedClient) {
    return cachedClient;
  }

  cachedClient = postgres(connectionString, {
    ssl: "require",
  });

  return cachedClient;
}
