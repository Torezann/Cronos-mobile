# Cronos

Tracker de estudos para concursos e provas. App mobile **100% offline** — todos os dados ficam no SQLite do próprio aparelho, sem backend, sem conta, sem internet.

## Como o app funciona

O fluxo do Cronos parte de uma ideia simples: você define **o que** estudar e **quando**, e o app materializa isso em sessões diárias que você marca como concluídas.

1. **Meta** (aba Config) — o objetivo do estudo: um concurso, uma prova, a OAB. Pode ter data (que alimenta a contagem regressiva do Dash) e descrição. Cada meta tem um **switch de ativação**: desativando, tudo dela some das telas de uso (Hoje, Semana, Dash, Matérias, Atrasos) sem apagar nada — útil para pausar um objetivo. A meta **fixada** é a que aparece no countdown do Dash (desativar uma meta também a desfixa).
2. **Matérias** (toque numa meta) — as disciplinas do edital, cada uma com nome, cor (presets ou seletor de cor livre) e **peso no edital** (1 a 5).
3. **Cronograma semanal** (na mesma tela) — horários fixos por dia da semana: "toda segunda, Direito Penal, 1h". Cada entrada do cronograma vira automaticamente uma **sessão de estudo** gerada para os próximos dias (horizonte de 7 dias, gerado no boot do app, de forma idempotente).
4. **Uso diário**:
   - **Hoje** — as sessões do dia, com streak (ofensiva) de dias perfeitos/parciais. Toque para concluir.
   - **Semana** — visão da semana inteira, com navegação entre semanas.
   - **Dash** — dias para a meta, pendências, horas por matéria nos últimos 30 dias (ordenado da mais estudada para a menos) e heatmap dos últimos 14 dias.
   - **Matérias** — detalhe por disciplina: histórico de sessões e contador de questões.
   - **Atrasos** — sessões pendentes de dias passados; dá para reagendar para hoje ou desistir.
5. **Tema** — claro/escuro pelo switch no rodapé da aba Config; a escolha persiste no banco.

### Modelo de dados (SQLite via Drizzle)

```
goals (meta)  1─N  subjects (matéria)  1─N  templates (horário semanal)
                                       1─N  sessions  (sessão materializada por data)
app_meta (chave/valor: tema, última data de geração de sessões)
```

As migrations ficam em `lib/db/migrations/` e são aplicadas automaticamente na abertura do app (`hooks/useDatabaseMigrations.ts`). Para alterar o schema: edite `lib/db/schema.ts` e rode `npm run db:generate`.

## Stack

- **Expo SDK 54** + TypeScript + **Expo Router** (rotas por arquivo)
- **React Native 0.81** / React 19.1
- **NativeWind v4** (Tailwind para RN), dark mode por classe
- Componentes estilo shadcn/ui (`components/ui/`: Button, Card, Dialog, Input, Text…) via rn-primitives
- **Drizzle ORM** + **expo-sqlite** com live queries (a UI reage a mudanças no banco)
- `@react-native-community/datetimepicker` para o calendário de data da meta
- ESLint (flat config) + Prettier

> ⚠️ O projeto é fixado no **SDK 54** (compatibilidade com os aparelhos de teste). Ao consultar docs do Expo, use https://docs.expo.dev/versions/v54.0.0/.

## Estrutura

```
app/                  # rotas (Expo Router)
  (tabs)/             #   abas: index (Hoje), semana, dashboard, materias, pendencias, config
  goal/[id].tsx       #   detalhe da meta: matérias + cronograma
components/           # componentes do app (heatmap, gráficos, cards, color-picker…)
components/ui/        # componentes base (button, card, dialog, input, text…)
hooks/                # acesso ao banco (useGoals, useSubjects, useSessions…)
lib/db/               # schema.ts, client.ts, generateSessions.ts, migrations/
lib/logic/            # regras puras (datas, streaks, agregações)
assets/               # ícones e splash (gerados a partir de cronos-logo.png)
```

## Rodando o projeto (desenvolvimento)

Pré-requisitos: Node 20+, npm.

```bash
npm install
npx expo start --go
```

Escaneie o QR code com a câmera (iPhone) ou pelo app **Expo Go** (Android), na mesma rede Wi-Fi do computador. Cada salvamento recarrega o app na hora (hot reload). O Expo Go usa um banco separado do app instalado — bom para testar sem mexer nos dados reais.

- **Simulador iOS** (Xcode/macOS): `npx expo start --go --ios`
- **Android via cabo USB** (sem precisar de Wi-Fi): `npx expo start --go --android` — instala o Expo Go pelo adb e conecta por `adb reverse`.

Checagens de qualidade:

```bash
npx tsc --noEmit   # tipos
npm run lint       # eslint
npm run db:studio  # inspecionar o banco no Drizzle Studio
```

## Instalando no Android (app definitivo, sem cabo depois)

Pré-requisitos: Android SDK + adb, JDK 17, **Depuração USB** ativa no aparelho (Opções do desenvolvedor) e autorizada (`adb devices` deve listar o aparelho como `device`).

```bash
npx expo run:android --variant release
```

A primeira build demora vários minutos (Gradle); as seguintes usam cache. Ao final, o app **Cronos** fica instalado com ícone próprio e JavaScript embutido — funciona sem Metro, sem cabo e sem internet.

### Atualizando o app instalado

1. Desenvolva e teste no Expo Go (`npx expo start --go`).
2. Pronto para subir? Conecte o cabo e rode de novo `npx expo run:android --variant release` — reinstala por cima **preservando os dados** (o schema evolui via migrations do Drizzle).
3. Se a mudança envolver algo **nativo** (lib com código nativo, ícone/splash/nome do app, config nativa do `app.json`), regenere a pasta nativa antes: `npx expo prebuild -p android --clean`.

> As pastas `android/` e `ios/` são geradas (prebuild) e ficam fora do git — o `app.json` é a fonte da verdade da configuração nativa.

### iOS

Instalar em iPhone físico exige assinatura da Apple: com Apple ID gratuito o app vale 7 dias por instalação (`npx expo run:ios --device --configuration Release`, assinatura configurada no Xcode via Personal Team); para algo permanente é preciso a conta de desenvolvedor paga (TestFlight/App Store).

## Ícones

Os ícones e o splash em `assets/` são derivados de `assets/cronos-logo.png` (1024×1024): ícone iOS achatado (sem alpha), camadas do adaptive icon do Android (foreground na zona segura de recorte + background sólido + monocromático para o ícone temático do Android 13+) e a marca recortada para o splash. Ao trocar a logo, regenere as variantes e rode `npx expo prebuild -p android --clean`.
