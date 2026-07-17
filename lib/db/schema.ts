import { sql } from 'drizzle-orm';
import { int, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core';

export const goals = sqliteTable('goals', {
  id: int('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  date: text('date'),
  description: text('description'),
  pinned: int('pinned').notNull().default(0),
  active: int('active').notNull().default(1),
  createdAt: int('created_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`),
});

export const subjects = sqliteTable('subjects', {
  id: int('id').primaryKey({ autoIncrement: true }),
  goalId: int('goal_id')
    .notNull()
    .references(() => goals.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  short: text('short').notNull(),
  color: text('color').notNull(),
  peso: int('peso').notNull().default(3),
  questions: int('questions').notNull().default(0),
  createdAt: int('created_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`),
});

export const templates = sqliteTable('templates', {
  id: int('id').primaryKey({ autoIncrement: true }),
  subjectId: int('subject_id')
    .notNull()
    .references(() => subjects.id, { onDelete: 'cascade' }),
  dow: int('dow').notNull(),
  dur: int('dur').notNull(),
});

export const sessions = sqliteTable(
  'sessions',
  {
    id: int('id').primaryKey({ autoIncrement: true }),
    subjectId: int('subject_id')
      .notNull()
      .references(() => subjects.id, { onDelete: 'cascade' }),
    templateId: int('template_id').references(() => templates.id, { onDelete: 'set null' }),
    date: text('date').notNull(),
    origDate: text('orig_date'),
    dur: int('dur').notNull(),
    status: text('status').notNull().default('pendente'),
    note: text('note'),
  },
  (table) => [uniqueIndex('sessions_template_date_idx').on(table.templateId, table.date)]
);

export const appMeta = sqliteTable('app_meta', {
  key: text('key').primaryKey(),
  value: text('value').notNull(),
});

export type Goal = typeof goals.$inferSelect;
export type NewGoal = typeof goals.$inferInsert;
export type Subject = typeof subjects.$inferSelect;
export type NewSubject = typeof subjects.$inferInsert;
export type Template = typeof templates.$inferSelect;
export type NewTemplate = typeof templates.$inferInsert;
export type Session = typeof sessions.$inferSelect;
export type NewSession = typeof sessions.$inferInsert;

export type SessionStatus = 'pendente' | 'concluido' | 'desistido';
