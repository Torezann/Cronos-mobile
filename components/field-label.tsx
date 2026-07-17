import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';

export function FieldLabel({ children, className }: { children: string; className?: string }) {
  return (
    <Text className={cn('font-mono text-[9px] tracking-[1.5px] text-muted-foreground', className)}>
      {children}
    </Text>
  );
}
