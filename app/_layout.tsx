import '@/global.css';

import {
  Archivo_400Regular,
  Archivo_500Medium,
  Archivo_600SemiBold,
  Archivo_700Bold,
  Archivo_800ExtraBold,
} from '@expo-google-fonts/archivo';
import {
  IBMPlexMono_400Regular,
  IBMPlexMono_500Medium,
  IBMPlexMono_600SemiBold,
} from '@expo-google-fonts/ibm-plex-mono';
import { PortalHost } from '@rn-primitives/portal';
import { useFonts } from 'expo-font';
import { ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'nativewind';
import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { eq } from 'drizzle-orm';
import { Text } from '@/components/ui/text';
import { useDatabaseMigrations } from '@/hooks/useDatabaseMigrations';
import { db } from '@/lib/db/client';
import { appMeta } from '@/lib/db/schema';
import { useSessionGeneration } from '@/hooks/useSessionGeneration';
import { NAV_THEME } from '@/lib/theme';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const { colorScheme, setColorScheme } = useColorScheme();
  const { success, error } = useDatabaseMigrations();
  const [fontsLoaded] = useFonts({
    Archivo_400Regular,
    Archivo_500Medium,
    Archivo_600SemiBold,
    Archivo_700Bold,
    Archivo_800ExtraBold,
    IBMPlexMono_400Regular,
    IBMPlexMono_500Medium,
    IBMPlexMono_600SemiBold,
  });
  const sessionsReady = useSessionGeneration(success);

  const ready = success && fontsLoaded && sessionsReady;

  useEffect(() => {
    if (ready || error) {
      SplashScreen.hideAsync();
    }
  }, [ready, error]);

  // Aplica o tema salvo pelo usuário (aba Config) assim que o banco estiver pronto.
  useEffect(() => {
    if (!success) return;
    db.select()
      .from(appMeta)
      .where(eq(appMeta.key, 'theme'))
      .then((rows) => {
        const saved = rows[0]?.value;
        if (saved === 'light' || saved === 'dark') setColorScheme(saved);
      })
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [success]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider value={colorScheme === 'dark' ? NAV_THEME.dark : NAV_THEME.light}>
          <View className={colorScheme === 'dark' ? 'dark flex-1' : 'flex-1'}>
            {error ? (
              <View className="flex-1 items-center justify-center gap-2 bg-background p-6">
                <Text className="text-center text-destructive">
                  Falha ao migrar o banco de dados
                </Text>
                <Text variant="muted" className="text-center">
                  {error.message}
                </Text>
              </View>
            ) : !ready ? (
              <View className="flex-1 items-center justify-center bg-background">
                <ActivityIndicator />
              </View>
            ) : (
              <Stack screenOptions={{ headerShown: false }} />
            )}
            <PortalHost />
          </View>
          <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
