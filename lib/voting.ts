import { and, eq } from "drizzle-orm";
import type { Database } from "./db/client";
import { codes, options, surveys, votes } from "./db/schema";

export type CastVoteResult =
  | { ok: true; surveyId: number; optionId: number }
  | {
      ok: false;
      reason:
        | "invalid-code"
        | "already-voted"
        | "closed"
        | "invalid-option";
      message: string;
    };

function isUniqueViolation(error: unknown) {
  return (
    error instanceof Error &&
    /unique constraint|SQLITE_CONSTRAINT/i.test(error.message)
  );
}

export async function castVote(
  db: Database,
  input: { codeId: number; optionId: number },
): Promise<CastVoteResult> {
  try {
    return await db.transaction(async (tx) => {
      const [code] = await tx
        .select()
        .from(codes)
        .where(eq(codes.id, input.codeId))
        .limit(1);

      if (!code) {
        return {
          ok: false,
          reason: "invalid-code",
          message: "La cédula no está registrada para votar.",
        };
      }

      if (code.usedAt) {
        return {
          ok: false,
          reason: "already-voted",
          message: "Esta cédula ya emitió su voto.",
        };
      }

      const [survey] = await tx
        .select()
        .from(surveys)
        .where(eq(surveys.id, code.surveyId))
        .limit(1);

      if (!survey?.isOpen) {
        return {
          ok: false,
          reason: "closed",
          message: "La encuesta está cerrada.",
        };
      }

      const [option] = await tx
        .select()
        .from(options)
        .where(
          and(
            eq(options.id, input.optionId),
            eq(options.surveyId, code.surveyId),
          ),
        )
        .limit(1);

      if (!option) {
        return {
          ok: false,
          reason: "invalid-option",
          message: "La opción seleccionada no es válida.",
        };
      }

      const [existingVote] = await tx
        .select()
        .from(votes)
        .where(eq(votes.codeId, input.codeId))
        .limit(1);

      if (existingVote) {
        return {
          ok: false,
          reason: "already-voted",
          message: "Esta cédula ya emitió su voto.",
        };
      }

      await tx.insert(votes).values({
        surveyId: code.surveyId,
        optionId: option.id,
        codeId: code.id,
      });

      await tx
        .update(codes)
        .set({ usedAt: new Date() })
        .where(eq(codes.id, code.id));

      return { ok: true, surveyId: code.surveyId, optionId: option.id };
    });
  } catch (error) {
    if (isUniqueViolation(error)) {
      return {
        ok: false,
        reason: "already-voted",
        message: "Esta cédula ya emitió su voto.",
      };
    }
    throw error;
  }
}
