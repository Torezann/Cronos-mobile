import { eq, ne, sql } from 'drizzle-orm';
import { useLiveQuery } from 'drizzle-orm/expo-sqlite';
import { useCallback } from 'react';
import { db } from '@/lib/db/client';
import { goals, subjects, type Goal } from '@/lib/db/schema';

export type GoalInput = {
  name: string;
  date?: string | null;
  description?: string | null;
};

export function useGoals() {
  const { data } = useLiveQuery(db.select().from(goals).orderBy(goals.id));
  const { data: subjectData } = useLiveQuery(db.select().from(subjects));

  const createGoal = useCallback(async (input: GoalInput) => {
    const name = input.name.trim();
    if (!name) return;
    const isFirst = (await db.select({ id: goals.id }).from(goals).limit(1)).length === 0;
    await db.insert(goals).values({
      name,
      date: input.date || null,
      description: input.description?.trim() || null,
      pinned: isFirst ? 1 : 0,
    });
  }, []);

  const updateGoal = useCallback(async (id: number, input: GoalInput) => {
    const name = input.name.trim();
    if (!name) return;
    await db
      .update(goals)
      .set({ name, date: input.date || null, description: input.description?.trim() || null })
      .where(eq(goals.id, id));
  }, []);

  const deleteGoal = useCallback(async (id: number) => {
    await db.delete(goals).where(eq(goals.id, id));
    // Se a meta fixada foi removida, fixa a primeira restante.
    const remaining = await db.select().from(goals).orderBy(goals.id).limit(1);
    if (remaining[0] && !(await db.select().from(goals).where(eq(goals.pinned, 1))).length) {
      await db.update(goals).set({ pinned: 1 }).where(eq(goals.id, remaining[0].id));
    }
  }, []);

  const pinGoal = useCallback(async (id: number) => {
    await db.update(goals).set({ pinned: 0 }).where(ne(goals.id, id));
    // Fixar implica ativa: o countdown do Dash só faz sentido para meta ativa.
    await db.update(goals).set({ pinned: 1, active: 1 }).where(eq(goals.id, id));
  }, []);

  const setGoalActive = useCallback(async (id: number, active: boolean) => {
    // Desativar também desfixa: meta inativa não deve segurar o countdown do Dash.
    await db
      .update(goals)
      .set(active ? { active: 1 } : { active: 0, pinned: 0 })
      .where(eq(goals.id, id));
  }, []);

  return {
    goals: data ?? [],
    subjects: subjectData ?? [],
    createGoal,
    updateGoal,
    deleteGoal,
    pinGoal,
    setGoalActive,
  };
}

export function usePinnedGoal(): Goal | null {
  const { data } = useLiveQuery(db.select().from(goals).where(sql`${goals.pinned} = 1`).limit(1));
  return data?.[0] ?? null;
}
