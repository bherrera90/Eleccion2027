import { mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { createClient, type Client } from "@libsql/client";
import { drizzle, type LibSQLDatabase } from "drizzle-orm/libsql";
import * as schema from "./schema";

export type Database = LibSQLDatabase<typeof schema>;

export type DbConnection = {
  client: Client;
  db: Database;
};

function firstEnv(...keys: string[]) {
  for (const key of keys) {
    const value = process.env[key]?.trim();
    if (value) {
      return value;
    }
  }

  return undefined;
}

export function defaultDatabaseUrl() {
  const configured = firstEnv("DATABASE_URL", "TURSO_DATABASE_URL");
  if (configured) {
    return configured;
  }

  if (process.env.VERCEL) {
    throw new Error(
      "Falta DATABASE_URL o TURSO_DATABASE_URL. En Vercel no se puede usar SQLite en disco.",
    );
  }

  return "file:./data/survey.db";
}

export function databaseAuthToken() {
  return firstEnv("DATABASE_AUTH_TOKEN", "TURSO_AUTH_TOKEN");
}

export function createDb(url = defaultDatabaseUrl()): DbConnection {
  const normalizedUrl = url.startsWith("libsql://")
    ? url.replace("libsql://", "https://")
    : url;

  if (normalizedUrl.startsWith("file:")) {
    if (process.env.VERCEL) {
      throw new Error(
        "SQLite en archivo no funciona en Vercel. Configura una base Turso.",
      );
    }

    mkdirSync(dirname(normalizedUrl.slice("file:".length)), { recursive: true });
  }

  const authToken = databaseAuthToken();
  const client = createClient({
    url: normalizedUrl,
    ...(authToken ? { authToken } : {}),
  });
  return {
    client,
    db: drizzle(client, { schema }),
  };
}

const globalForDb = globalThis as unknown as {
  surveyDb?: DbConnection;
};

const connection = globalForDb.surveyDb ?? createDb();

if (process.env.NODE_ENV !== "production") {
  globalForDb.surveyDb = connection;
}

export const db = connection.db;
