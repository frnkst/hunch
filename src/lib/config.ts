import "server-only";

import { z } from "zod";

const environmentSchema = z.object({
  APP_URL: z.url(),
  ADMIN_GITHUB_USER_ID: z.string().regex(/^\d+$/),
  NEXT_PUBLIC_SUPABASE_URL: z.url(),
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
});

export type AppConfig = {
  appUrl: string;
  adminGitHubUserId: string;
  supabaseUrl: string;
  supabasePublishableKey: string;
  supabaseServiceRoleKey: string;
};

let cachedConfig: AppConfig | undefined;

export function getAppConfig(): AppConfig {
  if (cachedConfig) return cachedConfig;

  const parsed = environmentSchema.safeParse(process.env);
  if (!parsed.success) {
    const details = parsed.error.issues
      .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
      .join("; ");
    throw new Error(`Invalid application environment: ${details}`);
  }

  cachedConfig = {
    appUrl: parsed.data.APP_URL.replace(/\/$/, ""),
    adminGitHubUserId: parsed.data.ADMIN_GITHUB_USER_ID,
    supabaseUrl: parsed.data.NEXT_PUBLIC_SUPABASE_URL,
    supabasePublishableKey:
      parsed.data.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    supabaseServiceRoleKey: parsed.data.SUPABASE_SERVICE_ROLE_KEY,
  };
  return cachedConfig;
}
