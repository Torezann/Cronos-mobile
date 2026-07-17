import { useLocalSearchParams } from 'expo-router';
import { Minus, Plus } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { EmptyState } from '@/components/empty-state';
import { FieldLabel } from '@/components/field-label';
import { ScreenHeader } from '@/components/screen-header';
import { Card } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { useSessionsForSubject } from '@/hooks/useSessions';
import { useSubjects } from '@/hooks/useSubjects';
import { STATUS_COLORS } from '@/lib/colors';
import type { Session } from '@/lib/db/schema';
import { formatDayShort, hoursLabel, todayISO } from '@/lib/logic/dates';
import { cn } from '@/lib/utils';

function statusInfo(session: Session, today: string): { label: string; color: string } {
  if (session.status === 'concluido') return { label: 'feita', color: STATUS_COLORS.concluido };
  if (session.status === 'desistido')
    return { label: 'desistida', color: STATUS_COLORS.desistido };
  if (session.date < today) return { label: 'perdida', color: STATUS_COLORS.perdido };
  return { label: 'pendente', color: STATUS_COLORS.pendente };
}

export default function MateriasScreen() {
  const insets = useSafeAreaInsets();
  const today = todayISO();
  const params = useLocalSearchParams<{ subjectId?: string }>();

  const { subjects, adjustQuestions } = useSubjects();
  const paramId = params.subjectId ? Number(params.subjectId) : null;
  const [selection, setSelection] = useState<{ paramId: number | null; id: number | null }>({
    paramId,
    id: paramId,
  });
  // Ajuste de estado durante o render: reseleciona quando o param de rota muda.
  if (selection.paramId !== paramId) {
    setSelection({ paramId, id: paramId ?? selection.id });
  }
  const selectedId = selection.id;
  const setSelectedId = (id: number) => setSelection((prev) => ({ ...prev, id }));

  const selected =
    subjects.find((s) => s.id === selectedId) ?? (subjects.length > 0 ? subjects[0] : null);
  const sessions = useSessionsForSubject(selected?.id ?? null);

  const pastSessions = sessions.filter((s) => s.date <= today);
  const doneSessions = pastSessions.filter((s) => s.status === 'concluido');
  const skipped = pastSessions.filter(
    (s) => s.status === 'desistido' || (s.status === 'pendente' && s.date < today)
  );
  const totalMin = doneSessions.reduce((a, s) => a + s.dur, 0);
  const history = [...pastSessions].reverse().slice(0, 7);

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerStyle={{ paddingTop: insets.top + 12, paddingBottom: 32 }}
      contentContainerClassName="px-4 gap-4">
      <ScreenHeader title="Matérias" />

      {subjects.length === 0 || !selected ? (
        <EmptyState
          emoji="📚"
          title="Nenhuma matéria"
          description="Cadastre as matérias da sua meta em Config para acompanhar cada uma aqui."
        />
      ) : (
        <>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="-mx-4">
            <View className="flex-row gap-2 px-4">
              {subjects.map((s) => {
                const active = s.id === selected.id;
                return (
                  <Pressable
                    key={s.id}
                    onPress={() => setSelectedId(s.id)}
                    className={cn(
                      'h-10 items-center justify-center rounded-full border px-3.5',
                      !active && 'border-border'
                    )}
                    style={
                      active ? { backgroundColor: s.color, borderColor: s.color } : undefined
                    }>
                    <Text
                      className={cn('text-[12.5px] font-sans-semibold', !active && 'text-muted-foreground')}
                      style={active ? { color: '#141311' } : undefined}>
                      {s.short}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </ScrollView>

          <View className="flex-row items-center gap-3">
            <View className="h-[18px] w-[18px] rounded-md" style={{ backgroundColor: selected.color }} />
            <Text className="flex-1 font-sans-extrabold text-xl tracking-tight text-foreground">
              {selected.name}
            </Text>
            <Text className="font-mono text-[11px] text-muted-foreground">
              peso {selected.peso}
            </Text>
          </View>

          <View className="flex-row flex-wrap gap-2.5">
            {[
              { label: 'TEMPO TOTAL', value: hoursLabel(totalMin), sub: 'estudado', color: selected.color },
              { label: 'SESSÕES', value: String(doneSessions.length), sub: 'feitas' },
              {
                label: 'PULADAS',
                value: String(skipped.length),
                sub: 'perdidas',
                color: skipped.length > 0 ? STATUS_COLORS.perdido : STATUS_COLORS.concluido,
              },
              { label: 'QUESTÕES', value: String(selected.questions), sub: 'respondidas' },
            ].map((stat) => (
              <Card key={stat.label} className="w-[48%] flex-grow rounded-2xl p-3.5">
                <FieldLabel>{stat.label}</FieldLabel>
                <Text
                  className="mt-0.5 font-sans-extrabold text-2xl text-foreground"
                  style={stat.color ? { color: stat.color } : undefined}>
                  {stat.value}
                </Text>
                <Text className="text-[11px] text-muted-foreground">{stat.sub}</Text>
              </Card>
            ))}
          </View>

          <Card className="flex-row items-center gap-3.5 rounded-2xl p-4">
            <View className="flex-1">
              <Text className="font-sans-bold text-sm text-foreground">Questões</Text>
              <Text className="text-[11.5px] text-muted-foreground">respondidas</Text>
            </View>
            <Pressable
              onPress={() => adjustQuestions(selected.id, -1)}
              className="h-11 w-11 items-center justify-center rounded-xl border border-border"
              accessibilityLabel="Diminuir questões">
              <Icon as={Minus} size={18} className="text-muted-foreground" />
            </Pressable>
            <Text
              className="min-w-16 text-center font-sans-extrabold text-[26px]"
              style={{ color: selected.color }}>
              {selected.questions}
            </Text>
            <Pressable
              onPress={() => adjustQuestions(selected.id, 1)}
              className="h-11 w-11 items-center justify-center rounded-xl border border-border"
              accessibilityLabel="Aumentar questões">
              <Icon as={Plus} size={18} className="text-muted-foreground" />
            </Pressable>
          </Card>

          <Card className="rounded-2xl p-4">
            <Text className="mb-2.5 font-sans-bold text-sm text-foreground">Histórico</Text>
            {history.length === 0 ? (
              <Text className="text-xs text-muted-foreground">
                Nenhuma sessão registrada ainda.
              </Text>
            ) : (
              history.map((s, i) => {
                const st = statusInfo(s, today);
                return (
                  <View
                    key={s.id}
                    className={cn(
                      'flex-row items-center gap-2.5 py-2.5',
                      i < history.length - 1 && 'border-b border-secondary'
                    )}>
                    <Text className="w-16 font-mono text-[11px] text-muted-foreground">
                      {formatDayShort(s.date)}
                    </Text>
                    <Text className="w-[70px] text-xs font-sans-semibold" style={{ color: st.color }}>
                      {st.label}
                    </Text>
                    <Text className="flex-1 text-[11.5px] text-foreground/80" numberOfLines={1}>
                      {s.note || '—'}
                    </Text>
                  </View>
                );
              })
            )}
          </Card>
        </>
      )}
    </ScrollView>
  );
}
