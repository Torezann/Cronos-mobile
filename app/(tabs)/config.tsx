import DateTimePicker from '@react-native-community/datetimepicker';
import { useRouter } from 'expo-router';
import { CalendarDays, Moon, Pencil, Pin, Plus, Sun, Target, Trash2 } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import { useState } from 'react';
import { Modal, Platform, Pressable, ScrollView, Switch, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { FieldLabel } from '@/components/field-label';
import { ScreenHeader } from '@/components/screen-header';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Icon } from '@/components/ui/icon';
import { Input } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import { useGoals } from '@/hooks/useGoals';
import { db } from '@/lib/db/client';
import { appMeta, type Goal } from '@/lib/db/schema';
import { formatDateBR, formatShortDate, parseDateInput } from '@/lib/logic/dates';
import { THEME } from '@/lib/theme';
import { cn } from '@/lib/utils';

/** Máscara DD/MM/AAAA: mantém só dígitos e insere as barras. */
function maskDate(text: string): string {
  const digits = text.replace(/\D/g, '').slice(0, 8);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
}

export default function ConfigScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { colorScheme, setColorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = isDark ? THEME.dark : THEME.light;

  const toggleTheme = async () => {
    const next = isDark ? 'light' : 'dark';
    setColorScheme(next);
    await db
      .insert(appMeta)
      .values({ key: 'theme', value: next })
      .onConflictDoUpdate({ target: appMeta.key, set: { value: next } });
  };
  const { goals, subjects, createGoal, updateGoal, deleteGoal, pinGoal, setGoalActive } =
    useGoals();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Goal | null>(null);
  const [name, setName] = useState('');
  const [date, setDate] = useState('');
  const [desc, setDesc] = useState('');
  const [dateError, setDateError] = useState(false);
  const [showPicker, setShowPicker] = useState(false);
  const [toDelete, setToDelete] = useState<Goal | null>(null);

  // Valor inicial do calendário: a data já digitada, ou hoje.
  const pickerValue = (() => {
    const iso = parseDateInput(date);
    return iso ? new Date(`${iso}T12:00:00`) : new Date();
  })();

  const resetForm = () => {
    setEditing(null);
    setName('');
    setDate('');
    setDesc('');
    setDateError(false);
  };

  const closeForm = () => {
    setFormOpen(false);
    resetForm();
  };

  const startCreate = () => {
    resetForm();
    setFormOpen(true);
  };

  const startEdit = (goal: Goal) => {
    setEditing(goal);
    setName(goal.name);
    setDate(goal.date ? formatDateBR(goal.date) : '');
    setDesc(goal.description ?? '');
    setDateError(false);
    setFormOpen(true);
  };

  const submit = async () => {
    if (!name.trim()) return;
    const iso = parseDateInput(date);
    if (date.trim() && !iso) {
      setDateError(true);
      return;
    }
    const input = { name, date: iso, description: desc };
    if (editing) await updateGoal(editing.id, input);
    else await createGoal(input);
    closeForm();
  };

  return (
    <View className="flex-1 bg-background">
    <ScrollView
      className="flex-1"
      contentContainerStyle={{ paddingTop: insets.top + 12, paddingBottom: 32 }}
      contentContainerClassName="px-4 gap-4">
      <ScreenHeader title="Suas metas" subtitle="Toque em uma meta para ver as matérias dela." />

      <Button className="flex-row gap-1.5" onPress={startCreate}>
        <Icon as={Plus} size={16} className="text-primary-foreground" />
        <Text>Nova meta</Text>
      </Button>

      {goals.length === 0 ? (
        <Card className="items-center rounded-2xl px-5 py-8">
          <Text className="mb-2 text-[28px]">🎯</Text>
          <Text className="font-sans-bold text-base text-foreground">Nenhuma meta ainda</Text>
          <Text className="mt-1 text-center text-[12.5px] text-muted-foreground">
            Toque em “Nova meta” — um concurso, uma prova, um objetivo de estudo.
          </Text>
        </Card>
      ) : (
        <View className="gap-2.5">
          {goals.map((goal) => {
            const goalSubjects = subjects.filter((s) => s.goalId === goal.id);
            const pinned = goal.pinned === 1;
            const active = goal.active === 1;
            const subParts = [
              goal.description,
              goal.date ? `meta ${formatShortDate(goal.date)}` : null,
              `${goalSubjects.length} matérias`,
            ].filter(Boolean);
            return (
              <Pressable
                key={goal.id}
                onPress={() => router.push(`/goal/${goal.id}`)}
                className={cn(
                  'rounded-2xl border border-border bg-card px-4 py-3.5',
                  !active && 'opacity-55'
                )}>
                <View className="flex-row items-center gap-3">
                  <View className="h-10 w-10 items-center justify-center rounded-xl bg-accent">
                    <Icon as={Target} size={18} className="text-accent-foreground" />
                  </View>
                  <View className="min-w-0 flex-1">
                    <Text className="font-sans-bold text-[15px] text-foreground">{goal.name}</Text>
                    <Text className="mt-0.5 text-xs text-muted-foreground" numberOfLines={1}>
                      {subParts.join(' · ')}
                    </Text>
                    <View className="mt-1 flex-row gap-1">
                      {goalSubjects.slice(0, 6).map((s) => (
                        <View
                          key={s.id}
                          className="h-2.5 w-2.5 rounded"
                          style={{ backgroundColor: s.color }}
                        />
                      ))}
                    </View>
                  </View>
                  <Switch
                    value={active}
                    onValueChange={(v) => setGoalActive(goal.id, v)}
                    trackColor={{ false: theme.border, true: theme.primary }}
                    thumbColor="#ffffff"
                    accessibilityLabel={`${active ? 'Desativar' : 'Ativar'} ${goal.name}`}
                  />
                </View>
                <View className="mt-3 flex-row gap-2">
                  <Pressable
                    onPress={() => pinGoal(goal.id)}
                    className={cn(
                      'h-10 flex-1 flex-row items-center justify-center gap-1.5 rounded-lg border',
                      pinned ? 'border-accent bg-accent' : 'border-border'
                    )}>
                    <Icon
                      as={Pin}
                      size={13}
                      className={pinned ? 'text-accent-foreground' : 'text-muted-foreground'}
                    />
                    <Text
                      className={cn(
                        'text-xs font-sans-semibold',
                        pinned ? 'text-accent-foreground' : 'text-muted-foreground'
                      )}>
                      {pinned ? 'Fixada' : 'Fixar'}
                    </Text>
                  </Pressable>
                  <Pressable
                    onPress={() => startEdit(goal)}
                    className="h-10 w-11 items-center justify-center rounded-lg border border-border"
                    accessibilityLabel={`Editar ${goal.name}`}>
                    <Icon as={Pencil} size={14} className="text-muted-foreground" />
                  </Pressable>
                  <Pressable
                    onPress={() => setToDelete(goal)}
                    className="h-10 w-11 items-center justify-center rounded-lg border border-border"
                    accessibilityLabel={`Excluir ${goal.name}`}>
                    <Icon as={Trash2} size={14} className="text-muted-foreground" />
                  </Pressable>
                </View>
              </Pressable>
            );
          })}
        </View>
      )}

      <Dialog open={formOpen} onOpenChange={(open) => !open && closeForm()}>
        <DialogContent className="w-full max-w-96 rounded-2xl">
          <DialogTitle>{editing ? 'Editar meta' : 'Nova meta'}</DialogTitle>
          <View>
            <FieldLabel>NOME</FieldLabel>
            <Input
              className="mb-3 mt-1.5"
              value={name}
              onChangeText={setName}
              placeholder="Ex.: OAB 2027"
            />
            <FieldLabel>DATA DA META (OPCIONAL)</FieldLabel>
            <View className="mb-1 mt-1.5 flex-row items-center gap-2">
              <Input
                className={cn('flex-1', dateError && 'border-destructive')}
                value={date}
                onChangeText={(t) => {
                  setDate(maskDate(t));
                  setDateError(false);
                }}
                placeholder="DD/MM/AAAA"
                keyboardType="number-pad"
                maxLength={10}
              />
              <Pressable
                onPress={() => setShowPicker((s) => !s)}
                className={cn(
                  'h-10 w-11 items-center justify-center rounded-lg border',
                  showPicker ? 'border-primary bg-primary/15' : 'border-border'
                )}
                accessibilityLabel="Abrir calendário">
                <Icon
                  as={CalendarDays}
                  size={16}
                  className={showPicker ? 'text-primary' : 'text-muted-foreground'}
                />
              </Pressable>
            </View>
            {showPicker && Platform.OS === 'android' ? (
              // No Android o próprio componente já abre como diálogo nativo, acima de tudo.
              <DateTimePicker
                value={pickerValue}
                mode="date"
                display="default"
                onChange={(event, selected) => {
                  setShowPicker(false);
                  if (event.type === 'set' && selected) {
                    const dd = String(selected.getDate()).padStart(2, '0');
                    const mm = String(selected.getMonth() + 1).padStart(2, '0');
                    setDate(`${dd}/${mm}/${selected.getFullYear()}`);
                    setDateError(false);
                  }
                }}
              />
            ) : null}
            {Platform.OS !== 'android' ? (
              // No iOS o calendário inline abre num Modal nativo, na frente do dialog.
              <Modal
                visible={showPicker}
                transparent
                animationType="fade"
                onRequestClose={() => setShowPicker(false)}>
                <Pressable
                  className="flex-1 items-center justify-center bg-black/70 p-5"
                  onPress={() => setShowPicker(false)}>
                  <Pressable
                    onPress={(e) => e.stopPropagation()}
                    className="w-full max-w-96 rounded-2xl border border-border bg-card p-2">
                    <DateTimePicker
                      value={pickerValue}
                      mode="date"
                      display="inline"
                      themeVariant={isDark ? 'dark' : 'light'}
                      accentColor={theme.primary}
                      onChange={(event, selected) => {
                        setShowPicker(false);
                        if (event.type === 'set' && selected) {
                          const dd = String(selected.getDate()).padStart(2, '0');
                          const mm = String(selected.getMonth() + 1).padStart(2, '0');
                          setDate(`${dd}/${mm}/${selected.getFullYear()}`);
                          setDateError(false);
                        }
                      }}
                    />
                  </Pressable>
                </Pressable>
              </Modal>
            ) : null}
            {dateError ? (
              <Text className="mb-2 text-xs text-destructive">Data inválida. Use DD/MM/AAAA.</Text>
            ) : (
              <View className="mb-2" />
            )}
            <FieldLabel>DESCRIÇÃO</FieldLabel>
            <Input
              className="mb-4 mt-1.5"
              value={desc}
              onChangeText={setDesc}
              placeholder="Ex.: Exame da ordem, 2ª fase"
            />
            <Button onPress={submit} disabled={!name.trim()}>
              <Text>{editing ? 'Salvar alterações' : 'Criar meta'}</Text>
            </Button>
          </View>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={toDelete !== null}
        onOpenChange={(open) => !open && setToDelete(null)}
        title={`Excluir "${toDelete?.name}"?`}
        description="As matérias, o cronograma e o histórico de sessões desta meta serão removidos. Essa ação não pode ser desfeita."
        onConfirm={() => toDelete && deleteGoal(toDelete.id)}
      />
    </ScrollView>

      <View className="flex-row items-center justify-between border-t border-border bg-background px-4 py-2.5">
        <View className="flex-row items-center gap-2">
          <Icon as={isDark ? Moon : Sun} size={15} className="text-muted-foreground" />
          <Text className="text-sm text-foreground">Tema {isDark ? 'escuro' : 'claro'}</Text>
        </View>
        <Switch
          value={isDark}
          onValueChange={toggleTheme}
          trackColor={{ false: theme.border, true: theme.primary }}
          thumbColor="#ffffff"
          accessibilityLabel="Alternar tema escuro"
        />
      </View>
    </View>
  );
}
