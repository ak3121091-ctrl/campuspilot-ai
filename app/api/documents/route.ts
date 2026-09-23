import { NextResponse } from "next/server";
import { listDocuments, uploadDocument } from "@/lib/server/documents";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    return NextResponse.json({ documents: await listDocuments(request) });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to load documents.";
    return NextResponse.json({ error: message }, { status: message.includes("Authentication") ? 401 : 503 });
  }
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const subject = formData.get("subject");
    if (!(file instanceof File)) return NextResponse.json({ error: "A PDF file is required." }, { status: 400 });
    if (typeof subject !== "string") return NextResponse.json({ error: "A subject is required." }, { status: 400 });
    return NextResponse.json({ document: await uploadDocument(request, file, subject) }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to upload document.";
    const status = message.includes("Authentication") ? 401 : message.includes("PDF") || message.includes("file") ? 400 : 503;
    return NextResponse.json({ error: message }, { status });
  }
}
