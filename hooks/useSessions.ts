import { and, eq, gte, lte } from 'drizzle-orm';
import { useLiveQuery } from 'drizzle-orm/expo-sqlite';
import { useCallback } from 'react';
import { db } from '@/lib/db/client';
import { goals, sessions, subjects, type Session, type Subject } from '@/lib/db/schema';
import { useLiveTablesQuery } from '@/hooks/useLiveTablesQuery';
import { todayISO } from '@/lib/logic/dates';

export type SessionWithSubject = { session: Session; subject: Subject };

export function useSessionMutations() {
  const toggleSession = useCallback(async (id: number) => {
    const [current] = await db.select().from(sessions).where(eq(sessions.id, id));
    if (!current) return;
    await db
      .update(sessions)
      .set({ status: current.status === 'concluido' ? 'pendente' : 'concluido' })
      .where(eq(sessions.id, id));
  }, []);

  const rescheduleToToday = useCallback(async (id: number) => {
    const [current] = await db.select().from(sessions).where(eq(sessions.id, id));
    if (!current) return;
    await db
      .update(sessions)
      .set({
        origDate: current.origDate ?? current.date,
        date: todayISO(),
        status: 'pendente',
        // Sai do template para não colidir com a sessão gerada do dia.
        templateId: null,
      })
      .where(eq(sessions.id, id));
  }, []);

  const giveUp = useCallback(async (id: number) => {
    await db.update(sessions).set({ status: 'desistido' }).where(eq(sessions.id, id));
  }, []);

  const setNote = useCallback(async (id: number, note: string) => {
    await db
      .update(sessions)
      .set({ note: note.trim() || null })
      .where(eq(sessions.id, id));
  }, []);

  return { toggleSession, rescheduleToToday, giveUp, setNote };
}

export function useSessionsForDate(date: string): SessionWithSubject[] {
  const { data } = useLiveTablesQuery(
    db
      .select({ session: sessions, subject: subjects })
      .from(sessions)
      .innerJoin(subjects, eq(sessions.subjectId, subjects.id))
      .innerJoin(goals, eq(subjects.goalId, goals.id))
      .where(and(eq(sessions.date, date), eq(goals.active, 1)))
      .orderBy(sessions.id),
    ['sessions', 'subjects', 'goals'],
    [date]
  );
  return data ?? [];
}

/**
 * Histórico de sessões no período, incluindo matérias de metas desativadas —
 * desativar uma meta não deve apagar retroativamente a ofensiva já cumprida.
 */
export function useSessionsForRange(start: string, end: string): SessionWithSubject[] {
  const { data } = useLiveTablesQuery(
    db
      .select({ session: sessions, subject: subjects })
      .from(sessions)
      .innerJoin(subjects, eq(sessions.subjectId, subjects.id))
      .innerJoin(goals, eq(subjects.goalId, goals.id))
      .where(and(gte(sessions.date, start), lte(sessions.date, end)))
      .orderBy(sessions.date, sessions.id),
    ['sessions', 'subjects', 'goals'],
    [start, end]
  );
  return data ?? [];
}

export function useSessionsForSubject(subjectId: number | null): Session[] {
  const { data } = useLiveQuery(
    db
      .select()
      .from(sessions)
      .where(eq(sessions.subjectId, subjectId ?? -1))
      .orderBy(sessions.date, sessions.id),
    [subjectId]
  );
  return data ?? [];
}
