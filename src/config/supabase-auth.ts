import { createClient, type User } from "@supabase/supabase-js";
import { UnauthorizedError, ValidationError } from "../shared/utils/app-error.js";

export interface SupabaseAuthClient {
  getUser(accessToken: string): Promise<Pick<User, "id" | "email">>;
  signInWithPassword(email: string, password: string): Promise<{ accessToken: string; user: Pick<User, "id" | "email"> }>;
  signUpWithPassword(email: string, password: string): Promise<{ accessToken: string; user: Pick<User, "id" | "email"> }>;
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

  function mapUser(user: User | null | undefined) {
    if (!user) {
      throw new UnauthorizedError("Authentication did not return a valid user.");
    }

    return {
      id: user.id,
      email: user.email,
    };
  }

  cachedAuthClient = {
    async getUser(accessToken: string) {
      const { data, error } = await client.auth.getUser(accessToken);
      if (error || !data.user) {
        throw new UnauthorizedError("The supplied bearer token is invalid or expired.");
      }

      return mapUser(data.user);
    },

    async signInWithPassword(email: string, password: string) {
      const { data, error } = await client.auth.signInWithPassword({ email, password });
      if (error || !data.session) {
        throw new UnauthorizedError(error?.message ?? "Invalid email or password.");
      }

      return {
        accessToken: data.session.access_token,
        user: mapUser(data.user),
      };
    },

    async signUpWithPassword(email: string, password: string) {
      const { data, error } = await client.auth.signUp({ email, password });
      if (error) {
        throw new ValidationError(error.message);
      }

      if (!data.session || !data.user) {
        throw new ValidationError("Signup requires email confirmation before a session is available.");
      }

      return {
        accessToken: data.session.access_token,
        user: mapUser(data.user),
      };
    },
  };

  return cachedAuthClient;
}
