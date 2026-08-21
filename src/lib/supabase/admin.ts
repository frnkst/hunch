import "server-only";

import { createClient } from "@supabase/supabase-js";

import { getAppConfig } from "@/lib/config";

export function createAdminSupabaseClient() {
  const config = getAppConfig();
  return createClient(config.supabaseUrl, config.supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
