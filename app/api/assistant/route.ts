import { NextResponse } from "next/server";
import { answerFromDocuments } from "@/lib/server/ai";
import { getDocumentContext } from "@/lib/server/documents";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body: unknown = await request.json();
    if (!body || typeof body !== "object" || !("question" in body) || typeof body.question !== "string") {
      return NextResponse.json({ error: "A question is required." }, { status: 400 });
    }
    const question = body.question.trim();
    if (!question || question.length > 1_000) {
      return NextResponse.json({ error: "Question must be between 1 and 1,000 characters." }, { status: 400 });
    }
    const documentId = "documentId" in body && typeof body.documentId === "string" ? body.documentId : undefined;
    const contexts = await getDocumentContext(request, documentId);
    return NextResponse.json({ answer: await answerFromDocuments(question, contexts) });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to answer from documents.";
    return NextResponse.json({ error: message }, { status: message.includes("Authentication") ? 401 : 503 });
  }
}
