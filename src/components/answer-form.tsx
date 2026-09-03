"use client";

import { useState } from "react";

import { resolveQuestion, savePrediction } from "@/app/actions";
import { DateTimeField } from "@/components/date-time-field";
import type { Question } from "@/lib/types";

function OpenChoiceField({
  question,
  defaultValue,
  disabled,
  mode,
}: {
  question: Question;
  defaultValue?: string | number | boolean;
  disabled: boolean;
  mode: "predict" | "resolve";
}) {
  const defaultChoice = question.open_choices.find(
    (choice) => choice.value === defaultValue,
  );
  const [choiceId, setChoiceId] = useState(
    defaultChoice?.id ?? question.open_choices[0]?.id ?? "new",
  );

  if (mode === "resolve") {
    return (
      <select
        name="answer"
        defaultValue={
          defaultChoice?.value ?? question.open_choices[0]?.value ?? ""
        }
        required
        disabled={disabled}
        className="field"
      >
        {question.open_choices.length ? (
          question.open_choices.map((choice) => (
            <option key={choice.id} value={choice.value}>
              {choice.value}
            </option>
          ))
        ) : (
          <option value="" disabled>
            No choices have been added
          </option>
        )}
      </select>
    );
  }

  return (
    <div className="space-y-2">
      <select
        name="choiceId"
        value={choiceId}
        onChange={(event) => setChoiceId(event.target.value)}
        required
        className="field"
      >
        {question.open_choices.map((choice) => (
          <option key={choice.id} value={choice.id}>
            {choice.value}
          </option>
        ))}
        <option value="new">Add a new choice…</option>
      </select>
      {choiceId === "new" ? (
        <input
          name="newChoice"
          type="text"
          required
          maxLength={100}
          className="field"
          placeholder="Your choice"
          autoComplete="off"
        />
      ) : null}
    </div>
  );
}

function AnswerField({
  question,
  defaultValue,
  disabled = false,
  mode,
}: {
  question: Question;
  defaultValue?: string | number | boolean;
  disabled?: boolean;
  mode: "predict" | "resolve";
}) {
  if (question.type === "open_choice") {
    return (
      <OpenChoiceField
        question={question}
        defaultValue={defaultValue}
        disabled={disabled}
        mode={mode}
      />
    );
  }
  if (question.type === "boolean") {
    return (
      <select
        name="answer"
        defaultValue={
          defaultValue === undefined ? "" : defaultValue ? "true" : "false"
        }
        required
        disabled={disabled}
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
        disabled={disabled}
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
        disabled={disabled}
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
        disabled={disabled}
        defaultValue={
          defaultValue === undefined ? undefined : String(defaultValue)
        }
        className="field"
      />
    );
  }
  return (
    <DateTimeField
      name="answer"
      required
      disabled={disabled}
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
  const [resolution, setResolution] = useState<"answer" | "no_outcome">(
    question.status === "resolved" && question.correct_answer === null
      ? "no_outcome"
      : "answer",
  );
  const noOutcome = mode === "resolve" && resolution === "no_outcome";

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
      {mode === "resolve" ? (
        <div className="space-y-2">
          <label className="flex cursor-pointer items-start gap-3 rounded-xl bg-white/60 p-3 text-sm font-bold">
            <input
              type="radio"
              name="resolution"
              value="answer"
              checked={resolution === "answer"}
              onChange={() => setResolution("answer")}
              className="mt-0.5 accent-violet-700"
            />
            Set the actual outcome
          </label>
          <AnswerField
            question={question}
            defaultValue={
              question.correct_answer === null
                ? undefined
                : question.correct_answer
            }
            disabled={noOutcome}
            mode={mode}
          />
          <label className="flex cursor-pointer items-start gap-3 rounded-xl bg-white/60 p-3 text-sm font-bold">
            <input
              type="radio"
              name="resolution"
              value="no_outcome"
              checked={resolution === "no_outcome"}
              onChange={() => setResolution("no_outcome")}
              className="mt-0.5 accent-violet-700"
            />
            <span>
              No outcome
              <span className="mt-0.5 block text-xs font-medium text-[#77708c]">
                No winner and no points awarded
              </span>
            </span>
          </label>
        </div>
      ) : (
        <AnswerField
          question={question}
          defaultValue={defaultValue}
          mode={mode}
        />
      )}
      <button type="submit" className="button-primary w-full">
        {mode === "predict"
          ? defaultValue === undefined
            ? "Lock in my hunch"
            : "Update my hunch"
          : noOutcome
            ? "Record no outcome"
            : "Set outcome & score"}
      </button>
    </form>
  );
}
