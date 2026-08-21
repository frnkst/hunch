import { Sparkles } from "lucide-react";
import Link from "next/link";

import { AppHeader } from "@/components/app-header";
import { Notice } from "@/components/notice";
import { QuestionCard } from "@/components/question-card";
import { requireMembership } from "@/lib/auth";
import { getQuestions } from "@/lib/data";
import { filterQuestionsForHome, getHomeView } from "@/lib/home-filter";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ view?: string; error?: string }>;
}) {
  const { profile } = await requireMembership();
  const params = await searchParams;
  const questions = await getQuestions();
  const view = getHomeView(params.view);
  const visible = filterQuestionsForHome(questions, view);

  return (
    <main className="mx-auto min-h-dvh w-full max-w-5xl px-4 py-5 pb-28 sm:px-6 sm:py-7 md:pb-12">
      <AppHeader active="home" profile={profile} />
      <Notice error={params.error} />

      <section className="mb-7 flex items-end justify-between gap-5 px-1">
        <div>
          <p className="eyebrow text-violet-700">Predict together</p>
          <h1 className="display-title mt-1 text-[2.8rem] leading-[0.98] sm:text-5xl">
            What&apos;s your
            <br />
            <span className="bg-gradient-to-r from-[#7457d9] to-[#a17ce6] bg-clip-text text-transparent">
              hunch?
            </span>
          </h1>
        </div>
        <Link
          href="/new"
          aria-label="New question"
          className="button-primary hidden size-14 p-0 text-4xl leading-none sm:inline-flex"
        >
          <span aria-hidden="true">+</span>
        </Link>
      </section>

      <div className="mb-5 flex gap-2">
        {[
          { key: "open", label: "Open" },
          { key: "resolved", label: "Resolved" },
        ].map((tab) => (
          <Link
            key={tab.key}
            href={tab.key === "open" ? "/" : "/?view=resolved"}
            className={cn(
              "rounded-full px-4 py-2 text-xs font-extrabold",
              view === tab.key
                ? "bg-violet-700 text-white shadow-md shadow-violet-950/15"
                : "bg-white/70 text-[#77708c]",
            )}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      {visible.length ? (
        <section className="grid gap-4 md:grid-cols-2">
          {visible.map((question) => (
            <QuestionCard key={question.id} question={question} />
          ))}
        </section>
      ) : (
        <section className="glass-panel rounded-[1.8rem] px-6 py-14 text-center">
          <Sparkles className="mx-auto mb-4 size-7 text-violet-400" />
          <h2 className="text-lg font-extrabold">
            {view === "open" ? "No open hunches yet" : "Nothing resolved yet"}
          </h2>
          <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-[#77708c]">
            {view === "open"
              ? "Ask the first question and give everyone something to predict."
              : "Resolved questions will land here."}
          </p>
        </section>
      )}
    </main>
  );
}
