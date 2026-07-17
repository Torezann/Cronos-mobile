import { Tabs } from 'expo-router';
import {
  AlarmClock,
  BookOpen,
  CalendarCheck,
  CalendarDays,
  LayoutDashboard,
  Settings,
} from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import { usePendingSessions } from '@/hooks/usePendingSessions';
import { THEME } from '@/lib/theme';

export default function TabsLayout() {
  const { colorScheme } = useColorScheme();
  const theme = colorScheme === 'dark' ? THEME.dark : THEME.light;
  const { count } = usePendingSessions();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.mutedForeground,
        tabBarStyle: {
          backgroundColor: theme.background,
          borderTopColor: theme.border,
        },
        tabBarLabelStyle: {
          fontFamily: 'IBMPlexMono_500Medium',
          fontSize: 10,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Hoje',
          tabBarIcon: ({ color, size }) => <CalendarCheck color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="semana"
        options={{
          title: 'Semana',
          tabBarIcon: ({ color, size }) => <CalendarDays color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Dash',
          tabBarIcon: ({ color, size }) => <LayoutDashboard color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="materias"
        options={{
          title: 'Matérias',
          tabBarIcon: ({ color, size }) => <BookOpen color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="pendencias"
        options={{
          title: 'Atrasos',
          tabBarIcon: ({ color, size }) => <AlarmClock color={color} size={size} />,
          tabBarBadge: count > 0 ? count : undefined,
          tabBarBadgeStyle: {
            backgroundColor: theme.destructive,
            color: '#ffffff',
            fontFamily: 'IBMPlexMono_600SemiBold',
            fontSize: 10,
          },
        }}
      />
      <Tabs.Screen
        name="config"
        options={{
          title: 'Config',
          tabBarIcon: ({ color, size }) => <Settings color={color} size={size} />,
        }}
      />
    </Tabs>
  );
}
