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

  it("scores open-choice predictions as correct or incorrect", () => {
    expect(
      scorePredictions(
        "open_choice",
        [
          { id: "a", answer: "Paris" },
          { id: "b", answer: "Rome" },
        ],
        "Paris",
      ),
    ).toEqual([
      { id: "a", answer: "Paris", points: 10 },
      { id: "b", answer: "Rome", points: 0 },
    ]);
  });

  it("awards fixed podium points by numeric rank", () => {
    expect(
      scorePredictions(
        "number",
        [
          { id: "a", answer: 100 },
          { id: "b", answer: 110 },
          { id: "c", answer: 130 },
          { id: "d", answer: 150 },
        ],
        100,
      ).map(({ id, points }) => ({ id, points })),
    ).toEqual([
      { id: "a", points: 10 },
      { id: "b", points: 7 },
      { id: "c", points: 4 },
      { id: "d", points: 0 },
    ]);
  });

  it("uses competition ranking for ties", () => {
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
      { id: "a", points: 10 },
      { id: "b", points: 10 },
      { id: "c", points: 4 },
    ]);
  });

  it("only awards a lone prediction when it is exact", () => {
    expect(
      scorePredictions("number", [{ id: "a", answer: 99 }], 100)[0].points,
    ).toBe(0);
    expect(
      scorePredictions("number", [{ id: "a", answer: 100 }], 100)[0].points,
    ).toBe(10);
  });
});
