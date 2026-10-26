import { config } from "dotenv";
import { count, eq } from "drizzle-orm";
import { createDb } from "../lib/db/client";
import { codes, options, surveys } from "../lib/db/schema";
import studentsData from "../data/students.json";
import { surveyContent } from "./content";

config({ path: ".env.local" });
config();

async function main() {
  const { client, db } = createDb();

  try {
    let [survey] = await db
      .select()
      .from(surveys)
      .where(eq(surveys.slug, surveyContent.slug))
      .limit(1);

    if (!survey) {
      [survey] = await db
        .insert(surveys)
        .values({
          slug: surveyContent.slug,
          title: surveyContent.title,
          description: surveyContent.description,
        })
        .returning();
      console.log("Encuesta creada.");
    }

    const existingOptions = await db
      .select()
      .from(options)
      .where(eq(options.surveyId, survey.id));

    if (existingOptions.length === 0) {
      await db.insert(options).values(
        surveyContent.options.map((option, index) => ({
          ...option,
          surveyId: survey.id,
          position: index + 1,
        })),
      );
      console.log(`Se añadieron ${surveyContent.options.length} opciones.`);
    }


    const studentBatch = studentsData.map((s) => ({
      surveyId: survey.id,
      code: s.cedula,
      fullName: s.name,
    }));

    // Insert in chunks of 100 to avoid SQLite parameter limits
    const CHUNK_SIZE = 100;
    let insertedTotal = 0;
    for (let i = 0; i < studentBatch.length; i += CHUNK_SIZE) {
      const chunk = studentBatch.slice(i, i + CHUNK_SIZE);
      const res = await db
        .insert(codes)
        .values(chunk)
        .onConflictDoNothing()
        .returning({ id: codes.id });
      insertedTotal += res.length;
    }

    const [finalCount] = await db
      .select({ total: count() })
      .from(codes)
      .where(eq(codes.surveyId, survey.id));

    console.log(`Padrón electoral listo: ${Number(finalCount?.total ?? 0)} estudiantes registrados (${insertedTotal} nuevos).`);
    console.log("Panel de administración: http://localhost:3000/admin");
  } finally {
    client.close();
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
