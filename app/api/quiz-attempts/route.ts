import { NextResponse } from "next/server";
import { submitQuizAttempt, getQuizAttempts, getQuizAttemptDetail } from "@/lib/server/quiz-attempts";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const userId = request.headers.get("x-user-id")?.trim();
    if (!userId) {
      if (process.env.APP_ENV !== "development") {
        return NextResponse.json({ error: "Authentication is required." }, { status: 401 });
      }
    }

    const body = await request.json();
    const { quizId, answers } = body;

    if (!quizId || typeof quizId !== "string") {
      return NextResponse.json({ error: "Quiz ID is required." }, { status: 400 });
    }

    if (!answers || typeof answers !== "object") {
      return NextResponse.json({ error: "Answers object is required." }, { status: 400 });
    }

    const detail = await submitQuizAttempt(userId || "local-development-user", quizId, answers);

    return NextResponse.json({ attempt: detail }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to submit quiz attempt.";
    const status = message.includes("not found") ? 404 : message.includes("Authentication") ? 401 : 503;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function GET(request: Request) {
  try {
    const userId = request.headers.get("x-user-id")?.trim();
    if (!userId) {
      if (process.env.APP_ENV !== "development") {
        return NextResponse.json({ error: "Authentication is required." }, { status: 401 });
      }
    }

    const url = new URL(request.url);
    const attemptId = url.searchParams.get("attemptId");

    if (attemptId) {
      const detail = await getQuizAttemptDetail(userId || "local-development-user", attemptId);
      return NextResponse.json({ attempt: detail });
    }

    const attempts = await getQuizAttempts(userId || "local-development-user");
    return NextResponse.json({ attempts });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to load attempts.";
    const status = message.includes("not found") ? 404 : message.includes("Authentication") ? 401 : 503;
    return NextResponse.json({ error: message }, { status });
  }
}
