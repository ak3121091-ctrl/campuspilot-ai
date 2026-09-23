import { NextResponse } from "next/server";
import { generateQuiz } from "@/lib/server/quiz";
import { getDocumentContext } from "@/lib/server/documents";
import type { QuizDifficulty, QuizQuestionCount } from "@/types/quiz";

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
    const { subject, topic, documentIds, questionCount, difficulty } = body;

    if (!subject || typeof subject !== "string") {
      return NextResponse.json({ error: "Subject is required." }, { status: 400 });
    }

    if (!topic || typeof topic !== "string") {
      return NextResponse.json({ error: "Topic is required." }, { status: 400 });
    }

    const count = questionCount ?? 10;
    if (![5, 10, 20].includes(count)) {
      return NextResponse.json({ error: "Question count must be 5, 10, or 20." }, { status: 400 });
    }

    const diff = difficulty ?? "medium";
    if (!["easy", "medium", "hard"].includes(diff)) {
      return NextResponse.json({ error: "Difficulty must be easy, medium, or hard." }, { status: 400 });
    }

    const contexts = await getDocumentContext(request, documentIds);

    const quiz = await generateQuiz(
      userId || "local-development-user",
      subject,
      topic,
      contexts,
      count as QuizQuestionCount,
      diff as QuizDifficulty,
    );

    return NextResponse.json({ quiz }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to generate quiz.";
    const status = message.includes("document") ? 400 : message.includes("Authentication") ? 401 : 503;
    return NextResponse.json({ error: message }, { status });
  }
}
