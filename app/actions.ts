"use server";

import { timingSafeEqual } from "node:crypto";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { cleanCedula } from "@/lib/codes";
import { generateCode } from "@/lib/code-generator";
import { db } from "@/lib/db/client";
import { codes, sessions, surveys, votes } from "@/lib/db/schema";
import { getClientKey, rateLimit } from "@/lib/rate-limit";
import {
  createSession,
  destroySession,
  getAdminSession,
  getVoterSession,
} from "@/lib/session";
import { getSurvey } from "@/lib/survey";
import {
  codeCountSchema,
  codeSchema,
  optionIdSchema,
} from "@/lib/validation";
import { castVote } from "@/lib/voting";

export type ActionState = {
  error?: string;
  message?: string;
};

function safeEqual(first: string, second: string) {
  const firstBuffer = Buffer.from(first);
  const secondBuffer = Buffer.from(second);

  if (firstBuffer.length !== secondBuffer.length) {
    return false;
  }

  return timingSafeEqual(firstBuffer, secondBuffer);
}

export async function enterCode(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const clientKey = await getClientKey();
  if (!rateLimit(`code:${clientKey}`, 300, 10 * 60 * 1000)) {
    return {
      error: "Demasiados intentos desde esta red. Espera un momento y vuelve a probar.",
    };
  }

  const parsed = codeSchema.safeParse(formData.get("code"));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Cédula no válida." };
  }

  const survey = await getSurvey();
  if (!survey) {
    return { error: "La encuesta todavía no está configurada." };
  }

  if (!survey.isOpen) {
    return { error: "La votación está cerrada." };
  }

  const [invitation] = await db
    .select()
    .from(codes)
    .where(and(eq(codes.surveyId, survey.id), eq(codes.code, parsed.data)))
    .limit(1);

  if (!invitation) {
    return { error: "Número de cédula no registrado en el padrón electoral." };
  }

  if (invitation.usedAt) {
    return { error: "Esta cédula ya registró su voto previamente." };
  }

  await createSession("voter", invitation.id);
  redirect("/votar");
}

export async function submitVote(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await getVoterSession();
  if (!session?.codeId) {
    redirect("/");
  }

  const parsed = optionIdSchema.safeParse(formData.get("optionId"));
  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Selecciona una opción.",
    };
  }

  const result = await castVote(db, {
    codeId: session.codeId,
    optionId: parsed.data,
  });

  if (!result.ok) {
    if (result.reason === "already-voted") {
      redirect("/resultados");
    }
    return { error: result.message };
  }

  revalidatePath("/resultados");
  revalidatePath("/admin");
  redirect("/resultados");
}

export async function adminLogin(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const clientKey = await getClientKey();
  if (!rateLimit(`admin:${clientKey}`, 5, 15 * 60 * 1000)) {
    return { error: "Demasiados intentos. Espera unos minutos." };
  }

  const password = String(formData.get("password") ?? "");
  const expected = process.env.ADMIN_PASSWORD;

  if (!expected) {
    return { error: "Falta configurar ADMIN_PASSWORD en .env.local." };
  }

  if (!password || !safeEqual(password, expected)) {
    return { error: "Contraseña incorrecta." };
  }

  await createSession("admin");
  redirect("/admin");
}

export async function adminLogout() {
  await destroySession("admin");
  redirect("/admin");
}

export async function voterLogout() {
  await destroySession("voter");
  redirect("/");
}

export async function toggleSurvey() {
  const admin = await getAdminSession();
  if (!admin) {
    redirect("/admin");
  }

  const survey = await getSurvey();
  if (!survey) {
    return;
  }

  await db
    .update(surveys)
    .set({ isOpen: !survey.isOpen })
    .where(eq(surveys.id, survey.id));

  revalidatePath("/");
  revalidatePath("/votar");
  revalidatePath("/resultados");
  revalidatePath("/admin");
}

export async function generateCodes(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const admin = await getAdminSession();
  if (!admin) {
    redirect("/admin");
  }

  const parsed = codeCountSchema.safeParse(formData.get("count"));
  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Cantidad no válida.",
    };
  }

  const survey = await getSurvey();
  if (!survey) {
    return { error: "La encuesta todavía no está configurada." };
  }

  const desired = parsed.data;
  let created = 0;

  for (let attempt = 0; attempt < 10 && created < desired; attempt += 1) {
    const remaining = desired - created;
    const batch = Array.from({ length: remaining }, () => ({
      surveyId: survey.id,
      code: generateCode(),
    }));

    const inserted = await db
      .insert(codes)
      .values(batch)
      .onConflictDoNothing()
      .returning({ id: codes.id });

    created += inserted.length;

    if (inserted.length === 0) {
      break;
    }
  }

  revalidatePath("/admin");

  if (created === 0) {
    return { error: "No se pudo generar ningún código. Inténtalo de nuevo." };
  }

  return {
    message: `${created} ${created === 1 ? "código generado" : "códigos generados"}.`,
  };
}

export async function importCedulas(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const admin = await getAdminSession();
  if (!admin) {
    redirect("/admin");
  }

  const rawText = String(formData.get("cedulas") ?? "");
  const survey = await getSurvey();
  if (!survey) {
    return { error: "La encuesta todavía no está configurada." };
  }

  const lines = rawText.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  if (lines.length === 0) {
    return { error: "Ingresa o pega al menos una cédula." };
  }

  const batch: Array<{ surveyId: number; code: string; fullName: string | null }> = [];
  const seen = new Set<string>();

  for (const line of lines) {
    const parts = line.includes(",") ? line.split(",") : line.split("\t");
    const cedulaRaw = parts[0]?.trim() ?? "";
    const fullNameRaw = parts.slice(1).join(" ").trim() || null;
    const clean = cleanCedula(cedulaRaw);

    if (clean.length === 10 && !seen.has(clean)) {
      seen.add(clean);
      batch.push({
        surveyId: survey.id,
        code: clean,
        fullName: fullNameRaw,
      });
    }
  }

  if (batch.length === 0) {
    return {
      error: "No se encontraron cédulas válidas de 10 dígitos.",
    };
  }

  const inserted = await db
    .insert(codes)
    .values(batch)
    .onConflictDoNothing()
    .returning({ id: codes.id });

  revalidatePath("/admin");

  return {
    message: `Se importaron ${inserted.length} cédulas correctamente (${batch.length - inserted.length} omitidas por ya estar registradas).`,
  };
}

export async function resetVoter(codeId: number) {
  const admin = await getAdminSession();
  if (!admin) {
    redirect("/admin");
  }

  await db.delete(votes).where(eq(votes.codeId, codeId));
  await db.delete(sessions).where(eq(sessions.codeId, codeId));
  await db.update(codes).set({ usedAt: null }).where(eq(codes.id, codeId));

  revalidatePath("/admin");
  revalidatePath("/resultados");
  revalidatePath("/votar");
}

export async function resetAllVotes() {
  const admin = await getAdminSession();
  if (!admin) {
    redirect("/admin");
  }

  await db.delete(votes);
  await db.delete(sessions).where(eq(sessions.role, "voter"));
  await db.update(codes).set({ usedAt: null });

  revalidatePath("/admin");
  revalidatePath("/resultados");
  revalidatePath("/votar");
}


