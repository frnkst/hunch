import { describe, expect, it } from "vitest";

import {
  filterQuestionsForHome,
  getHomeView,
} from "@/lib/home-filter";
import type { Question } from "@/lib/types";

function question(
  id: string,
  status: Question["status"],
  deadline: string,
): Question {
  return {
    id,
    creator_id: "creator",
    text: `Question ${id}`,
    type: "boolean",
    options: null,
    deadline,
    visibility: "after_deadline",
    reward: null,
    status,
    correct_answer: status === "resolved" ? true : null,
    resolved_at: status === "resolved" ? "2026-08-20T12:00:00.000Z" : null,
    created_at: "2026-08-01T12:00:00.000Z",
  };
}

describe("home question filters", () => {
  const questions = [
    question("future-open", "open", "2099-01-01T00:00:00.000Z"),
    question("past-open", "open", "2020-01-01T00:00:00.000Z"),
    question("resolved", "resolved", "2020-01-01T00:00:00.000Z"),
    question("cancelled", "cancelled", "2020-01-01T00:00:00.000Z"),
  ];

  it("shows open questions both before and after their deadlines", () => {
    expect(
      filterQuestionsForHome(questions, "open").map(({ id }) => id),
    ).toEqual(["future-open", "past-open"]);
  });

  it("shows only resolved questions and never cancelled questions", () => {
    expect(
      filterQuestionsForHome(questions, "resolved").map(({ id }) => id),
    ).toEqual(["resolved"]);
  });

  it("uses the resolved URL value and defaults all others to open", () => {
    expect(getHomeView("resolved")).toBe("resolved");
    expect(getHomeView("closed")).toBe("open");
    expect(getHomeView(undefined)).toBe("open");
  });
});
