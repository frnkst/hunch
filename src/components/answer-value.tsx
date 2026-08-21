import { LocalTime } from "@/components/local-time";
import { formatAnswer } from "@/lib/format";
import type { QuestionType } from "@/lib/types";

export function AnswerValue({
  type,
  answer,
}: {
  type: QuestionType;
  answer: string | number | boolean;
}) {
  return type === "datetime" ? (
    <LocalTime value={String(answer)} />
  ) : (
    formatAnswer(type, answer)
  );
}
