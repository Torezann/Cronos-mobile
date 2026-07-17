import type { Session, Subject } from '@/lib/db/schema';
import { addDays, diffDays, dowOf, hoursLabel } from '@/lib/logic/dates';

export type DayStatus = 'folga' | 'completo' | 'parcial' | 'perdido' | 'futuro';

/** Sessão está atrasada (pendente com data no passado)? */
export function isOverdue(session: Pick<Session, 'date' | 'status'>, today: string): boolean {
  return session.date < today && session.status === 'pendente';
}

/**
 * Status de um dia. Domingos e dias sem sessões são folga; sessões
 * desistidas ficam fora do denominador.
 */
export function dayStatus(
  date: string,
  sessionsOfDay: Pick<Session, 'date' | 'status'>[],
  today: string
): DayStatus {
  if (dowOf(date) === 7) return 'folga';
  const relevant = sessionsOfDay.filter((s) => s.status !== 'desistido');
  if (relevant.length === 0) return 'folga';
  const done = relevant.filter((s) => s.status === 'concluido').length;
  if (done === relevant.length) return 'completo';
  if (date > today) return 'futuro';
  if (done > 0) return 'parcial';
  // Hoje sem nada feito ainda não conta nem quebra a ofensiva.
  return date < today ? 'perdido' : 'futuro';
}

function groupByDate(sessions: Pick<Session, 'date' | 'status'>[]) {
  const map = new Map<string, Pick<Session, 'date' | 'status'>[]>();
  for (const s of sessions) {
    const list = map.get(s.date);
    if (list) list.push(s);
    else map.set(s.date, [s]);
  }
  return map;
}

/**
 * Ofensivas contadas de hoje para trás, pulando folgas. A perfeita exige
 * dias completos; a parcial aceita dias com pelo menos uma sessão feita.
 * Hoje só conta se já qualificar; se ainda não, não quebra a sequência.
 */
export function computeStreaks(
  sessions: Pick<Session, 'date' | 'status'>[],
  today: string
): { perfect: number; partial: number } {
  const byDate = groupByDate(sessions);
  const earliest = sessions.reduce((min, s) => (s.date < min ? s.date : min), today);

  const count = (perfect: boolean) => {
    let n = 0;
    for (let date = today; date >= earliest; date = addDays(date, -1)) {
      const st = dayStatus(date, byDate.get(date) ?? [], today);
      if (st === 'folga') continue;
      const ok = st === 'completo' || (!perfect && st === 'parcial');
      if (ok) n++;
      else if (date === today) continue; // hoje incompleto não quebra
      else break;
    }
    return n;
  };

  return { perfect: count(true), partial: count(false) };
}

export function daysToExam(goalDate: string, today: string): number {
  return diffDays(today, goalDate);
}

export function pendingStats(
  overdueSessions: Pick<Session, 'date' | 'dur'>[],
  today: string
): { count: number; minutesLate: number; hoursLateLabel: string; maxDaysLate: number } {
  const minutesLate = overdueSessions.reduce((a, s) => a + s.dur, 0);
  const maxDaysLate = overdueSessions.reduce((a, s) => Math.max(a, diffDays(s.date, today)), 0);
  return {
    count: overdueSessions.length,
    minutesLate,
    hoursLateLabel: hoursLabel(minutesLate),
    maxDaysLate,
  };
}

export type SubjectHours = {
  subject: Subject;
  minutes: number;
  pct: number;
};

/** Minutos concluídos por matéria, com % relativa à maior barra. */
export function aggregateHoursBySubject(
  sessions: Pick<Session, 'subjectId' | 'status' | 'dur'>[],
  subjects: Subject[]
): SubjectHours[] {
  const minutesBySubject = new Map<number, number>();
  for (const s of sessions) {
    if (s.status !== 'concluido') continue;
    minutesBySubject.set(s.subjectId, (minutesBySubject.get(s.subjectId) ?? 0) + s.dur);
  }
  const max = Math.max(1, ...minutesBySubject.values());
  return subjects
    .map((subject) => {
      const minutes = minutesBySubject.get(subject.id) ?? 0;
      return { subject, minutes, pct: Math.round((minutes / max) * 100) };
    })
    .sort((a, b) => b.minutes - a.minutes);
}

/** Sugere o nome curto de uma matéria (primeira palavra significativa). */
export function suggestShort(name: string): string {
  const stop = new Set(['de', 'da', 'do', 'e', 'em']);
  const words = name.trim().split(/\s+/);
  const significant = words.filter((w) => !stop.has(w.toLowerCase()));
  const last = significant[significant.length - 1] ?? words[0] ?? '';
  return words.length > 1 && last.length > 2 ? last : (words[0] ?? '');
}
