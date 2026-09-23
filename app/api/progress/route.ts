import { NextResponse } from "next/server";
import { updateProgressTracking, getProgressSnapshot, generateStudyRecommendations } from "@/lib/server/study-progress";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const userId = request.headers.get("x-user-id")?.trim();
    if (!userId) {
      if (process.env.APP_ENV !== "development") {
        return NextResponse.json({ error: "Authentication is required." }, { status: 401 });
      }
    }

    const url = new URL(request.url);
    const action = url.searchParams.get("action");

    if (action === "refresh") {
      const progress = await updateProgressTracking(userId || "local-development-user");
      return NextResponse.json({ progress });
    }

    if (action === "recommendations") {
      const recommendations = await generateStudyRecommendations(userId || "local-development-user");
      return NextResponse.json({ recommendations });
    }

    const progress = await getProgressSnapshot(userId || "local-development-user");
    return NextResponse.json({ progress });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to load progress.";
    const status = message.includes("Authentication") ? 401 : 503;
    return NextResponse.json({ error: message }, { status });
  }
}
