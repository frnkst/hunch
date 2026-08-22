import { ArrowRight, CalendarClock, Gift } from "lucide-react";
import Link from "next/link";

import { Avatar } from "@/components/avatar";
import { LocalTime } from "@/components/local-time";
import { isDeadlinePassed, typeLabels } from "@/lib/format";
import type { Question } from "@/lib/types";

export function QuestionCard({ question }: { question: Question }) {
  const closed =
    question.status !== "open" || isDeadlinePassed(question.deadline);
  return (
    <Link
      href={`/questions/${question.id}`}
      className="surface-card group block rounded-[1.5rem] p-5 transition hover:-translate-y-0.5 hover:shadow-[0_16px_38px_rgba(82,61,136,0.11)]"
    >
      <div className="mb-4 flex items-center justify-between gap-3">
        <span className="rounded-full bg-violet-100 px-2.5 py-1 text-[0.66rem] font-extrabold tracking-wide text-violet-700 uppercase">
          {typeLabels[question.type]}
        </span>
        <span
          className={`text-[0.68rem] font-bold ${
            question.status === "resolved"
              ? "text-emerald-600"
              : question.status === "cancelled"
                ? "text-rose-500"
                : closed
                  ? "text-amber-600"
                  : "text-[#77708c]"
          }`}
        >
          {question.status === "resolved"
            ? "Resolved"
            : question.status === "cancelled"
              ? "Cancelled"
              : closed
                ? "Awaiting outcome"
                : "Open"}
        </span>
      </div>
      <h2 className="text-lg font-extrabold leading-snug tracking-[-0.025em]">
        {question.text}
      </h2>
      {question.reward ? (
        <p className="mt-3 flex items-center gap-2 text-xs font-bold text-violet-700">
          <Gift className="size-3.5 shrink-0" />
          <span className="truncate">{question.reward}</span>
        </p>
      ) : null}
      <div className="mt-5 flex items-center justify-between gap-3 text-xs text-[#77708c]">
        <span className="flex items-center gap-2 font-semibold">
          {question.creator ? (
            <>
              <Avatar
                username={question.creator.username}
                src={question.creator.avatar_url}
                size="sm"
              />
              @{question.creator.username}
            </>
          ) : null}
        </span>
        <span className="flex items-center gap-1.5">
          <CalendarClock className="size-3.5" />
          <LocalTime value={question.deadline} />
          <ArrowRight className="ml-1 size-3.5 transition group-hover:translate-x-0.5" />
        </span>
      </div>
    </Link>
  );
}
