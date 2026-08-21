"use client";

import { resolveQuestion, savePrediction } from "@/app/actions";
import type { Question } from "@/lib/types";

function AnswerField({
  question,
  defaultValue,
}: {
  question: Question;
  defaultValue?: string | number | boolean;
}) {
  if (question.type === "boolean") {
    return (
      <select
        name="answer"
        defaultValue={
          defaultValue === undefined ? "" : defaultValue ? "true" : "false"
        }
        required
        className="field"
      >
        <option value="" disabled>
          Choose…
        </option>
        <option value="true">Yes</option>
        <option value="false">No</option>
      </select>
    );
  }
  if (question.type === "multiple_choice") {
    return (
      <select
        name="answer"
        defaultValue={defaultValue === undefined ? "" : String(defaultValue)}
        required
        className="field"
      >
        <option value="" disabled>
          Choose…
        </option>
        {question.options?.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    );
  }
  if (question.type === "number") {
    return (
      <input
        name="answer"
        type="number"
        step="any"
        required
        defaultValue={
          defaultValue === undefined ? undefined : String(defaultValue)
        }
        className="field"
        placeholder="Your number"
      />
    );
  }
  if (question.type === "date") {
    return (
      <input
        name="answer"
        type="date"
        required
        defaultValue={
          defaultValue === undefined ? undefined : String(defaultValue)
        }
        className="field"
      />
    );
  }
  return (
    <input
      name="answer"
      type="datetime-local"
      required
      className="field"
    />
  );
}

export function AnswerForm({
  question,
  mode,
  defaultValue,
}: {
  question: Question;
  mode: "predict" | "resolve";
  defaultValue?: string | number | boolean;
}) {
  return (
    <form
      action={mode === "predict" ? savePrediction : resolveQuestion}
      className="space-y-3"
    >
      <input type="hidden" name="questionId" value={question.id} />
      <input
        type="hidden"
        name="timezoneOffset"
        value={new Date().getTimezoneOffset()}
      />
      <AnswerField question={question} defaultValue={defaultValue} />
      <button type="submit" className="button-primary w-full">
        {mode === "predict"
          ? defaultValue === undefined
            ? "Lock in my hunch"
            : "Update my hunch"
          : "Set outcome & score"}
      </button>
    </form>
  );
}
