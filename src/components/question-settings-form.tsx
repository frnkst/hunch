"use client";

import { useSyncExternalStore } from "react";

import { updateQuestionSettings } from "@/app/actions";
import { visibilityLabels } from "@/lib/format";
import type { Question } from "@/lib/types";
import { visibilityModes } from "@/lib/types";

function toLocalInputValue(iso: string) {
  const date = new Date(iso);
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 16);
}

const subscribe = () => () => {};

export function QuestionSettingsForm({ question }: { question: Question }) {
  const isClient = useSyncExternalStore(subscribe, () => true, () => false);

  return (
    <form action={updateQuestionSettings} className="grid gap-3 sm:grid-cols-2">
      <input type="hidden" name="questionId" value={question.id} />
      <input
        type="hidden"
        name="timezoneOffset"
        value={new Date().getTimezoneOffset()}
      />
      <label>
        <span className="mb-1.5 block text-xs font-bold text-[#77708c]">
          Extend deadline
        </span>
        <input
          type="datetime-local"
          name="deadline"
          required
          defaultValue={
            isClient ? toLocalInputValue(question.deadline) : undefined
          }
          className="field"
        />
      </label>
      <label>
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
      <button type="submit" className="button-secondary sm:col-span-2">
        Save settings
      </button>
    </form>
  );
}
