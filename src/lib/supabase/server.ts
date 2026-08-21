import "server-only";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

import { getAppConfig } from "@/lib/config";

export async function createServerSupabaseClient() {
  const cookieStore = await cookies();
  const config = getAppConfig();

  return createServerClient(
    config.supabaseUrl,
    config.supabasePublishableKey,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll(cookiesToSet) {
          try {
            for (const { name, value, options } of cookiesToSet) {
              cookieStore.set(name, value, options);
            }
          } catch {
            // Server Components cannot write cookies; the proxy refreshes them.
          }
        },
      },
    },
  );
}
