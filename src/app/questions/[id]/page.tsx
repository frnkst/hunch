import {
  Ban,
  CalendarClock,
  CheckCircle2,
  Eye,
  Hourglass,
  Users,
} from "lucide-react";
import { notFound } from "next/navigation";

import { cancelQuestion } from "@/app/actions";
import { AnswerForm } from "@/components/answer-form";
import { AnswerValue } from "@/components/answer-value";
import { AppHeader } from "@/components/app-header";
import { Avatar } from "@/components/avatar";
import { LocalTime } from "@/components/local-time";
import { Notice } from "@/components/notice";
import { QuestionSettingsForm } from "@/components/question-settings-form";
import { requireMembership } from "@/lib/auth";
import { getQuestion } from "@/lib/data";
import { typeLabels, visibilityLabels } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function QuestionPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{
    error?: string;
    saved?: string;
    resolved?: string;
    updated?: string;
  }>;
}) {
  const membership = await requireMembership();
  const { id } = await params;
  const query = await searchParams;
  const { question, predictions } = await getQuestion(id);
  if (!question) notFound();

  const deadlinePassed = new Date(question.deadline) <= new Date();
  const mayManage =
    question.creator_id === membership.user.id || membership.profile.is_admin;
  const mayEditSettings =
    question.creator_id === membership.user.id && question.status === "open";
  const mayResolve =
    (mayManage && question.status === "open" && deadlinePassed) ||
    (membership.profile.is_admin && question.status === "resolved");
  const mayPredict = question.status === "open" && !deadlinePassed;
  const ownPrediction = predictions.find(
    (prediction) => prediction.user_id === membership.user.id,
  );

  return (
    <main className="mx-auto min-h-dvh w-full max-w-4xl px-4 py-5 pb-28 sm:px-6 sm:py-7 md:pb-12">
      <AppHeader active="home" profile={membership.profile} />
      <Notice
        error={query.error}
        success={
          query.saved
            ? "Your hunch is saved."
            : query.resolved
              ? "Outcome set and points awarded."
              : query.updated
                ? "Settings updated."
                : undefined
        }
      />

      <section className="glass-panel rounded-[1.9rem] p-5 sm:p-7">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-violet-100 px-2.5 py-1 text-[0.66rem] font-extrabold tracking-wide text-violet-700 uppercase">
            {typeLabels[question.type]}
          </span>
          <span className="rounded-full bg-white/70 px-2.5 py-1 text-[0.66rem] font-bold text-[#77708c]">
            {question.status === "resolved"
              ? "Resolved"
              : question.status === "cancelled"
                ? "Cancelled"
                : deadlinePassed
                  ? "Awaiting outcome"
                  : "Open"}
          </span>
        </div>
        <h1 className="mt-5 text-2xl font-black leading-tight tracking-[-0.035em] sm:text-4xl">
          {question.text}
        </h1>
        <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-3 text-xs font-semibold text-[#77708c]">
          {question.creator ? (
            <span className="flex items-center gap-2">
              <Avatar
                username={question.creator.username}
                src={question.creator.avatar_url}
                size="sm"
              />
              @{question.creator.username}
            </span>
          ) : null}
          <span className="flex items-center gap-1.5">
            <CalendarClock className="size-3.5" />
            Deadline <LocalTime value={question.deadline} />
          </span>
          <span className="flex items-center gap-1.5">
            <Eye className="size-3.5" />
            {visibilityLabels[question.visibility]}
          </span>
        </div>

        {question.status === "resolved" &&
        question.correct_answer !== null ? (
          <div className="mt-6 rounded-[1.25rem] bg-emerald-50 p-4 text-emerald-800">
            <p className="eyebrow flex items-center gap-2">
              <CheckCircle2 className="size-4" />
              Correct outcome
            </p>
            <p className="mt-2 text-lg font-black">
              <AnswerValue
                type={question.type}
                answer={question.correct_answer}
              />
            </p>
          </div>
        ) : null}

        {question.status === "cancelled" ? (
          <div className="mt-6 flex items-center gap-3 rounded-[1.25rem] bg-rose-50 p-4 text-sm font-semibold text-rose-700">
            <Ban className="size-5" />
            This question was cancelled. No points were awarded.
          </div>
        ) : null}
      </section>

      <div className="mt-5 grid gap-5 md:grid-cols-[minmax(0,1.1fr)_minmax(17rem,0.9fr)]">
        <section className="glass-panel rounded-[1.8rem] p-5 sm:p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="flex items-center gap-2 font-extrabold">
              <Users className="size-4 text-violet-600" />
              Predictions
            </h2>
            <span className="text-xs font-bold text-[#77708c]">
              {predictions.length} visible
            </span>
          </div>
          {predictions.length ? (
            <ul className="space-y-2">
              {predictions.map((prediction) => (
                <li
                  key={prediction.id}
                  className="flex items-center gap-3 rounded-[1.15rem] bg-white/65 p-3"
                >
                  {prediction.profile ? (
                    <Avatar
                      username={prediction.profile.username}
                      src={prediction.profile.avatar_url}
                      size="md"
                    />
                  ) : null}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-bold text-[#77708c]">
                      @{prediction.profile?.username ?? "member"}
                    </p>
                    <p className="truncate text-sm font-extrabold">
                      <AnswerValue
                        type={question.type}
                        answer={prediction.answer}
                      />
                    </p>
                  </div>
                  {question.status === "resolved" ? (
                    <span className="rounded-full bg-violet-100 px-2.5 py-1 text-xs font-black text-violet-700">
                      {Number(prediction.points ?? 0)} pts
                    </span>
                  ) : null}
                </li>
              ))}
            </ul>
          ) : (
            <div className="py-9 text-center text-sm text-[#77708c]">
              <Hourglass className="mx-auto mb-2 size-5 text-violet-400" />
              No predictions are visible yet.
            </div>
          )}
        </section>

        <aside className="space-y-5">
          {mayPredict ? (
            <section className="glass-panel rounded-[1.8rem] p-5">
              <h2 className="mb-3 font-extrabold">
                {ownPrediction ? "Change your hunch" : "Make your hunch"}
              </h2>
              <AnswerForm
                question={question}
                mode="predict"
                defaultValue={ownPrediction?.answer}
              />
            </section>
          ) : null}

          {mayResolve ? (
            <section className="glass-panel rounded-[1.8rem] p-5">
              <h2 className="font-extrabold">
                {question.status === "resolved"
                  ? "Override the outcome"
                  : "Set the outcome"}
              </h2>
              <p className="mb-3 mt-1 text-xs leading-5 text-[#77708c]">
                This immediately scores every prediction and updates the
                leaderboard.
              </p>
              <AnswerForm question={question} mode="resolve" />
            </section>
          ) : null}

          {mayEditSettings ? (
            <section className="glass-panel rounded-[1.8rem] p-5">
              <h2 className="mb-3 font-extrabold">Question settings</h2>
              <QuestionSettingsForm question={question} />
              <form action={cancelQuestion} className="mt-3">
                <input type="hidden" name="questionId" value={question.id} />
                <button
                  type="submit"
                  className="w-full rounded-xl px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50"
                >
                  Cancel question
                </button>
              </form>
            </section>
          ) : null}
        </aside>
      </div>
    </main>
  );
}
