import '@/global.css';

import { PortalHost } from '@rn-primitives/portal';
import { Stack, ThemeProvider } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'nativewind';
import { ActivityIndicator, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Text } from '@/components/ui/text';
import { useDatabaseMigrations } from '@/hooks/useDatabaseMigrations';
import { NAV_THEME } from '@/lib/theme';

export default function RootLayout() {
  const { colorScheme } = useColorScheme();
  const { success, error } = useDatabaseMigrations();

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
            ) : !success ? (
              <View className="flex-1 items-center justify-center bg-background">
                <ActivityIndicator />
              </View>
            ) : (
              <Stack screenOptions={{ headerShown: false }} />
            )}
            <PortalHost />
          </View>
          <StatusBar style="auto" />
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
