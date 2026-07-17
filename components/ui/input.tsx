import { useColorScheme } from 'nativewind';
import * as React from 'react';
import { TextInput, type TextInputProps } from 'react-native';
import { THEME } from '@/lib/theme';
import { cn } from '@/lib/utils';

const Input = React.forwardRef<React.ComponentRef<typeof TextInput>, TextInputProps>(
  ({ className, placeholderClassName, ...props }, ref) => {
    const { colorScheme } = useColorScheme();
    const theme = colorScheme === 'dark' ? THEME.dark : THEME.light;
    return (
      <TextInput
        ref={ref}
        className={cn(
          'h-11 rounded-md border border-input bg-background px-3 text-base text-foreground native:leading-[1.25]',
          props.editable === false && 'opacity-50',
          className
        )}
        placeholderTextColor={theme.mutedForeground}
        {...props}
      />
    );
  }
);
Input.displayName = 'Input';

export { Input };
