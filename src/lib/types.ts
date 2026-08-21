export const questionTypes = [
  "boolean",
  "multiple_choice",
  "number",
  "date",
  "datetime",
] as const;
export type QuestionType = (typeof questionTypes)[number];

export const visibilityModes = [
  "always",
  "after_submission",
  "after_deadline",
  "after_resolution",
] as const;
export type VisibilityMode = (typeof visibilityModes)[number];

export type Question = {
  id: string;
  creator_id: string;
  text: string;
  type: QuestionType;
  options: string[] | null;
  deadline: string;
  visibility: VisibilityMode;
  status: "open" | "resolved" | "cancelled";
  correct_answer: string | number | boolean | null;
  resolved_at: string | null;
  created_at: string;
  creator?: {
    username: string;
    avatar_url: string | null;
  } | null;
};

export type Prediction = {
  id: string;
  question_id: string;
  user_id: string;
  answer: string | number | boolean;
  points: number | null;
  updated_at: string;
  profile?: {
    username: string;
    avatar_url: string | null;
  } | null;
};
