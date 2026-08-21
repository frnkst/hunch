import type { Question } from "@/lib/types";

export type HomeView = "open" | "resolved";

export function getHomeView(value: string | undefined): HomeView {
  return value === "resolved" ? "resolved" : "open";
}

export function filterQuestionsForHome(
  questions: Question[],
  view: HomeView,
): Question[] {
  return questions.filter((question) => question.status === view);
}
