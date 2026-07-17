import { useRouter } from 'expo-router';
import { Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { EmptyState } from '@/components/empty-state';
import { Heatmap14d } from '@/components/heatmap-14d';
import { HoursBarChart } from '@/components/hours-bar-chart';
import { ScreenHeader } from '@/components/screen-header';
import { StreakCard } from '@/components/streak-card';
import { Card } from '@/components/ui/card';
import { FieldLabel } from '@/components/field-label';
import { Text } from '@/components/ui/text';
import { usePendingSessions } from '@/hooks/usePendingSessions';
import { usePinnedGoal } from '@/hooks/useGoals';
import { useSessionsForRange } from '@/hooks/useSessions';
import { useSubjects } from '@/hooks/useSubjects';
import { addDays, diffDays, formatShortDate, todayISO } from '@/lib/logic/dates';
import { aggregateHoursBySubject, computeStreaks, daysToExam } from '@/lib/logic/study';
import { cn } from '@/lib/utils';

export default function DashboardScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const today = todayISO();

  const { subjects } = useSubjects();
  const pinnedGoal = usePinnedGoal();
  const rows = useSessionsForRange(addDays(today, -60), today);
  const pending = usePendingSessions();

  const sessionList = rows.map((r) => r.session);
  const streaks = computeStreaks(sessionList, today);
  const last30 = sessionList.filter((s) => s.date >= addDays(today, -30));
  const hours = aggregateHoursBySubject(last30, subjects);

  const exam = pinnedGoal?.date ? daysToExam(pinnedGoal.date, today) : null;
  const examProgress =
    pinnedGoal?.date && exam !== null
      ? Math.min(
          100,
          Math.max(
            0,
            Math.round(
              (diffDays(pinnedGoal.createdAt.toISOString().slice(0, 10), today) /
                Math.max(1, diffDays(pinnedGoal.createdAt.toISOString().slice(0, 10), pinnedGoal.date))) *
                100
            )
          )
        )
      : 0;

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerStyle={{ paddingTop: insets.top + 12, paddingBottom: 32 }}
      contentContainerClassName="px-4 gap-3">
      <ScreenHeader title="Dashboard" />

      {subjects.length === 0 ? (
        <EmptyState
          emoji="📊"
          title="Sem dados ainda"
          description="Crie sua meta e cronograma em Config; os gráficos aparecem conforme você estuda."
        />
      ) : (
        <>
          <StreakCard big perfect={streaks.perfect} partial={streaks.partial} daysToExam={null} />

          <View className="flex-row gap-3">
            <Card className="flex-1 rounded-2xl p-4">
              <FieldLabel>DIAS PARA A META</FieldLabel>
              {pinnedGoal?.date && exam !== null ? (
                <>
                  <Text className="mt-0.5 font-sans-extrabold text-3xl text-foreground">
                    {exam}
                  </Text>
                  <Text className="text-[11.5px] text-muted-foreground">
                    dias · {formatShortDate(pinnedGoal.date)}
                  </Text>
                  <View className="mt-2.5 h-[5px] overflow-hidden rounded-full bg-secondary">
                    <View
                      className="h-full rounded-full bg-primary"
                      style={{ width: `${examProgress}%` }}
                    />
                  </View>
                </>
              ) : (
                <Text className="mt-1.5 text-xs text-muted-foreground">
                  Fixe uma meta com data em Config para ver o countdown.
                </Text>
              )}
            </Card>

            <Card className="flex-1 rounded-2xl p-0">
              <Pressable className="p-4" onPress={() => router.push('/pendencias')}>
                <FieldLabel>PENDÊNCIAS</FieldLabel>
                <Text
                  className={cn(
                    'mt-0.5 font-sans-extrabold text-3xl',
                    pending.count > 0 ? 'text-accent-foreground' : 'text-foreground'
                  )}>
                  {pending.count}
                </Text>
                <Text className="text-[11.5px] text-muted-foreground">
                  {pending.count > 0 ? `${pending.hoursLateLabel} de atraso` : 'tudo em dia'}
                </Text>
                {pending.count > 0 ? (
                  <Text className="mt-2 text-xs font-sans-semibold text-primary">Resolver →</Text>
                ) : null}
              </Pressable>
            </Card>
          </View>

          <Card className="rounded-2xl p-4">
            <Text className="mb-3.5 font-sans-bold text-sm text-foreground">
              Horas por matéria · últimos 30 dias
            </Text>
            <HoursBarChart
              data={hours}
              onPressRow={(subjectId) =>
                router.push({ pathname: '/materias', params: { subjectId: String(subjectId) } })
              }
            />
          </Card>

          <Card className="rounded-2xl p-4">
            <Text className="mb-3.5 font-sans-bold text-sm text-foreground">Últimos 14 dias</Text>
            <Heatmap14d sessions={sessionList} today={today} />
          </Card>
        </>
      )}
    </ScrollView>
  );
}
