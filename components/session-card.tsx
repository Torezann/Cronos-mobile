import { Check } from 'lucide-react-native';
import { Pressable, View } from 'react-native';
import { Text } from '@/components/ui/text';
import type { SessionWithSubject } from '@/hooks/useSessions';
import { hoursLabel } from '@/lib/logic/dates';
import { cn } from '@/lib/utils';

type SessionCardProps = {
  row: SessionWithSubject;
  onToggle: () => void;
};

export function SessionCard({ row, onToggle }: SessionCardProps) {
  const { session, subject } = row;
  const done = session.status === 'concluido';

  return (
    <Pressable
      onPress={onToggle}
      className={cn(
        'min-h-16 flex-row items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3.5',
        done && 'opacity-60'
      )}>
      <View
        className={cn(
          'h-7 w-7 items-center justify-center rounded-full border-2',
          done ? 'border-primary bg-primary' : 'border-input bg-transparent'
        )}>
        {done ? <Check size={15} color="#1B1005" strokeWidth={3.5} /> : null}
      </View>
      <View className="w-1 self-stretch rounded-full" style={{ backgroundColor: subject.color }} />
      <View className="min-w-0 flex-1">
        <Text
          className={cn('font-sans-bold text-[15px] text-foreground', done && 'line-through')}
          numberOfLines={1}>
          {subject.name}
        </Text>
        <Text className="mt-0.5 text-xs text-muted-foreground">
          {hoursLabel(session.dur)}
          {session.origDate ? <Text className="text-xs text-accent-foreground"> · reagendada</Text> : null}
        </Text>
      </View>
    </Pressable>
  );
}
