import { Crown, Trophy } from "lucide-react";
import Link from "next/link";

import { AppHeader } from "@/components/app-header";
import { Avatar } from "@/components/avatar";
import { requireMembership } from "@/lib/auth";
import { getLeaderboard } from "@/lib/data";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function LeaderboardPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string }>;
}) {
  const { profile } = await requireMembership();
  const params = await searchParams;
  const period =
    params.period === "month" || params.period === "year"
      ? params.period
      : "all";
  const rows = await getLeaderboard(period);

  return (
    <main className="mx-auto min-h-dvh w-full max-w-3xl px-4 py-5 pb-28 sm:px-6 sm:py-7 md:pb-12">
      <AppHeader active="leaderboard" profile={profile} />
      <section className="mb-7 px-1">
        <p className="eyebrow text-violet-700">Bragging rights</p>
        <h1 className="display-title mt-1 text-4xl sm:text-5xl">Leaderboard</h1>
      </section>
      <div className="mb-5 flex gap-2">
        {[
          { key: "all", label: "All time", href: "/leaderboard" },
          { key: "month", label: "This month", href: "/leaderboard?period=month" },
          { key: "year", label: "This year", href: "/leaderboard?period=year" },
        ].map((tab) => (
          <Link
            key={tab.key}
            href={tab.href}
            className={cn(
              "rounded-full px-3.5 py-2 text-xs font-extrabold",
              period === tab.key
                ? "bg-violet-700 text-white"
                : "bg-white/70 text-[#77708c]",
            )}
          >
            {tab.label}
          </Link>
        ))}
      </div>
      <section className="glass-panel overflow-hidden rounded-[1.8rem] p-3 sm:p-4">
        {rows.length ? (
          <ol className="space-y-2">
            {rows.map((row, index) => (
              <li
                key={row.userId}
                className={cn(
                  "flex items-center gap-3 rounded-[1.25rem] px-3 py-3.5",
                  index === 0 ? "bg-[#fff4c9]" : "bg-white/55",
                )}
              >
                <span className="flex w-7 justify-center text-sm font-black text-[#77708c]">
                  {index === 0 ? (
                    <Crown className="size-5 text-amber-500" />
                  ) : (
                    index + 1
                  )}
                </span>
                <Avatar
                  username={row.username}
                  src={row.avatarUrl}
                  size="md"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-extrabold">
                    @{row.username}
                  </p>
                  <p className="text-xs text-[#77708c]">
                    {row.predictions} prediction
                    {row.predictions === 1 ? "" : "s"}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-black tracking-[-0.04em]">
                    {Number(row.points.toFixed(2))}
                  </p>
                  <p className="text-[0.62rem] font-bold tracking-wide text-[#77708c] uppercase">
                    points
                  </p>
                </div>
              </li>
            ))}
          </ol>
        ) : (
          <div className="py-14 text-center">
            <Trophy className="mx-auto size-7 text-violet-400" />
            <h2 className="mt-3 font-extrabold">No points yet</h2>
            <p className="mt-1 text-sm text-[#77708c]">
              The board wakes up when the first question is resolved.
            </p>
          </div>
        )}
      </section>
    </main>
  );
}
