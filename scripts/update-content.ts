import { config } from "dotenv";
import { eq, inArray } from "drizzle-orm";
import { surveyContent } from "../db/content";
import { createDb } from "../lib/db/client";
import { codes, options, surveys, votes } from "../lib/db/schema";

config({ path: ".env.local" });
config();

async function main() {
  const { client, db } = createDb();

  try {
    const [survey] = await db
      .select()
      .from(surveys)
      .where(eq(surveys.slug, surveyContent.slug))
      .limit(1);

    if (!survey) {
      console.error(
        "No existe la encuesta. Ejecuta primero: npm run setup",
      );
      process.exitCode = 1;
      return;
    }

    await db
      .update(surveys)
      .set({
        title: surveyContent.title,
        description: surveyContent.description,
      })
      .where(eq(surveys.id, survey.id));

    const existingOptions = await db
      .select()
      .from(options)
      .where(eq(options.surveyId, survey.id));

    for (const [index, option] of surveyContent.options.entries()) {
      const position = index + 1;
      const current = existingOptions.find(
        (existing) => existing.position === position,
      );

      if (current) {
        await db
          .update(options)
          .set(option)
          .where(eq(options.id, current.id));
      } else {
        await db.insert(options).values({
          ...option,
          surveyId: survey.id,
          position,
        });
      }
    }

    const validPositions = new Set(surveyContent.options.map((_, i) => i + 1));
    const extraOptions = existingOptions.filter(
      (existing) => !validPositions.has(existing.position),
    );

    if (extraOptions.length > 0) {
      const extraOptionIds = extraOptions.map((o) => o.id);

      const votesOnExtra = await db
        .select()
        .from(votes)
        .where(inArray(votes.optionId, extraOptionIds));

      if (votesOnExtra.length > 0) {
        const codeIdsToFree = votesOnExtra.map((v) => v.codeId);
        await db
          .delete(votes)
          .where(inArray(votes.optionId, extraOptionIds));

        for (const codeId of codeIdsToFree) {
          await db
            .update(codes)
            .set({ usedAt: null })
            .where(eq(codes.id, codeId));
        }
      }

      await db
        .delete(options)
        .where(inArray(options.id, extraOptionIds));

      console.log(
        `Se eliminaron ${extraOptions.length} opciones sobrantes (IDs: ${extraOptionIds.join(", ")}).`,
      );
    }

    console.log(`Contenido actualizado correctamente con ${surveyContent.options.length} opciones.`);
  } finally {
    client.close();
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
