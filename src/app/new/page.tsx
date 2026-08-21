import { AppHeader } from "@/components/app-header";
import { Notice } from "@/components/notice";
import { QuestionForm } from "@/components/question-form";
import { requireMembership } from "@/lib/auth";

export default async function NewQuestionPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { profile } = await requireMembership();
  const { error } = await searchParams;
  return (
    <main className="mx-auto min-h-dvh w-full max-w-3xl px-4 py-5 pb-28 sm:px-6 sm:py-7 md:pb-12">
      <AppHeader active="new" profile={profile} />
      <section className="mb-6 px-1">
        <p className="eyebrow text-violet-700">Ask the group</p>
        <h1 className="display-title mt-1 text-4xl sm:text-5xl">New hunch</h1>
        <p className="mt-3 text-sm text-[#77708c]">
          Keep it clear, measurable, and settleable.
        </p>
      </section>
      <Notice error={error} />
      <section className="glass-panel rounded-[1.8rem] p-5 sm:p-7">
        <QuestionForm />
      </section>
    </main>
  );
}
