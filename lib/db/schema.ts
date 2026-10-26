import { sql } from "drizzle-orm";
import {
  index,
  integer,
  sqliteTable,
  text,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";

const createdAt = integer("created_at", { mode: "timestamp_ms" })
  .notNull()
  .default(sql`(unixepoch() * 1000)`);

export const surveys = sqliteTable("surveys", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  isOpen: integer("is_open", { mode: "boolean" }).notNull().default(true),
  createdAt,
});

export const options = sqliteTable(
  "options",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    surveyId: integer("survey_id")
      .notNull()
      .references(() => surveys.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    description: text("description").notNull(),
    tag: text("tag").notNull(),
    imagePath: text("image_path").notNull(),
    position: integer("position").notNull(),
    createdAt,
  },
  (table) => [
    uniqueIndex("options_survey_position_unique").on(
      table.surveyId,
      table.position,
    ),
  ],
);

export const codes = sqliteTable(
  "codes",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    surveyId: integer("survey_id")
      .notNull()
      .references(() => surveys.id, { onDelete: "cascade" }),
    code: text("code").notNull().unique(),
    fullName: text("full_name"),
    usedAt: integer("used_at", { mode: "timestamp_ms" }),
    createdAt,
  },
  (table) => [index("codes_survey_idx").on(table.surveyId)],
);

export const votes = sqliteTable(
  "votes",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    surveyId: integer("survey_id")
      .notNull()
      .references(() => surveys.id, { onDelete: "cascade" }),
    optionId: integer("option_id")
      .notNull()
      .references(() => options.id, { onDelete: "cascade" }),
    codeId: integer("code_id")
      .notNull()
      .references(() => codes.id, { onDelete: "cascade" }),
    createdAt,
  },
  (table) => [
    uniqueIndex("votes_code_unique").on(table.codeId),
    index("votes_option_idx").on(table.optionId),
  ],
);

export const sessions = sqliteTable(
  "sessions",
  {
    tokenHash: text("token_hash").primaryKey(),
    codeId: integer("code_id").references(() => codes.id, {
      onDelete: "cascade",
    }),
    role: text("role", { enum: ["voter", "admin"] }).notNull(),
    expiresAt: integer("expires_at", { mode: "timestamp_ms" }).notNull(),
    createdAt,
  },
  (table) => [index("sessions_code_idx").on(table.codeId)],
);

export type Survey = typeof surveys.$inferSelect;
export type Option = typeof options.$inferSelect;
export type Code = typeof codes.$inferSelect;
export type Vote = typeof votes.$inferSelect;
export type Session = typeof sessions.$inferSelect;
