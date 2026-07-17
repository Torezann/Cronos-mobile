import { eq, getTableColumns, sql } from 'drizzle-orm';
import { useCallback } from 'react';
import { db } from '@/lib/db/client';
import { goals, subjects } from '@/lib/db/schema';
import { useLiveTablesQuery } from '@/hooks/useLiveTablesQuery';
import { suggestShort } from '@/lib/logic/study';

export type SubjectInput = {
  name: string;
  color: string;
  peso: number;
};

export function useSubjects(goalId?: number) {
  // Sem goalId (telas de consumo): só matérias de metas ativas.
  // Com goalId (gestão da meta): sempre lista, ativa ou não.
  const { data } = useLiveTablesQuery(
    goalId === undefined
      ? db
          .select(getTableColumns(subjects))
          .from(subjects)
          .innerJoin(goals, eq(subjects.goalId, goals.id))
          .where(eq(goals.active, 1))
          .orderBy(subjects.id)
      : db.select().from(subjects).where(eq(subjects.goalId, goalId)).orderBy(subjects.id),
    ['subjects', 'goals'],
    [goalId]
  );

  const createSubject = useCallback(
    async (input: SubjectInput) => {
      const name = input.name.trim();
      if (!name || goalId === undefined) return;
      await db.insert(subjects).values({
        goalId,
        name,
        short: suggestShort(name),
        color: input.color,
        peso: input.peso,
      });
    },
    [goalId]
  );

  const updateSubject = useCallback(async (id: number, input: SubjectInput) => {
    const name = input.name.trim();
    if (!name) return;
    await db
      .update(subjects)
      .set({ name, short: suggestShort(name), color: input.color, peso: input.peso })
      .where(eq(subjects.id, id));
  }, []);

  const deleteSubject = useCallback(async (id: number) => {
    await db.delete(subjects).where(eq(subjects.id, id));
  }, []);

  const adjustQuestions = useCallback(async (id: number, delta: number) => {
    await db
      .update(subjects)
      .set({ questions: sql`max(0, ${subjects.questions} + ${delta})` })
      .where(eq(subjects.id, id));
  }, []);

  return {
    subjects: data ?? [],
    createSubject,
    updateSubject,
    deleteSubject,
    adjustQuestions,
  };
}
