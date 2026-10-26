import { config } from "dotenv";
import { eq } from "drizzle-orm";
import { createDb } from "../lib/db/client";
import { codes, sessions, votes } from "../lib/db/schema";

config({ path: ".env.local" });
config();

async function main() {
  const { client, db } = createDb();

  try {
    // Borrar todos los votos
    await db.delete(votes);
    // Borrar sesiones activas de votantes
    await db.delete(sessions);
    // Restablecer el estado de usado de todas las cédulas a null
    await db.update(codes).set({ usedAt: null });

    console.log("Se han reiniciado todos los votos y sesiones. Las 576 cédulas están listas para votar desde cero.");
  } finally {
    client.close();
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
