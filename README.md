# Cronos Mobile

App React Native (Expo) 100% offline — todos os dados residem no SQLite do dispositivo, sem backend/API.

## Stack

- **Expo SDK 57** + TypeScript + **Expo Router** (file-based routing)
- **NativeWind v4** (Tailwind CSS para React Native), dark mode via classe
- **react-native-reusables** (componentes estilo shadcn/ui para RN) — `Text`, `Button`, `Card`, `Input`, `Dialog`, `Sheet`, `Icon`
- **Drizzle ORM** + **expo-sqlite**, com migrations versionadas e aplicadas automaticamente no boot do app
- **EAS CLI** para builds futuros (`eas.json` configurado)
- ESLint (flat config) + Prettier

## Estrutura

```
app/                  # rotas (Expo Router)
components/ui/        # componentes reusables
components/           # componentes próprios do app
lib/db/               # schema.ts, client.ts, migrations/
hooks/                # hooks, incluindo acesso ao banco (useItems, useDatabaseMigrations)
types/                # tipos compartilhados
```

## Setup

```bash
npm install
```

## Rodando

```bash
npx expo start        # abre o Metro, escolha a plataforma no terminal
npm run android        # build nativo + instala no emulador/dispositivo Android conectado
npm run ios            # build nativo + instala no simulador iOS
npm run web             # versão web (debug)
```

## Banco de dados (Drizzle + SQLite)

Alterou o `lib/db/schema.ts`? Gere a migration antes de rodar o app:

```bash
npm run db:generate
```

As migrations em `lib/db/migrations/` são aplicadas automaticamente na inicialização do app (`hooks/useDatabaseMigrations.ts`). Não é necessário rodar nada manualmente no dispositivo.

```bash
npm run db:studio      # abre o Drizzle Studio para inspecionar o banco
```

## Qualidade

```bash
npm run lint
npm run format
npx tsc --noEmit
npx expo-doctor
```

## EAS Build

O EAS CLI deve estar instalado globalmente (`npm install -g eas-cli` ou `pnpm add -g eas-cli`). Antes do primeiro build:

```bash
eas login
eas init
eas build --profile development --platform android
```

Os identificadores de bundle (`ios.bundleIdentifier` / `android.package`) em `app.json` são placeholders (`com.example.cronosmobile`) — defina os valores reais antes de gerar builds de produção.
