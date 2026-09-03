"use client";

import { useState } from "react";

import { createQuestion } from "@/app/actions";
import { DateTimeField } from "@/components/date-time-field";
import { typeLabels, visibilityLabels } from "@/lib/format";
import {
  questionTypes,
  type QuestionType,
  visibilityModes,
} from "@/lib/types";

export function QuestionForm() {
  const [type, setType] = useState<QuestionType>("open_choice");

  return (
    <form action={createQuestion} className="space-y-5">
      <input
        type="hidden"
        name="timezoneOffset"
        value={new Date().getTimezoneOffset()}
      />
      <label className="block">
        <span className="mb-2 block text-sm font-bold">Question</span>
        <textarea
          name="text"
          required
          minLength={3}
          maxLength={300}
          rows={3}
          className="field resize-none"
          placeholder="What do you think will happen?"
        />
      </label>

      <label className="block">
        <span className="mb-2 block text-sm font-bold">Prediction type</span>
        <select
          name="type"
          value={type}
          onChange={(event) => setType(event.target.value as QuestionType)}
          className="field"
        >
          {questionTypes.map((value) => (
            <option key={value} value={value}>
              {typeLabels[value]}
            </option>
          ))}
        </select>
        {type === "open_choice" ? (
          <span className="mt-1.5 block text-xs text-[#77708c]">
            Predictors can add choices for everyone else to reuse.
          </span>
        ) : null}
      </label>

      {type === "multiple_choice" ? (
        <label className="block">
          <span className="mb-2 block text-sm font-bold">Options</span>
          <textarea
            name="options"
            required
            rows={4}
            className="field resize-none"
            placeholder={"Option one\nOption two\nOption three"}
          />
          <span className="mt-1.5 block text-xs text-[#77708c]">
            One option per line, 2–10 options.
          </span>
        </label>
      ) : null}

      <div className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2">
        <label className="block min-w-0">
          <span className="mb-2 block text-sm font-bold">Deadline</span>
          <DateTimeField
            name="deadline"
            required
          />
        </label>
        <label className="block min-w-0">
          <span className="mb-2 block text-sm font-bold">
            Show predictions
          </span>
          <select
            name="visibility"
            defaultValue="after_deadline"
            className="field"
          >
            {visibilityModes.map((mode) => (
              <option key={mode} value={mode}>
                {visibilityLabels[mode]}
              </option>
            ))}
          </select>
        </label>
        <label className="block min-w-0 sm:col-span-2">
          <span className="mb-2 block text-sm font-bold">
            Prize or reward <span className="font-normal text-[#77708c]">(optional)</span>
          </span>
          <input
            name="reward"
            maxLength={200}
            className="field"
            placeholder="e.g. Winner gets dinner"
          />
        </label>
      </div>

      <button type="submit" className="button-primary w-full sm:w-auto">
        Create hunch
      </button>
    </form>
  );
}
