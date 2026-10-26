import { asc, count, eq } from "drizzle-orm";
import { db } from "./db/client";
import {
  codes,
  options,
  surveys,
  votes,
  type Option,
  type Survey,
} from "./db/schema";

export type SurveyWithOptions = Survey & { options: Option[] };

export async function getSurvey(): Promise<Survey | null> {
  const [survey] = await db
    .select()
    .from(surveys)
    .orderBy(asc(surveys.id))
    .limit(1);
  return survey ?? null;
}

export async function getSurveyWithOptions(): Promise<SurveyWithOptions | null> {
  const survey = await getSurvey();
  if (!survey) {
    return null;
  }

  const surveyOptions = await db
    .select()
    .from(options)
    .where(eq(options.surveyId, survey.id))
    .orderBy(asc(options.position));

  return { ...survey, options: surveyOptions };
}

export async function getResults(surveyId: number) {
  const surveyOptions = await db
    .select()
    .from(options)
    .where(eq(options.surveyId, surveyId))
    .orderBy(asc(options.position));

  const tallies = await db
    .select({ optionId: votes.optionId, total: count() })
    .from(votes)
    .where(eq(votes.surveyId, surveyId))
    .groupBy(votes.optionId);

  const tallyByOption = new Map(
    tallies.map((tally) => [tally.optionId, Number(tally.total)]),
  );

  return surveyOptions.map((option) => ({
    ...option,
    total: tallyByOption.get(option.id) ?? 0,
  }));
}

export async function getVoteByCode(codeId: number) {
  const [vote] = await db
    .select()
    .from(votes)
    .where(eq(votes.codeId, codeId))
    .limit(1);
  return vote ?? null;
}

export async function getCodes(surveyId: number) {
  return db
    .select()
    .from(codes)
    .where(eq(codes.surveyId, surveyId))
    .orderBy(asc(codes.id));
}

export async function getCodeUsage(surveyId: number) {
  const [usage] = await db
    .select({
      total: count(),
      used: count(codes.usedAt),
    })
    .from(codes)
    .where(eq(codes.surveyId, surveyId));

  return {
    total: Number(usage?.total ?? 0),
    used: Number(usage?.used ?? 0),
  };
}
