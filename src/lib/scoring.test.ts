import { describe, expect, it } from "vitest";

import { scorePredictions } from "@/lib/scoring";

describe("scorePredictions", () => {
  it("scores categorical predictions as correct or incorrect", () => {
    expect(
      scorePredictions(
        "boolean",
        [
          { id: "a", answer: true },
          { id: "b", answer: false },
        ],
        true,
      ),
    ).toEqual([
      { id: "a", answer: true, points: 10 },
      { id: "b", answer: false, points: 0 },
    ]);
  });

  it("distributes numeric points by proportional rank", () => {
    expect(
      scorePredictions(
        "number",
        [
          { id: "a", answer: 100 },
          { id: "b", answer: 110 },
          { id: "c", answer: 130 },
        ],
        100,
      ).map(({ id, points }) => ({ id, points })),
    ).toEqual([
      { id: "a", points: 10 },
      { id: "b", points: 5 },
      { id: "c", points: 0 },
    ]);
  });

  it("averages the occupied points for ties", () => {
    expect(
      scorePredictions(
        "number",
        [
          { id: "a", answer: 90 },
          { id: "b", answer: 110 },
          { id: "c", answer: 130 },
        ],
        100,
      ).map(({ id, points }) => ({ id, points })),
    ).toEqual([
      { id: "a", points: 7.5 },
      { id: "b", points: 7.5 },
      { id: "c", points: 0 },
    ]);
  });
});
