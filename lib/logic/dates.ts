const DAY_MS = 86400000;

const WEEKDAY_SHORT = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'];
const WEEKDAY_LONG = [
  'domingo',
  'segunda',
  'terça',
  'quarta',
  'quinta',
  'sexta',
  'sábado',
];
const WEEKDAY_LABEL = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB'];
const MONTH_SHORT = [
  'jan',
  'fev',
  'mar',
  'abr',
  'mai',
  'jun',
  'jul',
  'ago',
  'set',
  'out',
  'nov',
  'dez',
];

function toDate(iso: string): Date {
  return new Date(iso + 'T12:00:00');
}

export function todayISO(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function addDays(iso: string, n: number): string {
  return new Date(toDate(iso).getTime() + n * DAY_MS).toISOString().slice(0, 10);
}

/** b − a, em dias inteiros. */
export function diffDays(a: string, b: string): number {
  return Math.round((toDate(b).getTime() - toDate(a).getTime()) / DAY_MS);
}

/** Dia da semana: 1 = segunda … 7 = domingo. */
export function dowOf(iso: string): number {
  const d = toDate(iso).getDay();
  return d === 0 ? 7 : d;
}

/** Datas da semana (seg–dom) que contém `iso`. */
export function weekDatesFor(iso: string): string[] {
  const monday = addDays(iso, 1 - dowOf(iso));
  return Array.from({ length: 7 }, (_, i) => addDays(monday, i));
}

/** "QUARTA · 15 JUL 2026" */
export function formatOverline(iso: string): string {
  const d = toDate(iso);
  return `${WEEKDAY_LONG[d.getDay()].toUpperCase()} · ${d.getDate()} ${MONTH_SHORT[d.getMonth()].toUpperCase()} ${d.getFullYear()}`;
}

/** "qua 15/07" */
export function formatDayShort(iso: string): string {
  const d = toDate(iso);
  return `${WEEKDAY_SHORT[d.getDay()]} ${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`;
}

/** "SEG" | "TER" … */
export function weekdayLabel(iso: string): string {
  return WEEKDAY_LABEL[toDate(iso).getDay()];
}

export function weekdayLabelFromDow(dow: number): string {
  return WEEKDAY_LABEL[dow === 7 ? 0 : dow];
}

/** "13 — 19 de julho" */
export function formatWeekRange(dates: string[]): string {
  const first = toDate(dates[0]);
  const last = toDate(dates[dates.length - 1]);
  const monthLong = last.toLocaleDateString('pt-BR', { month: 'long' });
  if (first.getMonth() === last.getMonth()) {
    return `${first.getDate()} — ${last.getDate()} de ${monthLong}`;
  }
  const firstMonth = MONTH_SHORT[first.getMonth()];
  return `${first.getDate()} ${firstMonth} — ${last.getDate()} de ${monthLong}`;
}

/** "13 set" */
export function formatShortDate(iso: string): string {
  const d = toDate(iso);
  return `${d.getDate()} ${MONTH_SHORT[d.getMonth()]}`;
}

/** 90 → "1h30" · 60 → "1h" · 45 → "45min" */
export function hoursLabel(minutes: number): string {
  if (minutes < 60) return `${minutes}min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m ? `${h}h${String(m).padStart(2, '0')}` : `${h}h`;
}

export function isValidISODate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const d = new Date(value + 'T12:00:00');
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === value;
}

/** Aceita "AAAA-MM-DD" ou "DD/MM/AAAA"; retorna ISO ou null. */
export function parseDateInput(value: string): string | null {
  const v = value.trim();
  if (!v) return null;
  const br = v.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  const iso = br ? `${br[3]}-${br[2]}-${br[1]}` : v;
  return isValidISODate(iso) ? iso : null;
}

/** ISO → "DD/MM/AAAA" para exibir em formulários. */
export function formatDateBR(iso: string): string {
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
}
