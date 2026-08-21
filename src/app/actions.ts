"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireAdmin, requireMembership } from "@/lib/auth";
import { getAppConfig } from "@/lib/config";
import { scorePredictions } from "@/lib/scoring";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import {
  questionTypes,
  type Question,
  type QuestionType,
  visibilityModes,
  type VisibilityMode,
} from "@/lib/types";

function fail(path: string, message: string): never {
  redirect(`${path}?error=${encodeURIComponent(message)}`);
}

function parseLocalDateTime(value: string, offsetMinutes: number): Date {
  const match = value.match(
    /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/,
  );
  if (!match) throw new Error("Choose a valid date and time.");
  const [, year, month, day, hour, minute] = match;
  return new Date(
    Date.UTC(
      Number(year),
      Number(month) - 1,
      Number(day),
      Number(hour),
      Number(minute),
    ) +
      offsetMinutes * 60_000,
  );
}

function parseAnswer(
  type: QuestionType,
  raw: string,
  options: string[] | null,
  timezoneOffset: number,
): string | number | boolean {
  if (type === "boolean") {
    if (raw !== "true" && raw !== "false") {
      throw new Error("Choose yes or no.");
    }
    return raw === "true";
  }
  if (type === "multiple_choice") {
    if (!options?.includes(raw)) throw new Error("Choose a valid option.");
    return raw;
  }
  if (type === "number") {
    const value = Number(raw);
    if (!raw.trim() || !Number.isFinite(value)) {
      throw new Error("Enter a valid number.");
    }
    return value;
  }
  if (type === "date") {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
      throw new Error("Choose a valid date.");
    }
    return raw;
  }
  return parseLocalDateTime(raw, timezoneOffset).toISOString();
}

export async function signInWithGitHub() {
  const config = getAppConfig();
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "github",
    options: { redirectTo: `${config.appUrl}/auth/callback` },
  });
  if (error) fail("/login", error.message);
  redirect(data.url);
}

export async function signOut() {
  const supabase = await createServerSupabaseClient();
  await supabase.auth.signOut({ scope: "local" });
  redirect("/login");
}

export async function createQuestion(formData: FormData) {
  const { user } = await requireMembership();
  const text = String(formData.get("text") ?? "").trim();
  const type = String(formData.get("type") ?? "") as QuestionType;
  const visibility = String(
    formData.get("visibility") ?? "",
  ) as VisibilityMode;
  const timezoneOffset = Number(formData.get("timezoneOffset"));
  const path = "/new";

  if (text.length < 3 || text.length > 300) {
    fail(path, "Question must be between 3 and 300 characters.");
  }
  if (!questionTypes.includes(type)) fail(path, "Choose a question type.");
  if (!visibilityModes.includes(visibility)) {
    fail(path, "Choose when predictions become visible.");
  }
  if (!Number.isFinite(timezoneOffset)) fail(path, "Invalid time zone.");

  let deadline: Date;
  try {
    deadline = parseLocalDateTime(
      String(formData.get("deadline") ?? ""),
      timezoneOffset,
    );
  } catch (error) {
    fail(path, error instanceof Error ? error.message : "Invalid deadline.");
  }
  if (deadline.getTime() <= Date.now()) {
    fail(path, "The deadline must be in the future.");
  }

  let options: string[] | null = null;
  if (type === "multiple_choice") {
    options = String(formData.get("options") ?? "")
      .split("\n")
      .map((option) => option.trim())
      .filter(Boolean);
    if (
      options.length < 2 ||
      options.length > 10 ||
      new Set(options).size !== options.length
    ) {
      fail(path, "Add 2–10 unique options, one per line.");
    }
  }

  const admin = createAdminSupabaseClient();
  const { data, error } = await admin
    .from("questions")
    .insert({
      creator_id: user.id,
      text,
      type,
      options,
      deadline: deadline.toISOString(),
      visibility,
    })
    .select("id")
    .single();
  if (error) fail(path, `Could not create question: ${error.message}`);
  redirect(`/questions/${data.id}`);
}

export async function savePrediction(formData: FormData) {
  const { user } = await requireMembership();
  const questionId = String(formData.get("questionId") ?? "");
  const path = `/questions/${questionId}`;
  const timezoneOffset = Number(formData.get("timezoneOffset"));
  const admin = createAdminSupabaseClient();
  const { data, error } = await admin
    .from("questions")
    .select("id,type,options,deadline,status")
    .eq("id", questionId)
    .maybeSingle();

  if (error || !data) fail(path, "Question not found.");
  if (data.status !== "open" || new Date(data.deadline) <= new Date()) {
    fail(path, "Predictions are closed.");
  }

  let answer: string | number | boolean;
  try {
    answer = parseAnswer(
      data.type as QuestionType,
      String(formData.get("answer") ?? ""),
      data.options as string[] | null,
      timezoneOffset,
    );
  } catch (parseError) {
    fail(
      path,
      parseError instanceof Error ? parseError.message : "Invalid answer.",
    );
  }

  const { error: saveError } = await admin.from("predictions").upsert(
    {
      question_id: questionId,
      user_id: user.id,
      answer,
      points: null,
    },
    { onConflict: "question_id,user_id" },
  );
  if (saveError) fail(path, `Could not save prediction: ${saveError.message}`);
  revalidatePath(path);
  redirect(`${path}?saved=1`);
}

export async function resolveQuestion(formData: FormData) {
  const membership = await requireMembership();
  const questionId = String(formData.get("questionId") ?? "");
  const path = `/questions/${questionId}`;
  const timezoneOffset = Number(formData.get("timezoneOffset"));
  const admin = createAdminSupabaseClient();
  const { data, error } = await admin
    .from("questions")
    .select("*")
    .eq("id", questionId)
    .maybeSingle();
  const question = data as Question | null;

  if (error || !question) fail(path, "Question not found.");
  if (
    question.creator_id !== membership.user.id &&
    !membership.profile.is_admin
  ) {
    fail(path, "Only the creator or admin can resolve this question.");
  }
  const isOverride = question.status === "resolved";
  if (question.status === "cancelled") fail(path, "This question was cancelled.");
  if (isOverride && !membership.profile.is_admin) {
    fail(path, "Only the admin can override a resolved outcome.");
  }
  if (!isOverride && new Date(question.deadline) > new Date()) {
    fail(path, "This question cannot be resolved before its deadline.");
  }

  let correctAnswer: string | number | boolean;
  try {
    correctAnswer = parseAnswer(
      question.type,
      String(formData.get("answer") ?? ""),
      question.options,
      timezoneOffset,
    );
  } catch (parseError) {
    fail(
      path,
      parseError instanceof Error
        ? parseError.message
        : "Invalid correct answer.",
    );
  }

  const { data: predictionRows, error: predictionError } = await admin
    .from("predictions")
    .select("id,answer")
    .eq("question_id", questionId);
  if (predictionError) fail(path, predictionError.message);

  const scores = scorePredictions(
    question.type,
    (predictionRows ?? []) as Array<{
      id: string;
      answer: string | number | boolean;
    }>,
    correctAnswer,
  );
  for (const score of scores) {
    const { error: scoreError } = await admin
      .from("predictions")
      .update({ points: score.points })
      .eq("id", score.id);
    if (scoreError) fail(path, `Could not score predictions: ${scoreError.message}`);
  }

  const { error: resolutionError } = await admin
    .from("questions")
    .update({
      status: "resolved",
      correct_answer: correctAnswer,
      resolved_at: isOverride
        ? question.resolved_at
        : new Date().toISOString(),
    })
    .eq("id", questionId);
  if (resolutionError) fail(path, resolutionError.message);

  revalidatePath("/");
  revalidatePath("/leaderboard");
  redirect(`${path}?resolved=1`);
}

export async function cancelQuestion(formData: FormData) {
  const membership = await requireMembership();
  const questionId = String(formData.get("questionId") ?? "");
  const path = `/questions/${questionId}`;
  const admin = createAdminSupabaseClient();
  const { data } = await admin
    .from("questions")
    .select("creator_id,status")
    .eq("id", questionId)
    .maybeSingle();
  if (!data) fail(path, "Question not found.");
  if (
    data.creator_id !== membership.user.id &&
    !membership.profile.is_admin
  ) {
    fail(path, "Only the creator or admin can cancel this question.");
  }
  if (data.status !== "open") fail(path, "This question is already closed.");

  const { error } = await admin
    .from("questions")
    .update({ status: "cancelled" })
    .eq("id", questionId);
  if (error) fail(path, error.message);
  revalidatePath("/");
  redirect(path);
}

export async function updateQuestionSettings(formData: FormData) {
  const membership = await requireMembership();
  const questionId = String(formData.get("questionId") ?? "");
  const path = `/questions/${questionId}`;
  const visibility = String(
    formData.get("visibility") ?? "",
  ) as VisibilityMode;
  const timezoneOffset = Number(formData.get("timezoneOffset"));
  const admin = createAdminSupabaseClient();
  const { data } = await admin
    .from("questions")
    .select("creator_id,status,deadline")
    .eq("id", questionId)
    .maybeSingle();
  if (!data) fail(path, "Question not found.");
  const isAdmin = membership.profile.is_admin;
  if (data.creator_id !== membership.user.id && !isAdmin) {
    fail(path, "Only the creator or admin can change these settings.");
  }
  if (!isAdmin && data.status !== "open") {
    fail(path, "This question is already closed.");
  }
  if (!visibilityModes.includes(visibility)) {
    fail(path, "Choose a valid visibility.");
  }

  let deadline: Date;
  try {
    deadline = parseLocalDateTime(
      String(formData.get("deadline") ?? ""),
      timezoneOffset,
    );
  } catch (error) {
    fail(path, error instanceof Error ? error.message : "Invalid deadline.");
  }
  if (!isAdmin && deadline < new Date(data.deadline)) {
    fail(path, "The deadline can only be extended.");
  }

  const updates: {
    deadline: string;
    visibility: VisibilityMode;
    text?: string;
  } = {
    deadline: deadline.toISOString(),
    visibility,
  };
  if (isAdmin) {
    const text = String(formData.get("text") ?? "").trim();
    if (text.length < 3 || text.length > 300) {
      fail(path, "Question must be between 3 and 300 characters.");
    }
    updates.text = text;
  }

  const { error } = await admin
    .from("questions")
    .update(updates)
    .eq("id", questionId);
  if (error) fail(path, error.message);
  revalidatePath("/");
  revalidatePath(path);
  redirect(`${path}?updated=1`);
}

export async function deleteQuestion(formData: FormData) {
  await requireAdmin();
  const questionId = String(formData.get("questionId") ?? "");
  const path = `/questions/${questionId}`;
  const admin = createAdminSupabaseClient();
  const { data, error } = await admin
    .from("questions")
    .delete()
    .eq("id", questionId)
    .select("id")
    .maybeSingle();
  if (error) fail(path, `Could not delete question: ${error.message}`);
  if (!data) fail(path, "Question not found.");

  revalidatePath("/");
  revalidatePath("/leaderboard");
  redirect("/");
}

export async function approveMember(formData: FormData) {
  await requireAdmin();
  const userId = String(formData.get("userId") ?? "");
  const admin = createAdminSupabaseClient();
  const { error } = await admin
    .from("profiles")
    .update({ status: "approved" })
    .eq("user_id", userId)
    .eq("status", "pending");
  if (error) fail("/admin", error.message);
  revalidatePath("/admin");
  redirect("/admin?approved=1");
}
