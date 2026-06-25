import { createClient, type User } from "@supabase/supabase-js";
import { UnauthorizedError } from "../middlewares/http-errors.js";

export interface SupabaseAuthClient {
  getUser(accessToken: string): Promise<Pick<User, "id" | "email">>;
}

let cachedAuthClient: SupabaseAuthClient | null = null;

export function createSupabaseAuthClient(supabaseUrl: string, supabaseKey: string): SupabaseAuthClient {
  if (cachedAuthClient) {
    return cachedAuthClient;
  }

  const client = createClient(supabaseUrl, supabaseKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  cachedAuthClient = {
    async getUser(accessToken: string) {
      const { data, error } = await client.auth.getUser(accessToken);
      if (error || !data.user) {
        throw new UnauthorizedError("The supplied bearer token is invalid or expired.");
      }

      return {
        id: data.user.id,
        email: data.user.email,
      };
    },
  };

  return cachedAuthClient;
}
