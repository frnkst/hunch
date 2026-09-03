"use client";

import { UserMinus } from "lucide-react";

import { removeMember } from "@/app/actions";

export function RemoveMemberButton({ userId }: { userId: string }) {
  return (
    <form
      action={removeMember}
      onSubmit={(event) => {
        if (
          !window.confirm(
            "Remove this member? Their hunches and predictions will be kept anonymously.",
          )
        ) {
          event.preventDefault();
        }
      }}
    >
      <input type="hidden" name="userId" value={userId} />
      <button
        type="submit"
        className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50"
      >
        <UserMinus className="size-4" />
        Remove
      </button>
    </form>
  );
}
