import { NextResponse, type NextRequest } from "next/server";

import { getAppConfig } from "@/lib/config";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { createServerSupabaseClient } from "@/lib/supabase/server";

function stringValue(value: unknown): string | null {
  if (typeof value === "string" || typeof value === "number") {
    return String(value);
  }
  return null;
}

export async function GET(request: NextRequest) {
  const config = getAppConfig();
  const code = request.nextUrl.searchParams.get("code");
  if (!code) {
    return NextResponse.redirect(
      new URL("/login?error=Missing%20OAuth%20code", config.appUrl),
    );
  }

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent(error.message)}`, config.appUrl),
    );
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.redirect(new URL("/login", config.appUrl));
  }

  const githubIdentity = user.identities?.find(
    (identity) => identity.provider === "github",
  );
  const githubUserId =
    stringValue(githubIdentity?.identity_data?.provider_id) ??
    stringValue(githubIdentity?.identity_data?.sub) ??
    stringValue(user.user_metadata.provider_id) ??
    stringValue(user.user_metadata.sub) ??
    stringValue(githubIdentity?.identity_id);
  const username =
    stringValue(user.user_metadata.user_name) ??
    stringValue(user.user_metadata.preferred_username);
  if (!githubUserId || !username) {
    await supabase.auth.signOut();
    return NextResponse.redirect(
      new URL("/login?error=GitHub%20profile%20is%20incomplete", config.appUrl),
    );
  }

  const admin = createAdminSupabaseClient();
  const { data: existing } = await admin
    .from("profiles")
    .select("status")
    .eq("user_id", user.id)
    .maybeSingle();
  const isAdmin = githubUserId === config.adminGitHubUserId;
  const { error: profileError } = await admin.from("profiles").upsert({
    user_id: user.id,
    github_user_id: githubUserId,
    username,
    avatar_url: stringValue(user.user_metadata.avatar_url),
    status: isAdmin ? "approved" : (existing?.status ?? "pending"),
    is_admin: isAdmin,
  });
  if (profileError) {
    await supabase.auth.signOut();
    return NextResponse.redirect(
      new URL(
        `/login?error=${encodeURIComponent(profileError.message)}`,
        config.appUrl,
      ),
    );
  }

  return NextResponse.redirect(
    new URL(isAdmin || existing?.status === "approved" ? "/" : "/pending", config.appUrl),
  );
}
