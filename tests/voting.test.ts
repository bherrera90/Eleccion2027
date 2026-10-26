import { count, eq } from "drizzle-orm";
import { rmSync } from "node:fs";
import { resolve } from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { migrate } from "drizzle-orm/libsql/migrator";
import { createDb, type DbConnection } from "../lib/db/client";
import {
  codes,
  options,
  surveys,
  votes,
} from "../lib/db/schema";
import { castVote } from "../lib/voting";

const databaseFile = resolve("data/test-voting.db");
const databaseUrl = `file:${databaseFile}`;

let connection: DbConnection;
let surveyId: number;
let firstOptionId: number;
let secondSurveyOptionId: number;

async function createCode(code: string) {
  const [row] = await connection.db
    .insert(codes)
    .values({ surveyId, code })
    .returning();
  return row;
}

beforeAll(async () => {
  for (const suffix of ["", "-wal", "-shm"]) {
    rmSync(`${databaseFile}${suffix}`, { force: true });
  }

  connection = createDb(databaseUrl);
  await migrate(connection.db, { migrationsFolder: "./drizzle" });

  const [survey] = await connection.db
    .insert(surveys)
    .values({
      slug: "test",
      title: "Encuesta de prueba",
      description: "Solo para pruebas",
    })
    .returning();
  surveyId = survey.id;

  const [firstOption, secondOption] = await connection.db
    .insert(options)
    .values([
      {
        surveyId,
        title: "Opción A",
        description: "Primera",
        tag: "A",
        imagePath: "/images/Promo20271.jpeg",
        position: 1,
      },
      {
        surveyId,
        title: "Opción B",
        description: "Segunda",
        tag: "B",
        imagePath: "/images/Promo20272.jpeg",
        position: 2,
      },
    ])
    .returning();
  firstOptionId = firstOption.id;

  const [otherSurvey] = await connection.db
    .insert(surveys)
    .values({
      slug: "otra",
      title: "Otra encuesta",
      description: "No relacionada",
    })
    .returning();

  const [otherOption] = await connection.db
    .insert(options)
    .values({
      surveyId: otherSurvey.id,
      title: "Ajena",
      description: "Opción de otra encuesta",
      tag: "X",
      imagePath: "/images/Promo20273.jpeg",
      position: 1,
    })
    .returning();
  secondSurveyOptionId = otherOption.id;

  expect(secondOption.id).toBeGreaterThan(0);
});

afterAll(() => {
  connection.client.close();
  for (const suffix of ["", "-wal", "-shm"]) {
    rmSync(`${databaseFile}${suffix}`, { force: true });
  }
});

describe("castVote", () => {
  it("registra un voto válido y marca el código como usado", async () => {
    const code = await createCode("AAAA-BBBB");

    const result = await castVote(connection.db, {
      codeId: code.id,
      optionId: firstOptionId,
    });

    expect(result).toEqual({
      ok: true,
      surveyId,
      optionId: firstOptionId,
    });

    const [savedVote] = await connection.db
      .select()
      .from(votes)
      .where(eq(votes.codeId, code.id));

    expect(savedVote.optionId).toBe(firstOptionId);

    const [usedCode] = await connection.db
      .select()
      .from(codes)
      .where(eq(codes.id, code.id));

    expect(usedCode.usedAt).toBeInstanceOf(Date);
  });

  it("bloquea un segundo voto con el mismo código", async () => {
    const code = await createCode("CCCC-DDDD");

    const first = await castVote(connection.db, {
      codeId: code.id,
      optionId: firstOptionId,
    });
    const second = await castVote(connection.db, {
      codeId: code.id,
      optionId: firstOptionId,
    });

    expect(first.ok).toBe(true);
    expect(second).toMatchObject({ ok: false, reason: "already-voted" });

    const [total] = await connection.db
      .select({ total: count() })
      .from(votes)
      .where(eq(votes.codeId, code.id));

    expect(Number(total.total)).toBe(1);
  });

  it("rechaza una opción de otra encuesta", async () => {
    const code = await createCode("EEEE-FFFF");

    const result = await castVote(connection.db, {
      codeId: code.id,
      optionId: secondSurveyOptionId,
    });

    expect(result).toMatchObject({ ok: false, reason: "invalid-option" });
  });

  it("rechaza un código inexistente", async () => {
    const result = await castVote(connection.db, {
      codeId: 999_999,
      optionId: firstOptionId,
    });

    expect(result).toMatchObject({ ok: false, reason: "invalid-code" });
  });

  it("rechaza votar si la encuesta está cerrada", async () => {
    const code = await createCode("GGGG-HHHH");

    await connection.db
      .update(surveys)
      .set({ isOpen: false })
      .where(eq(surveys.id, surveyId));

    try {
      const result = await castVote(connection.db, {
        codeId: code.id,
        optionId: firstOptionId,
      });

      expect(result).toMatchObject({ ok: false, reason: "closed" });
    } finally {
      await connection.db
        .update(surveys)
        .set({ isOpen: true })
        .where(eq(surveys.id, surveyId));
    }
  });
});
