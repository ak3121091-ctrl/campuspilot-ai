import { NextResponse } from "next/server";
import { createSessionCookie, getDisplayName, type CampusPilotSession } from "@/lib/server/auth";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body: unknown = await request.json();
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
    }

    const email = "email" in body && typeof body.email === "string" ? body.email.trim() : "";
    const password = "password" in body && typeof body.password === "string" ? body.password.trim() : "";

    if (!email || !email.includes("@") || password.length < 6) {
      return NextResponse.json({ error: "Use a valid email and a password with at least 6 characters." }, { status: 400 });
    }

    const session: CampusPilotSession = {
      userId: `student-${email.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
      email,
      name: getDisplayName(email),
    };

    return NextResponse.json(
      { session },
      {
        status: 200,
        headers: {
          "Set-Cookie": createSessionCookie(session),
        },
      },
    );
  } catch {
    return NextResponse.json({ error: "Unable to sign in." }, { status: 500 });
  }
}
