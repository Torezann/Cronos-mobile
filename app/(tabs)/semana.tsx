import { Check, X } from 'lucide-react-native';
import { Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { EmptyState } from '@/components/empty-state';
import { ScreenHeader } from '@/components/screen-header';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { useSessionMutations, useSessionsForRange } from '@/hooks/useSessions';
import { useSubjects } from '@/hooks/useSubjects';
import { hoursLabel, todayISO, weekDatesFor, weekdayLabel, formatWeekRange } from '@/lib/logic/dates';
import { isOverdue } from '@/lib/logic/study';
import { cn } from '@/lib/utils';

export default function SemanaScreen() {
  const insets = useSafeAreaInsets();
  const today = todayISO();
  const week = weekDatesFor(today);

  const { subjects } = useSubjects();
  const rows = useSessionsForRange(week[0], week[6]);
  const { toggleSession } = useSessionMutations();

  // useSessionsForRange inclui matérias de metas desativadas (histórico da ofensiva);
  // aqui mostramos só o que resta de metas ativas.
  const activeSubjectIds = new Set(subjects.map((s) => s.id));

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerStyle={{ paddingTop: insets.top + 12, paddingBottom: 32 }}
      contentContainerClassName="px-4 gap-3">
      <ScreenHeader title="Semana" subtitle={formatWeekRange(week)} />

      {subjects.length === 0 ? (
        <EmptyState
          emoji="🗓️"
          title="Semana vazia"
          description="Configure sua meta e o cronograma semanal em Config para ver a semana aqui."
        />
      ) : (
        week.map((date) => {
          const isToday = date === today;
          const dayRows = rows.filter(
            (r) =>
              r.session.date === date &&
              r.session.status !== 'desistido' &&
              activeSubjectIds.has(r.subject.id)
          );
          const dayNum = Number(date.slice(8, 10));
          return (
            <View
              key={date}
              className={cn(
                'rounded-2xl border px-3.5 py-3',
                isToday ? 'border-primary/40 bg-accent' : 'border-border bg-card'
              )}>
              <View className="mb-2.5 flex-row items-center gap-2.5">
                <Text
                  className={cn(
                    'font-mono text-[11px] tracking-[1.5px]',
                    isToday ? 'text-primary' : 'text-muted-foreground'
                  )}>
                  {weekdayLabel(date)}
                </Text>
                <Text
                  className={cn(
                    'font-sans-extrabold text-base',
                    isToday ? 'text-accent-foreground' : 'text-foreground'
                  )}>
                  {dayNum}
                </Text>
                {isToday ? (
                  <View className="rounded-full bg-primary/15 px-2 py-0.5">
                    <Text className="text-[10px] font-sans-bold text-primary">HOJE</Text>
                  </View>
                ) : null}
              </View>

              {dayRows.length === 0 ? (
                <Text className="text-xs text-muted-foreground/70">folga (perdão)</Text>
              ) : (
                <View className="gap-1.5">
                  {dayRows.map(({ session, subject }) => {
                    const done = session.status === 'concluido';
                    const lost = isOverdue(session, today);
                    return (
                      <Pressable
                        key={session.id}
                        onPress={() => toggleSession(session.id)}
                        className={cn(
                          'min-h-11 flex-row items-center gap-2.5 rounded-lg bg-secondary px-2.5 py-2',
                          lost && 'opacity-45',
                          done && 'opacity-70'
                        )}
                        style={{ borderLeftWidth: 3, borderLeftColor: subject.color }}>
                        <Text
                          className={cn(
                            'flex-1 text-[13px] font-sans-bold text-foreground',
                            done && 'line-through'
                          )}>
                          {subject.short}
                        </Text>
                        <Text className="font-mono text-[11px] text-muted-foreground">
                          {hoursLabel(session.dur)}
                        </Text>
                        {done ? (
                          <Icon as={Check} size={13} className="text-primary" />
                        ) : lost ? (
                          <Icon as={X} size={13} className="text-destructive" />
                        ) : null}
                      </Pressable>
                    );
                  })}
                </View>
              )}
            </View>
          );
        })
      )}
    </ScrollView>
  );
}
