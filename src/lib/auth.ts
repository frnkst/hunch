import "server-only";

import type { User } from "@supabase/supabase-js";
import { redirect } from "next/navigation";

import { createServerSupabaseClient } from "@/lib/supabase/server";

export type Profile = {
  user_id: string;
  github_user_id: string;
  username: string;
  avatar_url: string | null;
  status: "pending" | "approved";
  is_admin: boolean;
};

export type Membership = {
  user: User;
  profile: Profile;
};

export async function getMembership(): Promise<Membership | null> {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select(
      "user_id,github_user_id,username,avatar_url,status,is_admin",
    )
    .eq("user_id", user.id)
    .maybeSingle();

  return profile ? { user, profile: profile as Profile } : null;
}

export async function requireMembership(): Promise<Membership> {
  const membership = await getMembership();
  if (!membership) redirect("/login");
  if (membership.profile.status !== "approved") redirect("/pending");
  return membership;
}

export async function requireAdmin(): Promise<Membership> {
  const membership = await requireMembership();
  if (!membership.profile.is_admin) redirect("/");
  return membership;
}
