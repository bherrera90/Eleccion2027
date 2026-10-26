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

export function defaultDatabaseUrl() {
  return process.env.DATABASE_URL ?? "file:./data/survey.db";
}

export function createDb(url = defaultDatabaseUrl()): DbConnection {
  if (url.startsWith("file:")) {
    mkdirSync(dirname(url.slice("file:".length)), { recursive: true });
  }

  const authToken = process.env.DATABASE_AUTH_TOKEN;
  const client = createClient({
    url,
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
