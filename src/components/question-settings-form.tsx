"use client";

import { useSyncExternalStore } from "react";

import { deleteQuestion, updateQuestionSettings } from "@/app/actions";
import { DateTimeField } from "@/components/date-time-field";
import { visibilityLabels } from "@/lib/format";
import type { Question } from "@/lib/types";
import { visibilityModes } from "@/lib/types";

function toLocalInputValue(iso: string) {
  const date = new Date(iso);
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 16);
}

const subscribe = () => () => {};

export function QuestionSettingsForm({
  question,
  isAdmin,
}: {
  question: Question;
  isAdmin: boolean;
}) {
  const isClient = useSyncExternalStore(subscribe, () => true, () => false);

  return (
    <>
      <form
        action={updateQuestionSettings}
        className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2"
      >
        <input type="hidden" name="questionId" value={question.id} />
        <input
          type="hidden"
          name="timezoneOffset"
          value={new Date().getTimezoneOffset()}
        />
        {isAdmin ? (
          <label className="sm:col-span-2">
            <span className="mb-1.5 block text-xs font-bold text-[#77708c]">
              Question text
            </span>
            <textarea
              name="text"
              required
              minLength={3}
              maxLength={300}
              rows={3}
              defaultValue={question.text}
              className="field resize-y"
            />
          </label>
        ) : null}
        <label className="min-w-0">
          <span className="mb-1.5 block text-xs font-bold text-[#77708c]">
            {isAdmin ? "Deadline" : "Extend deadline"}
          </span>
          <DateTimeField
            name="deadline"
            required
            defaultValue={
              isClient ? toLocalInputValue(question.deadline) : undefined
            }
          />
        </label>
        <label className="min-w-0">
          <span className="mb-1.5 block text-xs font-bold text-[#77708c]">
            Show predictions
          </span>
          <select
            name="visibility"
            defaultValue={question.visibility}
            className="field"
          >
            {visibilityModes.map((mode) => (
              <option key={mode} value={mode}>
                {visibilityLabels[mode]}
              </option>
            ))}
          </select>
        </label>
        <label className="min-w-0 sm:col-span-2">
          <span className="mb-1.5 block text-xs font-bold text-[#77708c]">
            Prize or reward (optional)
          </span>
          <input
            name="reward"
            maxLength={200}
            defaultValue={question.reward ?? ""}
            className="field"
            placeholder="e.g. Winner gets dinner"
          />
        </label>
        <button type="submit" className="button-secondary sm:col-span-2">
          Save settings
        </button>
      </form>

      {isAdmin ? (
        <form
          action={deleteQuestion}
          className="mt-5 border-t border-rose-100 pt-4"
          onSubmit={(event) => {
            if (
              !window.confirm(
                "Permanently delete this question and all of its predictions? This cannot be undone.",
              )
            ) {
              event.preventDefault();
            }
          }}
        >
          <input type="hidden" name="questionId" value={question.id} />
          <p className="mb-2 text-xs leading-5 text-rose-700">
            Admin only: this also permanently deletes every prediction.
          </p>
          <button
            type="submit"
            className="w-full rounded-xl px-3 py-2 text-xs font-bold text-rose-700 hover:bg-rose-50"
          >
            Permanently delete question
          </button>
        </form>
      ) : null}
    </>
  );
}
