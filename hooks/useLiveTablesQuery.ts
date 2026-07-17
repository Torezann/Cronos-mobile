import { addDatabaseChangeListener } from 'expo-sqlite';
import { useEffect, useState } from 'react';

/**
 * Versão do useLiveQuery do Drizzle que re-executa a query quando QUALQUER
 * uma das tabelas listadas muda — o hook original só observa a tabela do FROM,
 * ignorando os joins (ex.: goals.active em queries de sessões).
 */
export function useLiveTablesQuery<T>(
  query: PromiseLike<T>,
  tables: string[],
  deps: unknown[] = []
): { data: T | undefined } {
  const [data, setData] = useState<T | undefined>(undefined);

  useEffect(() => {
    let cancelled = false;
    const run = () => {
      query.then(
        (rows) => {
          if (!cancelled) setData(rows);
        },
        () => {}
      );
    };
    run();
    const listener = addDatabaseChangeListener(({ tableName }) => {
      if (tables.includes(tableName)) run();
    });
    return () => {
      cancelled = true;
      listener.remove();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return { data };
}
