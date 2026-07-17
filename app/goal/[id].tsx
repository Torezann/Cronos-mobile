import { eq } from 'drizzle-orm';
import { useLiveQuery } from 'drizzle-orm/expo-sqlite';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ChevronLeft, Pencil, Plus, Trash2 } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ColorPicker } from '@/components/color-picker';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { FieldLabel } from '@/components/field-label';
import { PesoDots, PesoSelector } from '@/components/peso-dots';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Icon } from '@/components/ui/icon';
import { Input } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import { useSubjects } from '@/hooks/useSubjects';
import { useTemplates } from '@/hooks/useTemplates';
import { SUBJECT_COLORS } from '@/lib/colors';
import { db } from '@/lib/db/client';
import { goals, type Subject, type Template } from '@/lib/db/schema';
import { hoursLabel, weekdayLabelFromDow } from '@/lib/logic/dates';
import { cn } from '@/lib/utils';

const DURATIONS = [30, 45, 60, 90, 120];

function Chip({
  label,
  selected,
  onPress,
  color,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
  color?: string;
}) {
  return (
    <Pressable
      onPress={onPress}
      className={cn(
        'h-9 flex-row items-center justify-center rounded-full border px-3.5',
        selected ? 'border-primary bg-primary/15' : 'border-border'
      )}
      style={selected && color ? { borderColor: color } : undefined}>
      {color ? (
        <View className="mr-1.5 h-2.5 w-2.5 rounded" style={{ backgroundColor: color }} />
      ) : null}
      <Text
        className={cn(
          'text-xs font-sans-semibold',
          selected ? 'text-foreground' : 'text-muted-foreground'
        )}>
        {label}
      </Text>
    </Pressable>
  );
}

export default function GoalDetailScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams<{ id: string }>();
  const goalId = Number(params.id);

  const { data: goalRows } = useLiveQuery(
    db.select().from(goals).where(eq(goals.id, goalId)).limit(1),
    [goalId]
  );
  const goal = goalRows?.[0];

  const { subjects, createSubject, updateSubject, deleteSubject } = useSubjects(goalId);
  const { rows: templateRows, createTemplate, updateTemplate, deleteTemplate } =
    useTemplates(goalId);

  // Form de matéria
  const [subjectFormOpen, setSubjectFormOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [subjName, setSubjName] = useState('');
  const [subjColor, setSubjColor] = useState<string>(SUBJECT_COLORS[0]);
  const [subjPeso, setSubjPeso] = useState(3);
  const [subjectToDelete, setSubjectToDelete] = useState<Subject | null>(null);

  // Form de cronograma
  const [templateFormOpen, setTemplateFormOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [tplDow, setTplDow] = useState(1);
  const [tplSubjectId, setTplSubjectId] = useState<number | null>(null);
  const [tplDur, setTplDur] = useState(60);
  const [templateToDelete, setTemplateToDelete] = useState<Template | null>(null);

  const resetSubjectForm = () => {
    setEditingSubject(null);
    setSubjName('');
    setSubjColor(SUBJECT_COLORS[0]);
    setSubjPeso(3);
  };

  const closeSubjectForm = () => {
    setSubjectFormOpen(false);
    resetSubjectForm();
  };

  const submitSubject = async () => {
    if (!subjName.trim()) return;
    const input = { name: subjName, color: subjColor, peso: subjPeso };
    if (editingSubject) await updateSubject(editingSubject.id, input);
    else await createSubject(input);
    closeSubjectForm();
  };

  const resetTemplateForm = () => {
    setEditingTemplate(null);
    setTplDow(1);
    setTplSubjectId(null);
    setTplDur(60);
  };

  const closeTemplateForm = () => {
    setTemplateFormOpen(false);
    resetTemplateForm();
  };

  const submitTemplate = async () => {
    if (tplSubjectId === null) return;
    const input = { subjectId: tplSubjectId, dow: tplDow, dur: tplDur };
    if (editingTemplate) await updateTemplate(editingTemplate.id, input);
    else await createTemplate(input);
    closeTemplateForm();
  };

  if (!goal) return <View className="flex-1 bg-background" />;

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerStyle={{ paddingTop: insets.top + 8, paddingBottom: 40 }}
      contentContainerClassName="px-4">
      <Pressable
        onPress={() => router.back()}
        className="mb-2 h-11 flex-row items-center gap-1 self-start">
        <Icon as={ChevronLeft} size={16} className="text-muted-foreground" />
        <Text className="text-[13px] text-muted-foreground">Metas</Text>
      </Pressable>

      <Text className="font-sans-extrabold text-2xl tracking-tight text-foreground">
        {goal.name} · matérias
      </Text>
      <Text className="mb-4 mt-0.5 text-[13px] text-muted-foreground">
        Nome, cor e peso alimentam o cronograma inteiro.
      </Text>

      <Button
        className="mb-4 flex-row gap-1.5"
        onPress={() => {
          resetSubjectForm();
          setSubjectFormOpen(true);
        }}>
        <Icon as={Plus} size={16} className="text-primary-foreground" />
        <Text>Nova matéria</Text>
      </Button>

      {subjects.length === 0 ? (
        <Card className="mb-6 items-center rounded-2xl px-5 py-7">
          <Text className="mb-1 text-2xl">📚</Text>
          <Text className="font-sans-bold text-[15px] text-foreground">Nenhuma matéria</Text>
          <Text className="mt-1 text-center text-xs text-muted-foreground">
            Adicione as matérias do edital tocando em “Nova matéria”.
          </Text>
        </Card>
      ) : (
        <View className="mb-6 gap-2.5">
          {subjects.map((s) => (
            <View
              key={s.id}
              className="min-h-14 flex-row items-center gap-3 rounded-xl border border-border bg-card px-3.5 py-3">
              <View className="h-3.5 w-3.5 rounded" style={{ backgroundColor: s.color }} />
              <View className="min-w-0 flex-1">
                <Text className="font-sans-semibold text-sm text-foreground" numberOfLines={1}>
                  {s.name}
                </Text>
                <View className="mt-1 flex-row items-center gap-1.5">
                  <Text className="font-mono text-[10px] text-muted-foreground">
                    peso {s.peso}
                  </Text>
                  <PesoDots peso={s.peso} color={s.color} />
                </View>
              </View>
              <Pressable
                onPress={() => {
                  setEditingSubject(s);
                  setSubjName(s.name);
                  setSubjColor(s.color);
                  setSubjPeso(s.peso);
                  setSubjectFormOpen(true);
                }}
                className="h-10 w-10 items-center justify-center rounded-lg border border-border"
                accessibilityLabel={`Editar ${s.name}`}>
                <Icon as={Pencil} size={13} className="text-muted-foreground" />
              </Pressable>
              <Pressable
                onPress={() => setSubjectToDelete(s)}
                className="h-10 w-10 items-center justify-center rounded-lg border border-border"
                accessibilityLabel={`Excluir ${s.name}`}>
                <Icon as={Trash2} size={13} className="text-muted-foreground" />
              </Pressable>
            </View>
          ))}
        </View>
      )}

      <Dialog open={subjectFormOpen} onOpenChange={(open) => !open && closeSubjectForm()}>
        <DialogContent className="w-full max-w-96 rounded-2xl">
          <DialogTitle>{editingSubject ? 'Editar matéria' : 'Nova matéria'}</DialogTitle>
          <View>
            <FieldLabel>NOME</FieldLabel>
            <Input
              className="mb-3 mt-1.5"
              value={subjName}
              onChangeText={setSubjName}
              placeholder="Ex.: Direito Penal"
            />
            <FieldLabel>COR</FieldLabel>
            <View className="mb-3 mt-2">
              <ColorPicker value={subjColor} onChange={setSubjColor} />
            </View>
            <FieldLabel>{`PESO NO EDITAL — ${subjPeso}`}</FieldLabel>
            <View className="mb-4 mt-2">
              <PesoSelector value={subjPeso} onChange={setSubjPeso} />
            </View>
            <Button onPress={submitSubject} disabled={!subjName.trim()}>
              <Text>{editingSubject ? 'Salvar alterações' : 'Adicionar matéria'}</Text>
            </Button>
          </View>
        </DialogContent>
      </Dialog>

      <Text className="font-sans-extrabold text-xl tracking-tight text-foreground">
        Cronograma semanal
      </Text>
      <Text className="mb-4 mt-0.5 text-[13px] text-muted-foreground">
        Cada horário vira uma sessão de estudo gerada automaticamente a cada semana.
      </Text>

      {subjects.length > 0 ? (
        <Button
          className="mb-4 flex-row gap-1.5"
          onPress={() => {
            resetTemplateForm();
            setTemplateFormOpen(true);
          }}>
          <Icon as={Plus} size={16} className="text-primary-foreground" />
          <Text>Novo horário</Text>
        </Button>
      ) : null}

      {templateRows.length === 0 ? (
        <Card className="mb-4 items-center rounded-2xl px-5 py-7">
          <Text className="mb-1 text-2xl">🗓️</Text>
          <Text className="font-sans-bold text-[15px] text-foreground">Sem horários ainda</Text>
          <Text className="mt-1 text-center text-xs text-muted-foreground">
            {subjects.length === 0
              ? 'Crie uma matéria primeiro, depois monte o cronograma.'
              : 'Monte seu cronograma tocando em “Novo horário”.'}
          </Text>
        </Card>
      ) : (
        <View className="mb-4 gap-2.5">
          {[1, 2, 3, 4, 5, 6, 7].map((dow) => {
            const dayRows = templateRows.filter((r) => r.template.dow === dow);
            if (dayRows.length === 0) return null;
            return (
              <View key={dow} className="rounded-xl border border-border bg-card px-3.5 py-3">
                <Text className="mb-2 font-mono text-[11px] tracking-[1.5px] text-muted-foreground">
                  {weekdayLabelFromDow(dow)}
                </Text>
                <View className="gap-1.5">
                  {dayRows.map(({ template, subject }) => (
                    <View key={template.id} className="min-h-11 flex-row items-center gap-2.5">
                      <View
                        className="h-2.5 w-2.5 rounded"
                        style={{ backgroundColor: subject.color }}
                      />
                      <Text className="flex-1 text-[13px] font-sans-semibold text-foreground">
                        {subject.short}
                      </Text>
                      <Text className="font-mono text-[11px] text-muted-foreground">
                        {hoursLabel(template.dur)}
                      </Text>
                      <Pressable
                        onPress={() => {
                          setEditingTemplate(template);
                          setTplDow(template.dow);
                          setTplSubjectId(template.subjectId);
                          setTplDur(template.dur);
                          setTemplateFormOpen(true);
                        }}
                        className="h-9 w-9 items-center justify-center rounded-lg border border-border"
                        accessibilityLabel="Editar horário">
                        <Icon as={Pencil} size={12} className="text-muted-foreground" />
                      </Pressable>
                      <Pressable
                        onPress={() => setTemplateToDelete(template)}
                        className="h-9 w-9 items-center justify-center rounded-lg border border-border"
                        accessibilityLabel="Excluir horário">
                        <Icon as={Trash2} size={12} className="text-muted-foreground" />
                      </Pressable>
                    </View>
                  ))}
                </View>
              </View>
            );
          })}
        </View>
      )}

      <Dialog open={templateFormOpen} onOpenChange={(open) => !open && closeTemplateForm()}>
        <DialogContent className="w-full max-w-96 rounded-2xl">
          <DialogTitle>{editingTemplate ? 'Editar horário' : 'Novo horário'}</DialogTitle>
          <View>
            <FieldLabel>DIA DA SEMANA</FieldLabel>
            <View className="mb-3 mt-2 flex-row flex-wrap gap-1.5">
              {[1, 2, 3, 4, 5, 6, 7].map((dow) => (
                <Chip
                  key={dow}
                  label={weekdayLabelFromDow(dow)}
                  selected={tplDow === dow}
                  onPress={() => setTplDow(dow)}
                />
              ))}
            </View>
            <FieldLabel>MATÉRIA</FieldLabel>
            <View className="mb-3 mt-2 flex-row flex-wrap gap-1.5">
              {subjects.map((s) => (
                <Chip
                  key={s.id}
                  label={s.short}
                  color={s.color}
                  selected={tplSubjectId === s.id}
                  onPress={() => setTplSubjectId(s.id)}
                />
              ))}
            </View>
            <FieldLabel>DURAÇÃO</FieldLabel>
            <View className="mb-4 mt-2 flex-row flex-wrap gap-1.5">
              {DURATIONS.map((d) => (
                <Chip
                  key={d}
                  label={hoursLabel(d)}
                  selected={tplDur === d}
                  onPress={() => setTplDur(d)}
                />
              ))}
            </View>
            <Button onPress={submitTemplate} disabled={tplSubjectId === null}>
              <Text>{editingTemplate ? 'Salvar alterações' : 'Adicionar ao cronograma'}</Text>
            </Button>
          </View>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={subjectToDelete !== null}
        onOpenChange={(open) => !open && setSubjectToDelete(null)}
        title={`Excluir "${subjectToDelete?.name}"?`}
        description="Os horários e o histórico de sessões desta matéria serão removidos."
        onConfirm={() => subjectToDelete && deleteSubject(subjectToDelete.id)}
      />
      <ConfirmDialog
        open={templateToDelete !== null}
        onOpenChange={(open) => !open && setTemplateToDelete(null)}
        title="Excluir horário?"
        description="As sessões futuras ainda pendentes deste horário serão removidas. O histórico é mantido."
        onConfirm={() => templateToDelete && deleteTemplate(templateToDelete.id)}
      />
    </ScrollView>
  );
}
