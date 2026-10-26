import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

config({ path: ".env.local" });
config();

const url =
  process.env.DATABASE_URL?.trim() ||
  process.env.TURSO_DATABASE_URL?.trim() ||
  "file:./data/survey.db";
const authToken =
  process.env.DATABASE_AUTH_TOKEN?.trim() ||
  process.env.TURSO_AUTH_TOKEN?.trim();
const isRemote = url.startsWith("libsql:") || url.startsWith("https:");

export default defineConfig({
  schema: "./lib/db/schema.ts",
  out: "./drizzle",
  dialect: isRemote ? "turso" : "sqlite",
  dbCredentials: {
    url,
    ...(authToken ? { authToken } : {}),
  },
  strict: true,
  verbose: true,
});
