import { Clock3, LogOut } from "lucide-react";
import { redirect } from "next/navigation";

import { signOut } from "@/app/actions";
import { Avatar } from "@/components/avatar";
import { SubmitButton } from "@/components/submit-button";
import { getMembership } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function PendingPage() {
  const membership = await getMembership();
  if (!membership) redirect("/login");
  if (membership.profile.status === "approved") redirect("/");
  if (membership.profile.status === "removed") {
    redirect("/login?error=This membership has been removed.");
  }

  return (
    <main className="flex min-h-dvh items-center justify-center px-5">
      <section className="glass-panel w-full max-w-sm rounded-[2rem] p-8 text-center">
        <Avatar
          username={membership.profile.username}
          src={membership.profile.avatar_url}
          size="lg"
        />
        <Clock3 className="mx-auto mt-6 size-7 text-violet-500" />
        <h1 className="mt-3 text-2xl font-extrabold tracking-tight">
          Approval pending
        </h1>
        <p className="mt-3 text-sm leading-6 text-[#77708c]">
          @{membership.profile.username}, the Hunch admin needs to approve your
          account. Refresh this page after they do.
        </p>
        <div className="mt-7 grid grid-cols-2 gap-3">
          <a href="/pending" className="button-primary">
            Check again
          </a>
          <form action={signOut}>
            <SubmitButton
              type="submit"
              className="button-secondary h-full w-full"
              pendingLabel="Signing out"
            >
              <LogOut className="size-4" />
              Sign out
            </SubmitButton>
          </form>
        </div>
      </section>
    </main>
  );
}
