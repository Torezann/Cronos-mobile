import * as DialogPrimitive from '@rn-primitives/dialog';
import { X } from 'lucide-react-native';
import * as React from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { Icon } from '@/components/ui/icon';
import { TextClassContext } from '@/components/ui/text';
import { cn } from '@/lib/utils';

const Dialog = DialogPrimitive.Root;
const DialogTrigger = DialogPrimitive.Trigger;
const DialogClose = DialogPrimitive.Close;

const DialogPortal = DialogPrimitive.Portal;

const DialogOverlay = React.forwardRef<DialogPrimitive.OverlayRef, DialogPrimitive.OverlayProps>(
  ({ className, ...props }, ref) => {
    return (
      <DialogPrimitive.Overlay
        className={cn(
          'z-50 flex items-center justify-center bg-black/80 p-4 absolute top-0 right-0 bottom-0 left-0',
          className
        )}
        {...props}
        ref={ref}
      >
        <Animated.View
          entering={FadeIn.duration(150)}
          exiting={FadeOut.duration(150)}
          style={StyleSheet.absoluteFill as ViewStyle}
        />
        <View style={StyleSheet.absoluteFill as ViewStyle}>
          {props.children as React.ReactNode}
        </View>
      </DialogPrimitive.Overlay>
    );
  }
);
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

const DialogContent = React.forwardRef<DialogPrimitive.ContentRef, DialogPrimitive.ContentProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <DialogPortal>
        <DialogOverlay>
          <DialogPrimitive.Content
            ref={ref}
            className={cn(
              'z-50 max-w-lg gap-4 rounded-lg border border-border bg-background p-6 shadow-lg web:duration-200',
              className
            )}
            {...props}
          >
            {children}
            <DialogPrimitive.Close
              className={'absolute right-4 top-4 rounded-sm opacity-70 active:opacity-100'}
            >
              <Icon as={X} size={18} />
            </DialogPrimitive.Close>
          </DialogPrimitive.Content>
        </DialogOverlay>
      </DialogPortal>
    );
  }
);
DialogContent.displayName = DialogPrimitive.Content.displayName;

const DialogHeader = ({ className, ...props }: React.ComponentPropsWithoutRef<typeof View>) => (
  <View className={cn('flex flex-col gap-1.5 text-center sm:text-left', className)} {...props} />
);
DialogHeader.displayName = 'DialogHeader';

const DialogFooter = ({ className, ...props }: React.ComponentPropsWithoutRef<typeof View>) => (
  <View className={cn('flex flex-row justify-end gap-2', className)} {...props} />
);
DialogFooter.displayName = 'DialogFooter';

const DialogTitle = React.forwardRef<DialogPrimitive.TitleRef, DialogPrimitive.TitleProps>(
  ({ className, ...props }, ref) => (
    <TextClassContext.Provider value="text-lg font-semibold leading-none tracking-tight text-foreground">
      <DialogPrimitive.Title ref={ref} className={cn(className)} {...props} />
    </TextClassContext.Provider>
  )
);
DialogTitle.displayName = DialogPrimitive.Title.displayName;

const DialogDescription = React.forwardRef<
  DialogPrimitive.DescriptionRef,
  DialogPrimitive.DescriptionProps
>(({ className, ...props }, ref) => (
  <TextClassContext.Provider value="text-sm text-muted-foreground">
    <DialogPrimitive.Description ref={ref} className={cn(className)} {...props} />
  </TextClassContext.Provider>
));
DialogDescription.displayName = DialogPrimitive.Description.displayName;

export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
};
