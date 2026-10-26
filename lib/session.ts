import { createHash, randomBytes } from "node:crypto";
import { and, eq, gt } from "drizzle-orm";
import { cookies } from "next/headers";
import { db } from "./db/client";
import {
  codes,
  sessions,
  votes,
  type Code,
  type Session,
  type Vote,
} from "./db/schema";

const VOTER_COOKIE = "vote_session";
const ADMIN_COOKIE = "admin_session";
const VOTER_DAYS = 7;
const ADMIN_HOURS = 12;

export type Role = "voter" | "admin";

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

function cookieName(role: Role) {
  return role === "admin" ? ADMIN_COOKIE : VOTER_COOKIE;
}

function isNextInternal(error: unknown): boolean {
  if (error && typeof error === "object") {
    if ("digest" in error) return true;
    const msg = (error as Error).message;
    if (typeof msg === "string" && (msg.includes("NEXT_REDIRECT") || msg.includes("prerender"))) {
      return true;
    }
  }
  return false;
}

export async function createSession(role: Role, codeId: number | null = null) {
  const token = randomBytes(32).toString("base64url");
  const maxAge =
    role === "admin" ? ADMIN_HOURS * 60 * 60 : VOTER_DAYS * 24 * 60 * 60;
  const expiresAt = new Date(Date.now() + maxAge * 1000);

  await db.insert(sessions).values({
    tokenHash: hashToken(token),
    codeId,
    role,
    expiresAt,
  });

  const cookieStore = await cookies();
  cookieStore.set(cookieName(role), token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: expiresAt,
  });
}

export async function getSession(role: Role): Promise<Session | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(cookieName(role))?.value;
    if (!token) {
      return null;
    }

    const [session] = await db
      .select()
      .from(sessions)
      .where(
        and(
          eq(sessions.tokenHash, hashToken(token)),
          eq(sessions.role, role),
          gt(sessions.expiresAt, new Date()),
        ),
      )
      .limit(1);

    return session ?? null;
  } catch (error) {
    if (isNextInternal(error)) {
      throw error;
    }
    console.error("Error al verificar sesión:", error);
    return null;
  }
}

export async function getVoterSession() {
  return getSession("voter");
}

export async function getAdminSession() {
  return getSession("admin");
}

export async function destroySession(role: Role) {
  const cookieStore = await cookies();
  const token = cookieStore.get(cookieName(role))?.value;

  if (token) {
    await db
      .delete(sessions)
      .where(eq(sessions.tokenHash, hashToken(token)));
  }

  cookieStore.delete(cookieName(role));
}

export type VoterState =
  | { status: "anonymous" }
  | { status: "ready"; session: Session; code: Code }
  | { status: "voted"; session: Session; code: Code; vote: Vote };

export async function getVoterState(): Promise<VoterState> {
  try {
    const session = await getVoterSession();
    if (!session?.codeId) {
      return { status: "anonymous" };
    }

    const [code] = await db
      .select()
      .from(codes)
      .where(eq(codes.id, session.codeId))
      .limit(1);

    if (!code) {
      return { status: "anonymous" };
    }

    const [vote] = await db
      .select()
      .from(votes)
      .where(eq(votes.codeId, session.codeId))
      .limit(1);

    if (vote) {
      return { status: "voted", session, code, vote };
    }

    return { status: "ready", session, code };
  } catch (error) {
    if (isNextInternal(error)) {
      throw error;
    }
    console.error("Error al obtener estado de votante:", error);
    return { status: "anonymous" };
  }
}
