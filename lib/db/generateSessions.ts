import { eq } from 'drizzle-orm';
import { db } from '@/lib/db/client';
import { appMeta, sessions, templates, type Template } from '@/lib/db/schema';
import { addDays, dowOf, todayISO } from '@/lib/logic/dates';

const LAST_GENERATED_KEY = 'lastGeneratedDate';
/** Dias além de hoje para os quais as sessões ficam materializadas. */
export const GENERATION_HORIZON_DAYS = 7;

async function getLastGeneratedDate(): Promise<string | null> {
  const row = await db.select().from(appMeta).where(eq(appMeta.key, LAST_GENERATED_KEY));
  return row[0]?.value ?? null;
}

async function setLastGeneratedDate(date: string) {
  await db
    .insert(appMeta)
    .values({ key: LAST_GENERATED_KEY, value: date })
    .onConflictDoUpdate({ target: appMeta.key, set: { value: date } });
}

function sessionsForRange(templateList: Template[], start: string, end: string) {
  const rows = [];
  for (let date = start; date <= end; date = addDays(date, 1)) {
    const dow = dowOf(date);
    for (const t of templateList) {
      if (t.dow !== dow) continue;
      rows.push({
        subjectId: t.subjectId,
        templateId: t.id,
        date,
        dur: t.dur,
      });
    }
  }
  return rows;
}

/**
 * Materializa sessões dos templates desde a última geração até hoje+horizonte.
 * Idempotente: o índice único (templateId, date) + onConflictDoNothing
 * impedem duplicatas.
 */
export async function ensureSessionsGenerated(): Promise<void> {
  const today = todayISO();
  const horizon = addDays(today, GENERATION_HORIZON_DAYS);
  const last = await getLastGeneratedDate();
  const start = last ? addDays(last, 1) : today;
  if (start > horizon) return;

  const templateList = await db.select().from(templates);
  if (templateList.length > 0) {
    const rows = sessionsForRange(templateList, start, horizon);
    if (rows.length > 0) {
      await db.insert(sessions).values(rows).onConflictDoNothing();
    }
  }
  await setLastGeneratedDate(horizon);
}

/**
 * Após criar/editar um template, preenche o horizonte já gerado para ele
 * (de hoje até lastGeneratedDate), sem esperar a próxima geração global.
 */
export async function backfillTemplateSessions(template: Template): Promise<void> {
  const today = todayISO();
  const last = (await getLastGeneratedDate()) ?? today;
  const end = last >= today ? last : today;
  const rows = sessionsForRange([template], today, end);
  if (rows.length > 0) {
    await db.insert(sessions).values(rows).onConflictDoNothing();
  }
}
