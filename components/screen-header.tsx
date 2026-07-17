import type * as React from 'react';
import { View } from 'react-native';
import { Text } from '@/components/ui/text';

type ScreenHeaderProps = {
  overline?: string;
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
};

export function ScreenHeader({ overline, title, subtitle, right }: ScreenHeaderProps) {
  return (
    <View className="mb-4">
      {overline ? (
        <Text className="font-mono text-[10px] tracking-[2px] text-primary">{overline}</Text>
      ) : null}
      <View className="mt-0.5 flex-row items-end justify-between">
        <Text className="font-sans-extrabold text-[28px] leading-9 tracking-tight text-foreground">
          {title}
        </Text>
        {right}
      </View>
      {subtitle ? (
        <Text className="mt-0.5 text-[13px] text-muted-foreground">{subtitle}</Text>
      ) : null}
    </View>
  );
}
