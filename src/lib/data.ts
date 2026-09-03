import "server-only";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/auth";
import type {
  Prediction,
  PredictionParticipant,
  Question,
} from "@/lib/types";

function normalizeQuestion(row: Record<string, unknown>): Question {
  return {
    ...(row as unknown as Question),
    open_choices: Array.isArray(row.open_choices)
      ? (row.open_choices as Question["open_choices"])
      : [],
    own_open_choice_count: Number(row.own_open_choice_count ?? 0),
    creator: Array.isArray(row.creator)
      ? (row.creator[0] as Question["creator"])
      : (row.creator as Question["creator"]),
  };
}

function normalizePrediction(row: Record<string, unknown>): Prediction {
  return {
    ...(row as unknown as Prediction),
    profile: Array.isArray(row.profile)
      ? (row.profile[0] as Prediction["profile"])
      : (row.profile as Prediction["profile"]),
  };
}

export async function getQuestions(): Promise<Question[]> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("questions")
    .select(
      "*,creator:profiles!questions_creator_id_fkey(username,avatar_url)",
    )
    .order("created_at", { ascending: false });
  if (error) throw new Error(`Could not load questions: ${error.message}`);
  return (data ?? []).map((row) =>
    normalizeQuestion(row as Record<string, unknown>),
  );
}

export async function getQuestion(questionId: string): Promise<{
  question: Question | null;
  predictions: Prediction[];
  participants: PredictionParticipant[];
}> {
  const supabase = await createServerSupabaseClient();
  const [
    { data: questionRow, error: questionError },
    predictionsResult,
    participantsResult,
    choicesResult,
    contributionCountResult,
  ] = await Promise.all([
    supabase
      .from("questions")
      .select(
        "*,creator:profiles!questions_creator_id_fkey(username,avatar_url)",
      )
      .eq("id", questionId)
      .maybeSingle(),
    supabase
      .from("predictions")
      .select(
        "*,profile:profiles!predictions_user_id_fkey(username,avatar_url)",
      )
      .eq("question_id", questionId)
      .order("points", { ascending: false, nullsFirst: false })
      .order("updated_at", { ascending: true }),
    supabase.rpc("list_prediction_participants", {
      target_question_id: questionId,
    }),
    supabase
      .from("question_choices")
      .select("id,value")
      .eq("question_id", questionId)
      .order("created_at"),
    supabase.rpc("get_open_choice_contribution_count", {
      target_question_id: questionId,
    }),
  ]);
  if (questionError) {
    throw new Error(`Could not load question: ${questionError.message}`);
  }
  if (predictionsResult.error) {
    throw new Error(
      `Could not load predictions: ${predictionsResult.error.message}`,
    );
  }
  if (participantsResult.error) {
    throw new Error(
      `Could not load prediction participants: ${participantsResult.error.message}`,
    );
  }
  if (choicesResult.error) {
    throw new Error(`Could not load choices: ${choicesResult.error.message}`);
  }
  if (contributionCountResult.error) {
    throw new Error(
      `Could not load option allowance: ${contributionCountResult.error.message}`,
    );
  }
  const question = questionRow
    ? normalizeQuestion(questionRow as Record<string, unknown>)
    : null;
  return {
    question: question
      ? {
          ...question,
          open_choices: (choicesResult.data ?? []) as Question["open_choices"],
          own_open_choice_count: Number(contributionCountResult.data ?? 0),
        }
      : null,
    predictions: (predictionsResult.data ?? []).map((row) =>
      normalizePrediction(row as Record<string, unknown>),
    ),
    participants: (participantsResult.data ?? []) as PredictionParticipant[],
  };
}

export type LeaderboardRow = {
  userId: string;
  username: string;
  avatarUrl: string | null;
  points: number;
  predictions: number;
};

export async function getLeaderboard(
  period: "all" | "month" | "year",
): Promise<LeaderboardRow[]> {
  const supabase = await createServerSupabaseClient();
  let query = supabase
    .from("predictions")
    .select(
      "user_id,points,profile:profiles!predictions_user_id_fkey(username,avatar_url),question:questions!inner(status,resolved_at)",
    )
    .eq("question.status", "resolved")
    .not("points", "is", null);

  const now = new Date();
  if (period === "month") {
    query = query.gte(
      "question.resolved_at",
      new Date(now.getFullYear(), now.getMonth(), 1).toISOString(),
    );
  }
  if (period === "year") {
    query = query.gte(
      "question.resolved_at",
      new Date(now.getFullYear(), 0, 1).toISOString(),
    );
  }

  const { data, error } = await query;
  if (error) throw new Error(`Could not load leaderboard: ${error.message}`);

  const totals = new Map<string, LeaderboardRow>();
  for (const raw of data ?? []) {
    const row = raw as unknown as {
      user_id: string;
      points: number;
      profile:
        | { username: string; avatar_url: string | null }
        | Array<{ username: string; avatar_url: string | null }>;
    };
    const profile = Array.isArray(row.profile) ? row.profile[0] : row.profile;
    if (!profile) continue;
    const existing = totals.get(row.user_id) ?? {
      userId: row.user_id,
      username: profile.username,
      avatarUrl: profile.avatar_url,
      points: 0,
      predictions: 0,
    };
    existing.points += Number(row.points);
    existing.predictions += 1;
    totals.set(row.user_id, existing);
  }

  return [...totals.values()].sort(
    (a, b) => b.points - a.points || b.predictions - a.predictions,
  );
}

export async function getPendingProfiles() {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("user_id,username,avatar_url,created_at")
    .eq("status", "pending")
    .order("created_at");
  if (error) throw new Error(`Could not load members: ${error.message}`);
  return data ?? [];
}

export async function getProfiles(): Promise<Profile[]> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("user_id,github_user_id,username,avatar_url,status,is_admin")
    .order("username");
  if (error) throw new Error(`Could not load members: ${error.message}`);
  return (data ?? []) as Profile[];
}
