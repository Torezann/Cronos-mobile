import { and, eq, lt } from 'drizzle-orm';
import { db } from '@/lib/db/client';
import { goals, sessions, subjects } from '@/lib/db/schema';
import { useLiveTablesQuery } from '@/hooks/useLiveTablesQuery';
import { todayISO } from '@/lib/logic/dates';
import { pendingStats } from '@/lib/logic/study';
import type { SessionWithSubject } from '@/hooks/useSessions';

/** Sessões atrasadas: data no passado e ainda pendentes. */
export function usePendingSessions() {
  const today = todayISO();
  const { data } = useLiveTablesQuery(
    db
      .select({ session: sessions, subject: subjects })
      .from(sessions)
      .innerJoin(subjects, eq(sessions.subjectId, subjects.id))
      .innerJoin(goals, eq(subjects.goalId, goals.id))
      .where(and(lt(sessions.date, today), eq(sessions.status, 'pendente'), eq(goals.active, 1)))
      .orderBy(sessions.date, sessions.id),
    ['sessions', 'subjects', 'goals'],
    [today]
  );

  const rows: SessionWithSubject[] = data ?? [];
  const stats = pendingStats(
    rows.map((r) => r.session),
    today
  );

  return { rows, ...stats };
}
