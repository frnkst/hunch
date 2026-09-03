import type { QuestionType, VisibilityMode } from "@/lib/types";

export const typeLabels: Record<QuestionType, string> = {
  open_choice: "Open choice",
  boolean: "Yes / no",
  multiple_choice: "Multiple choice",
  number: "Number",
  date: "Date",
  datetime: "Date & time",
};

export const visibilityLabels: Record<VisibilityMode, string> = {
  after_deadline: "After deadline",
  always: "Always visible",
};

export function formatAnswer(
  type: QuestionType,
  answer: string | number | boolean,
): string {
  if (type === "boolean") return answer ? "Yes" : "No";
  if (type === "number") return new Intl.NumberFormat().format(Number(answer));
  if (type === "date") {
    return new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(
      new Date(`${answer}T12:00:00`),
    );
  }
  if (type === "datetime") {
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(String(answer)));
  }
  return String(answer);
}

export function isDeadlinePassed(deadline: string): boolean {
  return new Date(deadline).getTime() <= Date.now();
}
