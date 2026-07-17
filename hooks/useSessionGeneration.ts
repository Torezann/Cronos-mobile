import { useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';
import { ensureSessionsGenerated } from '@/lib/db/generateSessions';

/**
 * Roda a materialização de sessões após as migrations e sempre que o app
 * volta ao primeiro plano (cobre a virada de dia com o app aberto).
 */
export function useSessionGeneration(migrationsReady: boolean): boolean {
  const [ready, setReady] = useState(false);
  const running = useRef(false);

  useEffect(() => {
    if (!migrationsReady) return;

    const run = () => {
      if (running.current) return;
      running.current = true;
      ensureSessionsGenerated()
        .catch((e) => console.error('Falha ao gerar sessões', e))
        .finally(() => {
          running.current = false;
          setReady(true);
        });
    };

    run();
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') run();
    });
    return () => sub.remove();
  }, [migrationsReady]);

  return ready;
}
