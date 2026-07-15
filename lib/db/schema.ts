import { sql } from 'drizzle-orm';
import { int, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const items = sqliteTable('items', {
  id: int('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  createdAt: int('created_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`),
});

export type Item = typeof items.$inferSelect;
export type NewItem = typeof items.$inferInsert;
