import { config } from "dotenv";
import { eq } from "drizzle-orm";
import { surveyContent } from "../db/content";
import { createDb } from "../lib/db/client";
import { options, surveys } from "../lib/db/schema";

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

    if (surveyContent.options.length < existingOptions.length) {
      console.warn(
        "Hay opciones antiguas de más que no se han borrado para no perder votos. Bórralas manualmente si quieres.",
      );
    }

    console.log("Contenido actualizado sin borrar votos.");
  } finally {
    client.close();
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
