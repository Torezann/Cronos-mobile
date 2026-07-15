import { useLiveQuery } from 'drizzle-orm/expo-sqlite';
import { useCallback } from 'react';
import { db, expoDb } from '@/lib/db/client';
import { items } from '@/lib/db/schema';

export function useItems() {
  const { data, error, updatedAt } = useLiveQuery(db.select().from(items).orderBy(items.id));

  const addItem = useCallback(async (name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    await db.insert(items).values({ name: trimmed });
  }, []);

  const clearItems = useCallback(async () => {
    await expoDb.runAsync('DELETE FROM items');
  }, []);

  return { items: data ?? [], error, updatedAt, addItem, clearItems };
}
