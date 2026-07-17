import { Pressable, View } from 'react-native';
import { cn } from '@/lib/utils';

type PesoDotsProps = {
  peso: number;
  color: string;
  size?: number;
};

export function PesoDots({ peso, color, size = 6 }: PesoDotsProps) {
  return (
    <View className="flex-row gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <View
          key={n}
          className={cn('rounded-full', n > peso && 'bg-border')}
          style={{ width: size, height: size, ...(n <= peso ? { backgroundColor: color } : null) }}
        />
      ))}
    </View>
  );
}

type PesoSelectorProps = {
  value: number;
  onChange: (peso: number) => void;
};

export function PesoSelector({ value, onChange }: PesoSelectorProps) {
  return (
    <View className="flex-row gap-2">
      {[1, 2, 3, 4, 5].map((n) => (
        <Pressable
          key={n}
          onPress={() => onChange(n)}
          className={cn(
            'h-10 flex-1 items-center justify-center rounded-lg border',
            n <= value ? 'border-primary bg-primary/15' : 'border-border bg-transparent'
          )}
          accessibilityLabel={`peso ${n}`}>
          <View
            className={cn('h-2.5 w-2.5 rounded-full', n <= value ? 'bg-primary' : 'bg-border')}
          />
        </Pressable>
      ))}
    </View>
  );
}
