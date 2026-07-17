import { View } from 'react-native';
import { Text } from '@/components/ui/text';
import type { Session } from '@/lib/db/schema';
import { addDays } from '@/lib/logic/dates';
import { dayStatus, type DayStatus } from '@/lib/logic/study';
import { cn } from '@/lib/utils';

const CELL_CLASSES: Record<DayStatus, { box: string; num: string }> = {
  completo: { box: 'bg-primary border-primary', num: 'text-primary-foreground' },
  parcial: { box: 'bg-primary/30 border-primary/30', num: 'text-foreground' },
  perdido: { box: 'bg-secondary border-input', num: 'text-muted-foreground' },
  folga: { box: 'bg-transparent border-border', num: 'text-muted-foreground/60' },
  futuro: { box: 'bg-transparent border-border', num: 'text-muted-foreground/60' },
};

type Heatmap14dProps = {
  sessions: Pick<Session, 'date' | 'status'>[];
  today: string;
};

export function Heatmap14d({ sessions, today }: Heatmap14dProps) {
  const days = Array.from({ length: 14 }, (_, i) => addDays(today, i - 13));

  return (
    <View className="flex-row flex-wrap gap-[7px]">
      {days.map((date) => {
        const st = dayStatus(
          date,
          sessions.filter((s) => s.date === date),
          today
        );
        const c = CELL_CLASSES[st];
        return (
          <View
            key={date}
            className={cn(
              'aspect-square w-[11.5%] items-center justify-center rounded-lg border',
              c.box
            )}>
            <Text className={cn('font-mono text-[10px]', c.num)}>{Number(date.slice(8, 10))}</Text>
          </View>
        );
      })}
    </View>
  );
}
