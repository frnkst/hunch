import type { QuestionType } from "@/lib/types";

export type ScoredPrediction = {
  id: string;
  answer: string | number | boolean;
  points: number;
};

function distance(
  type: QuestionType,
  answer: string | number | boolean,
  correctAnswer: string | number | boolean,
) {
  if (type === "number") {
    return Math.abs(Number(answer) - Number(correctAnswer));
  }
  if (type === "date" || type === "datetime") {
    return Math.abs(
      new Date(String(answer)).getTime() -
        new Date(String(correctAnswer)).getTime(),
    );
  }
  return answer === correctAnswer ? 0 : 1;
}

export function scorePredictions(
  type: QuestionType,
  predictions: Array<{
    id: string;
    answer: string | number | boolean;
  }>,
  correctAnswer: string | number | boolean,
): ScoredPrediction[] {
  if (
    type === "boolean" ||
    type === "multiple_choice" ||
    type === "open_choice"
  ) {
    return predictions.map((prediction) => ({
      ...prediction,
      points: prediction.answer === correctAnswer ? 10 : 0,
    }));
  }

  const ranked = predictions
    .map((prediction) => ({
      ...prediction,
      distance: distance(type, prediction.answer, correctAnswer),
    }))
    .sort((a, b) => a.distance - b.distance);

  if (ranked.length === 1) {
    return [
      {
        ...predictions[0],
        points: ranked[0].distance === 0 ? 10 : 0,
      },
    ];
  }

  const pointsByPlace = [10, 7, 4];
  const scores = new Map<string, number>();
  for (let start = 0; start < ranked.length; ) {
    let end = start;
    while (
      end + 1 < ranked.length &&
      ranked[end + 1].distance === ranked[start].distance
    ) {
      end += 1;
    }
    const points = pointsByPlace[start] ?? 0;
    for (let index = start; index <= end; index += 1) {
      scores.set(ranked[index].id, points);
    }
    start = end + 1;
  }

  return predictions.map((prediction) => ({
    ...prediction,
    points: scores.get(prediction.id) ?? 0,
  }));
}
