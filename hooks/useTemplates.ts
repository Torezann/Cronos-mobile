import { and, eq, gte } from 'drizzle-orm';
import { useCallback } from 'react';
import { db } from '@/lib/db/client';
import { sessions, subjects, templates } from '@/lib/db/schema';
import { useLiveTablesQuery } from '@/hooks/useLiveTablesQuery';
import { backfillTemplateSessions } from '@/lib/db/generateSessions';
import { todayISO } from '@/lib/logic/dates';

export type TemplateInput = {
  subjectId: number;
  dow: number;
  dur: number;
};

async function deleteFutureSessions(templateId: number) {
  await db
    .delete(sessions)
    .where(
      and(
        eq(sessions.templateId, templateId),
        gte(sessions.date, todayISO()),
        eq(sessions.status, 'pendente')
      )
    );
}

export function useTemplates(goalId: number) {
  const { data } = useLiveTablesQuery(
    db
      .select({ template: templates, subject: subjects })
      .from(templates)
      .innerJoin(subjects, eq(templates.subjectId, subjects.id))
      .where(eq(subjects.goalId, goalId))
      .orderBy(templates.dow, templates.id),
    ['templates', 'subjects'],
    [goalId]
  );

  const createTemplate = useCallback(async (input: TemplateInput) => {
    const [created] = await db.insert(templates).values(input).returning();
    if (created) await backfillTemplateSessions(created);
  }, []);

  const updateTemplate = useCallback(async (id: number, input: TemplateInput) => {
    const [updated] = await db
      .update(templates)
      .set(input)
      .where(eq(templates.id, id))
      .returning();
    if (updated) {
      await deleteFutureSessions(id);
      await backfillTemplateSessions(updated);
    }
  }, []);

  const deleteTemplate = useCallback(async (id: number) => {
    await deleteFutureSessions(id);
    await db.delete(templates).where(eq(templates.id, id));
  }, []);

  return { rows: data ?? [], createTemplate, updateTemplate, deleteTemplate };
}
