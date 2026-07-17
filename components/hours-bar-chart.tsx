import { Pressable, View } from 'react-native';
import { Text } from '@/components/ui/text';
import { hoursLabel } from '@/lib/logic/dates';
import type { SubjectHours } from '@/lib/logic/study';

type HoursBarChartProps = {
  data: SubjectHours[];
  onPressRow: (subjectId: number) => void;
};

export function HoursBarChart({ data, onPressRow }: HoursBarChartProps) {
  return (
    <View className="gap-2.5">
      {data.map(({ subject, minutes, pct }) => (
        <Pressable
          key={subject.id}
          onPress={() => onPressRow(subject.id)}
          className="flex-row items-center gap-2.5">
          <Text
            className="w-24 text-xs font-sans-semibold text-foreground"
            numberOfLines={1}>
            {subject.short}
          </Text>
          <View className="h-4 flex-1 overflow-hidden rounded-md bg-secondary">
            <View
              className="h-full rounded-md"
              style={{ width: `${Math.max(pct, minutes > 0 ? 4 : 0)}%`, backgroundColor: subject.color }}
            />
          </View>
          <Text className="w-11 text-right font-mono text-[11px] text-muted-foreground">
            {minutes > 0 ? hoursLabel(minutes) : '—'}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}
