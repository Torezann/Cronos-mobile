import { useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { EmptyState } from '@/components/empty-state';
import { ScreenHeader } from '@/components/screen-header';
import { Text } from '@/components/ui/text';
import { usePendingSessions } from '@/hooks/usePendingSessions';
import { useSessionMutations } from '@/hooks/useSessions';
import type { Session } from '@/lib/db/schema';
import { diffDays, formatDayShort, hoursLabel, todayISO } from '@/lib/logic/dates';

export default function PendenciasScreen() {
  const insets = useSafeAreaInsets();
  const today = todayISO();
  const { rows, count, hoursLateLabel } = usePendingSessions();
  const { rescheduleToToday, giveUp } = useSessionMutations();
  const [toGiveUp, setToGiveUp] = useState<Session | null>(null);

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerStyle={{ paddingTop: insets.top + 12, paddingBottom: 32 }}
      contentContainerClassName="px-4 gap-4">
      <ScreenHeader
        title="Pendências"
        subtitle={count > 0 ? `${hoursLateLabel} de atraso acumulado` : undefined}
      />

      {count === 0 ? (
        <EmptyState emoji="✨" title="Nada atrasado" description="Tudo em dia." />
      ) : (
        <View className="gap-2.5">
          {rows.map(({ session, subject }) => (
            <View
              key={session.id}
              className="rounded-2xl border border-border bg-card px-4 py-3.5">
              <View className="flex-row items-center gap-3">
                <View
                  className="w-1 self-stretch rounded-full"
                  style={{ backgroundColor: subject.color }}
                />
                <View className="min-w-0 flex-1">
                  <Text className="font-sans-bold text-sm text-foreground">{subject.name}</Text>
                  <Text className="mt-0.5 text-xs text-muted-foreground">
                    {formatDayShort(session.date)} · {hoursLabel(session.dur)} ·{' '}
                    <Text className="text-xs text-destructive">
                      {diffDays(session.date, today)}d atraso
                    </Text>
                  </Text>
                </View>
              </View>
              <View className="mt-3 flex-row gap-2">
                <Pressable
                  onPress={() => rescheduleToToday(session.id)}
                  className="h-11 flex-1 items-center justify-center rounded-xl bg-primary">
                  <Text className="text-[13px] font-sans-bold text-primary-foreground">
                    Reagendar p/ hoje
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => setToGiveUp(session)}
                  className="h-11 items-center justify-center rounded-xl border border-border px-3.5">
                  <Text className="text-[13px] text-muted-foreground">Desistir</Text>
                </Pressable>
              </View>
            </View>
          ))}
        </View>
      )}

      <ConfirmDialog
        open={toGiveUp !== null}
        onOpenChange={(open) => !open && setToGiveUp(null)}
        title="Desistir desta sessão?"
        description="Ela sai das pendências e conta como desistida no histórico da matéria."
        confirmLabel="Desistir"
        onConfirm={() => toGiveUp && giveUp(toGiveUp.id)}
      />
    </ScrollView>
  );
}
