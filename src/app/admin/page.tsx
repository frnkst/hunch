import { UserCheck, Users } from "lucide-react";

import { approveMember } from "@/app/actions";
import { AppHeader } from "@/components/app-header";
import { Avatar } from "@/components/avatar";
import { Notice } from "@/components/notice";
import { RemoveMemberButton } from "@/components/remove-member-button";
import { requireAdmin } from "@/lib/auth";
import { getPendingProfiles, getProfiles } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{
    error?: string;
    approved?: string;
    removed?: string;
  }>;
}) {
  const { profile } = await requireAdmin();
  const params = await searchParams;
  const [pending, members] = await Promise.all([
    getPendingProfiles(),
    getProfiles(),
  ]);

  return (
    <main className="mx-auto min-h-dvh w-full max-w-3xl px-4 py-5 pb-28 sm:px-6 sm:py-7 md:pb-12">
      <AppHeader active="admin" profile={profile} />
      <section className="mb-7 px-1">
        <p className="eyebrow text-violet-700">Admin</p>
        <h1 className="display-title mt-1 text-4xl sm:text-5xl">New members</h1>
      </section>
      <Notice
        error={params.error}
        success={
          params.approved
            ? "Member approved."
            : params.removed
              ? "Member removed and their content anonymized."
              : undefined
        }
      />
      <section className="glass-panel rounded-[1.8rem] p-4">
        {pending.length ? (
          <ul className="space-y-2">
            {pending.map((member) => (
              <li
                key={member.user_id}
                className="flex items-center gap-3 rounded-[1.2rem] bg-white/65 p-3"
              >
                <Avatar
                  username={member.username}
                  src={member.avatar_url}
                  size="md"
                />
                <p className="min-w-0 flex-1 truncate text-sm font-extrabold">
                  @{member.username}
                </p>
                <form action={approveMember}>
                  <input type="hidden" name="userId" value={member.user_id} />
                  <button type="submit" className="button-primary">
                    <UserCheck className="size-4" />
                    Approve
                  </button>
                </form>
              </li>
            ))}
          </ul>
        ) : (
          <div className="py-14 text-center">
            <Users className="mx-auto size-7 text-violet-400" />
            <h2 className="mt-3 font-extrabold">Nobody is waiting</h2>
            <p className="mt-1 text-sm text-[#77708c]">
              New GitHub sign-ins will appear here.
            </p>
          </div>
        )}
      </section>

      <section className="mt-5">
        <h2 className="mb-3 px-1 text-lg font-extrabold">All users</h2>
        <div className="glass-panel rounded-[1.8rem] p-4">
          <ul className="space-y-2">
            {members.map((member) => (
              <li
                key={member.user_id}
                className="flex items-center gap-3 rounded-[1.2rem] bg-white/65 p-3"
              >
                <Avatar
                  username={member.username}
                  src={member.avatar_url}
                  size="md"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-extrabold">
                    @{member.username}
                  </p>
                  <p className="text-xs font-semibold capitalize text-[#77708c]">
                    {member.is_admin ? "Admin" : member.status}
                  </p>
                </div>
                {!member.is_admin && member.status !== "removed" ? (
                  <RemoveMemberButton userId={member.user_id} />
                ) : null}
              </li>
            ))}
          </ul>
        </div>
      </section>
    </main>
  );
}
