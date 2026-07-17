import { View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { useEffect } from 'react';
import { Text } from '@/components/ui/text';

function Flame({ size }: { size: number }) {
  const t = useSharedValue(0);
  useEffect(() => {
    t.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 800, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 800, easing: Easing.inOut(Easing.ease) })
      ),
      -1
    );
  }, [t]);
  const style = useAnimatedStyle(() => ({
    transform: [{ scale: 1 + t.value * 0.08 }, { rotate: `${-2 + t.value * 4}deg` }],
  }));
  return (
    <Animated.Text style={[{ fontSize: size }, style]} accessibilityLabel="ofensiva">
      🔥
    </Animated.Text>
  );
}

type StreakCardProps = {
  perfect: number;
  partial: number;
  daysToExam: number | null;
  big?: boolean;
};

export function StreakCard({ perfect, partial, daysToExam, big = false }: StreakCardProps) {
  if (big) {
    return (
      <View className="flex-row items-center gap-4 rounded-2xl border border-accent bg-accent p-5">
        <Flame size={44} />
        <View className="flex-1">
          <Text className="font-sans-extrabold text-[40px] leading-[44px] text-primary">
            {perfect}
          </Text>
          <Text className="mt-1 font-sans-semibold text-[13px] text-foreground">
            {perfect === 1 ? 'dia' : 'dias'} de ofensiva perfeita
          </Text>
          <Text className="text-[11.5px] text-muted-foreground">
            parcial: {partial} dias · perdão: domingos
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-row items-center gap-3.5 rounded-2xl border border-accent bg-accent px-4 py-3.5">
      <Flame size={30} />
      <View className="flex-1">
        <Text className="font-sans-extrabold text-[22px] leading-6 text-primary">
          {perfect} {perfect === 1 ? 'dia' : 'dias'}
        </Text>
        <Text className="mt-0.5 text-xs text-muted-foreground">
          ofensiva perfeita · parcial {partial}
        </Text>
      </View>
      {daysToExam !== null ? (
        <View className="items-end">
          <Text className="font-sans-extrabold text-lg leading-5 text-foreground">
            {daysToExam}
          </Text>
          <Text className="text-[11px] text-muted-foreground">dias p/ prova</Text>
        </View>
      ) : null}
    </View>
  );
}
