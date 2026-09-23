export const AUTH_COOKIE_NAME = "campuspilot_session";

export type CampusPilotSession = {
  userId: string;
  email: string;
  name: string;
};

export function decodeSessionCookie(rawCookie: string | null): CampusPilotSession | null {
  if (!rawCookie) return null;

  const parts = rawCookie.split(";").map((part) => part.trim());
  const sessionEntry = parts.find((part) => part.startsWith(`${AUTH_COOKIE_NAME}=`));
  if (!sessionEntry) return null;

  const encodedValue = sessionEntry.slice(AUTH_COOKIE_NAME.length + 1);
  if (!encodedValue) return null;

  try {
    const parsed = JSON.parse(decodeURIComponent(encodedValue)) as Partial<CampusPilotSession>;
    if (!parsed.userId || !parsed.email || !parsed.name) return null;
    return {
      userId: parsed.userId,
      email: parsed.email,
      name: parsed.name,
    };
  } catch {
    return null;
  }
}

export function getSessionFromRequest(request: Request): CampusPilotSession | null {
  return decodeSessionCookie(request.headers.get("cookie"));
}

export function getUserIdFromRequest(request: Request): string | null {
  const directUserId = request.headers.get("x-user-id")?.trim();
  if (directUserId) return directUserId;

  const session = getSessionFromRequest(request);
  return session?.userId ?? null;
}

export function createSessionCookie(session: CampusPilotSession): string {
  const encoded = encodeURIComponent(JSON.stringify(session));
  const base = `${AUTH_COOKIE_NAME}=${encoded}; Path=/; HttpOnly; SameSite=Lax; Max-Age=43200`;
  return process.env.NODE_ENV === "production" ? `${base}; Secure` : base;
}

export function clearSessionCookie(): string {
  return `${AUTH_COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`;
}

export function getDisplayName(email: string): string {
  const localPart = email.split("@")[0] ?? "student";
  return localPart.replace(/[._-]+/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
}
