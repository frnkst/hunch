import {
  ChartNoAxesColumnIncreasing,
  CirclePlus,
  House,
  LogOut,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import Link from "next/link";

import { signOut } from "@/app/actions";
import { Avatar } from "@/components/avatar";
import type { Profile } from "@/lib/auth";
import { cn } from "@/lib/utils";

type Active = "home" | "new" | "leaderboard" | "admin";

const links = [
  { href: "/", label: "Hunches", icon: House, key: "home" },
  { href: "/new", label: "New", icon: CirclePlus, key: "new" },
  {
    href: "/leaderboard",
    label: "Leaders",
    icon: ChartNoAxesColumnIncreasing,
    key: "leaderboard",
  },
] as const;

export function AppHeader({
  active,
  profile,
}: {
  active: Active;
  profile: Profile;
}) {
  const visibleLinks = profile.is_admin
    ? [
        ...links,
        { href: "/admin", label: "Admin", icon: ShieldCheck, key: "admin" as const },
      ]
    : links;

  return (
    <>
      <header className="mb-7 flex items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-2.5 text-lg font-extrabold tracking-[-0.04em]"
        >
          <span className="flex size-9 items-center justify-center rounded-[0.9rem] bg-gradient-to-br from-[#7457d9] to-[#9b86f2] text-white shadow-lg shadow-violet-950/20">
            <Sparkles className="size-4" aria-hidden="true" />
          </span>
          hunch
        </Link>
        <div className="flex items-center gap-2">
          <div className="hidden items-center gap-1 rounded-2xl border border-white/85 bg-white/72 p-1.5 shadow-sm backdrop-blur md:flex">
            {visibleLinks.map(({ href, label, icon: Icon, key }) => (
              <Link
                key={key}
                href={href}
                className={cn(
                  "flex h-8 items-center gap-1.5 rounded-xl px-2.5 text-xs font-bold",
                  active === key
                    ? "bg-violet-100 text-violet-800"
                    : "text-slate-500 hover:bg-violet-50",
                )}
              >
                <Icon className="size-3.5" />
                {label}
              </Link>
            ))}
          </div>
          <Avatar
            username={profile.username}
            src={profile.avatar_url}
            size="md"
          />
          <form action={signOut}>
            <button
              type="submit"
              className="flex size-9 items-center justify-center rounded-full bg-white/65 text-violet-700 hover:bg-white"
              aria-label="Sign out"
            >
              <LogOut className="size-4" />
            </button>
          </form>
        </div>
      </header>

      <nav className="fixed inset-x-3 bottom-[max(0.75rem,env(safe-area-inset-bottom))] z-40 mx-auto flex max-w-md items-center gap-1 rounded-[1.4rem] border border-violet-100/90 bg-white/88 p-1.5 shadow-[0_18px_55px_rgba(82,61,136,0.22)] backdrop-blur-2xl md:hidden">
        {visibleLinks.map(({ href, label, icon: Icon, key }) => (
          <Link
            key={key}
            href={href}
            className={cn(
              "flex h-12 flex-1 items-center justify-center gap-1.5 rounded-[1.05rem] px-2 text-[0.7rem] font-bold",
              active === key
                ? "bg-gradient-to-br from-[#7457d9] to-[#9b86f2] text-white shadow-lg"
                : "text-slate-500",
            )}
          >
            <Icon className="size-4" />
            {label}
          </Link>
        ))}
      </nav>
    </>
  );
}
