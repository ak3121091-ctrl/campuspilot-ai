import { NextResponse } from "next/server";
import { createStudyPlan, getStudyPlan, markTaskComplete } from "@/lib/server/study-planner";

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
    const { examDate, subjects, currentLevel, dailyStudyHours, topics } = body;

    if (!examDate || typeof examDate !== "string") {
      return NextResponse.json({ error: "Exam date is required." }, { status: 400 });
    }

    if (!Array.isArray(subjects) || subjects.length === 0) {
      return NextResponse.json({ error: "At least one subject is required." }, { status: 400 });
    }

    if (!["beginner", "intermediate", "advanced"].includes(currentLevel)) {
      return NextResponse.json({ error: "Valid current level is required." }, { status: 400 });
    }

    if (typeof dailyStudyHours !== "number" || dailyStudyHours <= 0 || dailyStudyHours > 24) {
      return NextResponse.json({ error: "Daily study hours must be between 1 and 24." }, { status: 400 });
    }

    if (!Array.isArray(topics) || topics.length === 0) {
      return NextResponse.json({ error: "At least one topic is required." }, { status: 400 });
    }

    const plan = await createStudyPlan(
      userId || "local-development-user",
      examDate,
      subjects,
      currentLevel,
      dailyStudyHours,
      topics,
    );

    return NextResponse.json({ plan }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to create study plan.";
    const status = message.includes("required") ? 400 : message.includes("Authentication") ? 401 : 503;
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

    const plan = await getStudyPlan(userId || "local-development-user");

    if (!plan) {
      return NextResponse.json({ plan: null });
    }

    return NextResponse.json({ plan });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to load study plan.";
    const status = message.includes("Authentication") ? 401 : 503;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function PATCH(request: Request) {
  try {
    const userId = request.headers.get("x-user-id")?.trim();
    if (!userId) {
      if (process.env.APP_ENV !== "development") {
        return NextResponse.json({ error: "Authentication is required." }, { status: 401 });
      }
    }

    const body = await request.json();
    const { taskId } = body;

    if (!taskId || typeof taskId !== "string") {
      return NextResponse.json({ error: "Task ID is required." }, { status: 400 });
    }

    await markTaskComplete(userId || "local-development-user", taskId);

    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to update task.";
    const status = message.includes("not found") ? 404 : message.includes("Authentication") ? 401 : 503;
    return NextResponse.json({ error: message }, { status });
  }
}
