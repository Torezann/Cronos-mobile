import * as React from 'react';
import { TextInput, type TextInputProps } from 'react-native';
import { cn } from '@/lib/utils';

const Input = React.forwardRef<React.ComponentRef<typeof TextInput>, TextInputProps>(
  ({ className, placeholderClassName, ...props }, ref) => {
    return (
      <TextInput
        ref={ref}
        className={cn(
          'h-11 rounded-md border border-input bg-background px-3 text-base text-foreground native:leading-[1.25]',
          props.editable === false && 'opacity-50',
          className
        )}
        placeholderTextColor="#8891a3"
        {...props}
      />
    );
  }
);
Input.displayName = 'Input';

export { Input };
