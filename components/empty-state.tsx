import type * as React from 'react';
import { View } from 'react-native';
import { Card } from '@/components/ui/card';
import { Text } from '@/components/ui/text';

type EmptyStateProps = {
  emoji: string;
  title: string;
  description: string;
  action?: React.ReactNode;
};

export function EmptyState({ emoji, title, description, action }: EmptyStateProps) {
  return (
    <Card className="items-center rounded-2xl px-5 py-9">
      <Text className="mb-2 text-[32px]">{emoji}</Text>
      <Text className="font-sans-bold text-base text-foreground">{title}</Text>
      <Text className="mt-1 text-center text-[12.5px] text-muted-foreground">{description}</Text>
      {action ? <View className="mt-4 w-full">{action}</View> : null}
    </Card>
  );
}
