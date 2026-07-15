import { useMigrations } from 'drizzle-orm/expo-sqlite/migrator';
import { db } from '@/lib/db/client';
import migrations from '@/lib/db/migrations/migrations';

export function useDatabaseMigrations() {
  return useMigrations(db, migrations);
}
