import * as DialogPrimitive from '@rn-primitives/dialog';
import { X } from 'lucide-react-native';
import * as React from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';
import Animated, { FadeIn, FadeOut, SlideInDown, SlideOutDown } from 'react-native-reanimated';
import { Icon } from '@/components/ui/icon';
import { TextClassContext } from '@/components/ui/text';
import { cn } from '@/lib/utils';

const Sheet = DialogPrimitive.Root;
const SheetTrigger = DialogPrimitive.Trigger;
const SheetClose = DialogPrimitive.Close;
const SheetPortal = DialogPrimitive.Portal;

const SheetOverlay = React.forwardRef<DialogPrimitive.OverlayRef, DialogPrimitive.OverlayProps>(
  ({ className, ...props }, ref) => {
    return (
      <DialogPrimitive.Overlay
        className={cn(
          'z-50 flex justify-end bg-black/80 absolute top-0 right-0 bottom-0 left-0',
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
SheetOverlay.displayName = DialogPrimitive.Overlay.displayName;

const SheetContent = React.forwardRef<DialogPrimitive.ContentRef, DialogPrimitive.ContentProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <SheetPortal>
        <SheetOverlay>
          <Animated.View entering={SlideInDown.duration(250)} exiting={SlideOutDown.duration(200)}>
            <DialogPrimitive.Content
              ref={ref}
              className={cn(
                'z-50 gap-4 rounded-t-2xl border-t border-border bg-background p-6 shadow-lg',
                className
              )}
              {...props}
            >
              <View className="mb-2 h-1.5 w-12 self-center rounded-full bg-muted" />
              {children}
              <DialogPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 active:opacity-100">
                <Icon as={X} size={18} />
              </DialogPrimitive.Close>
            </DialogPrimitive.Content>
          </Animated.View>
        </SheetOverlay>
      </SheetPortal>
    );
  }
);
SheetContent.displayName = DialogPrimitive.Content.displayName;

const SheetHeader = ({ className, ...props }: React.ComponentPropsWithoutRef<typeof View>) => (
  <View className={cn('flex flex-col gap-1.5', className)} {...props} />
);
SheetHeader.displayName = 'SheetHeader';

const SheetFooter = ({ className, ...props }: React.ComponentPropsWithoutRef<typeof View>) => (
  <View className={cn('flex flex-row justify-end gap-2', className)} {...props} />
);
SheetFooter.displayName = 'SheetFooter';

const SheetTitle = React.forwardRef<DialogPrimitive.TitleRef, DialogPrimitive.TitleProps>(
  ({ className, ...props }, ref) => (
    <TextClassContext.Provider value="text-lg font-semibold leading-none tracking-tight text-foreground">
      <DialogPrimitive.Title
        ref={ref}
        className={cn('text-lg font-semibold leading-none tracking-tight text-foreground', className)}
        {...props}
      />
    </TextClassContext.Provider>
  )
);
SheetTitle.displayName = DialogPrimitive.Title.displayName;

const SheetDescription = React.forwardRef<
  DialogPrimitive.DescriptionRef,
  DialogPrimitive.DescriptionProps
>(({ className, ...props }, ref) => (
  <TextClassContext.Provider value="text-sm text-muted-foreground">
    <DialogPrimitive.Description
      ref={ref}
      className={cn('text-sm text-muted-foreground', className)}
      {...props}
    />
  </TextClassContext.Provider>
));
SheetDescription.displayName = DialogPrimitive.Description.displayName;

export {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetOverlay,
  SheetPortal,
  SheetTitle,
  SheetTrigger,
};
