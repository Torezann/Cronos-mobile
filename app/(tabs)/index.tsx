import { Link, useRouter } from 'expo-router';
import { Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { EmptyState } from '@/components/empty-state';
import { ScreenHeader } from '@/components/screen-header';
import { SessionCard } from '@/components/session-card';
import { StreakCard } from '@/components/streak-card';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { usePendingSessions } from '@/hooks/usePendingSessions';
import { usePinnedGoal } from '@/hooks/useGoals';
import { useSessionMutations, useSessionsForDate, useSessionsForRange } from '@/hooks/useSessions';
import { useSubjects } from '@/hooks/useSubjects';
import { addDays, formatOverline, todayISO } from '@/lib/logic/dates';
import { computeStreaks, daysToExam } from '@/lib/logic/study';

export default function HojeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const today = todayISO();

  const { subjects } = useSubjects();
  const pinnedGoal = usePinnedGoal();
  const todayRows = useSessionsForDate(today);
  const historyRows = useSessionsForRange(addDays(today, -60), today);
  const pending = usePendingSessions();
  const { toggleSession } = useSessionMutations();

  const visibleRows = todayRows.filter((r) => r.session.status !== 'desistido');
  const done = visibleRows.filter((r) => r.session.status === 'concluido').length;
  const streaks = computeStreaks(
    historyRows.map((r) => r.session),
    today
  );
  const exam = pinnedGoal?.date ? daysToExam(pinnedGoal.date, today) : null;

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerStyle={{ paddingTop: insets.top + 12, paddingBottom: 32 }}
      contentContainerClassName="px-4 gap-4">
      <ScreenHeader
        overline={formatOverline(today)}
        title="Hoje"
        right={
          visibleRows.length > 0 ? (
            <Text className="font-mono text-xs text-muted-foreground">
              {done}/{visibleRows.length} sessões
            </Text>
          ) : undefined
        }
      />

      <StreakCard perfect={streaks.perfect} partial={streaks.partial} daysToExam={exam} />

      {subjects.length === 0 ? (
        <EmptyState
          emoji="🎯"
          title="Comece pela sua meta"
          description="Crie uma meta, cadastre as matérias e monte o cronograma semanal para as sessões aparecerem aqui."
          action={
            <Button onPress={() => router.push('/config')}>
              <Text>Configurar</Text>
            </Button>
          }
        />
      ) : visibleRows.length === 0 ? (
        <EmptyState
          emoji="🛋️"
          title="Folga hoje"
          description="Nenhuma sessão programada para hoje. Aproveite o descanso — ele não quebra sua ofensiva."
        />
      ) : (
        <View className="gap-2.5">
          {visibleRows.map((row) => (
            <SessionCard
              key={row.session.id}
              row={row}
              onToggle={() => toggleSession(row.session.id)}
            />
          ))}
        </View>
      )}

      {pending.count > 0 ? (
        <Link href="/pendencias" asChild>
          <Pressable className="flex-row items-center justify-between rounded-xl border border-dashed border-input bg-secondary px-4 py-3.5">
            <Text className="text-[13px] text-foreground">
              ⏳{' '}
              <Text className="text-[13px] font-sans-bold text-accent-foreground">
                {pending.count} atrasada{pending.count > 1 ? 's' : ''}
              </Text>{' '}
              · {pending.hoursLateLabel}
            </Text>
            <Text className="text-[13px] font-sans-semibold text-primary">Ver →</Text>
          </Pressable>
        </Link>
      ) : null}
    </ScrollView>
  );
}
