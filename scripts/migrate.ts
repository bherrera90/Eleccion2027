import { config } from "dotenv";
import { migrate } from "drizzle-orm/libsql/migrator";
import { createDb, defaultDatabaseUrl } from "../lib/db/client";

config({ path: ".env.local" });
config();

async function main() {
  const url = defaultDatabaseUrl();
  const { client, db } = createDb(url);

  try {
    await migrate(db, { migrationsFolder: "./drizzle" });
    console.log(`Base de datos lista en ${url}`);
  } finally {
    client.close();
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
