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
    defaultChoice ? `existing:${defaultChoice.id}` : "",
  );
  const [newChoices, setNewChoices] = useState("");
  const remainingChoices = Math.max(0, 3 - question.own_open_choice_count);
  const addedChoices = newChoices
    .split("\n")
    .map((choice) => choice.trim().replace(/\s+/g, " "))
    .filter(Boolean);

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
      {remainingChoices > 0 ? (
        <label className="block">
          <span className="mb-1.5 block text-xs font-bold text-[#77708c]">
            Add options (optional)
          </span>
          <textarea
            name="newChoices"
            value={newChoices}
            onChange={(event) => {
              const value = event.target.value;
              const optionCount = value
                .split("\n")
                .filter((choice) => choice.trim()).length;
              if (optionCount <= remainingChoices) setNewChoices(value);
            }}
            maxLength={remainingChoices * 101}
            rows={remainingChoices}
            className="field resize-none"
            placeholder={"Your option\nAnother option\nOne more option"}
          />
          <span className="mt-1 block text-xs text-[#77708c]">
            You can add {remainingChoices} more option
            {remainingChoices === 1 ? "" : "s"}, one per line.
          </span>
        </label>
      ) : (
        <p className="rounded-xl bg-violet-50 px-3 py-2 text-xs font-semibold text-violet-700">
          You already added all 3 options available to you.
        </p>
      )}
      <label className="block">
        <span className="mb-1.5 block text-xs font-bold text-[#77708c]">
          Your prediction
        </span>
        <select
          name="choiceSelection"
          value={choiceId}
          onChange={(event) => setChoiceId(event.target.value)}
          required
          className="field"
        >
          <option value="" disabled>
            Choose an option…
          </option>
          {question.open_choices.map((choice) => (
            <option key={choice.id} value={`existing:${choice.id}`}>
              {choice.value}
            </option>
          ))}
          {addedChoices.map((choice, index) => (
            <option key={`${choice}-${index}`} value={`new:${index}`}>
              {choice} (new)
            </option>
          ))}
        </select>
      </label>
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
