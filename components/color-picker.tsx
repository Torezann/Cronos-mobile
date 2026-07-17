import { useEffect, useRef, useState } from 'react';
import { Pressable, View, type GestureResponderEvent } from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';
import { hexToHsv, hsvToHex, SUBJECT_COLORS, type Hsv } from '@/lib/colors';
import { cn } from '@/lib/utils';

type ColorPickerProps = {
  value: string;
  onChange: (color: string) => void;
};

const SV_HEIGHT = 150;
const HUE_HEIGHT = 20;
const HUE_STOPS = ['#ff0000', '#ffff00', '#00ff00', '#00ffff', '#0000ff', '#ff00ff', '#ff0000'];

function clamp01(n: number) {
  return Math.max(0, Math.min(1, n));
}

/** Área que responde a toque/arrasto reportando posição normalizada (0-1). */
function TouchPad({
  height,
  onPick,
  children,
}: {
  height: number;
  onPick: (x: number, y: number) => void;
  children: (width: number) => React.ReactNode;
}) {
  const [width, setWidth] = useState(0);
  const widthRef = useRef(0);

  const handle = (e: GestureResponderEvent) => {
    if (widthRef.current === 0) return;
    const { locationX, locationY } = e.nativeEvent;
    onPick(clamp01(locationX / widthRef.current), clamp01(locationY / height));
  };

  return (
    <View
      style={{ height }}
      onLayout={(e) => {
        widthRef.current = e.nativeEvent.layout.width;
        setWidth(e.nativeEvent.layout.width);
      }}
      onStartShouldSetResponder={() => true}
      onMoveShouldSetResponder={() => true}
      onResponderTerminationRequest={() => false}
      onResponderGrant={handle}
      onResponderMove={handle}>
      {width > 0 ? children(width) : null}
    </View>
  );
}

function Marker({ x, y, color }: { x: number; y: number; color: string }) {
  return (
    <View
      pointerEvents="none"
      className="absolute h-5 w-5 rounded-full border-2 border-white"
      style={{
        left: x - 10,
        top: y - 10,
        backgroundColor: color,
        shadowColor: '#000',
        shadowOpacity: 0.4,
        shadowRadius: 2,
        shadowOffset: { width: 0, height: 1 },
        elevation: 3,
      }}
    />
  );
}

export function ColorPicker({ value, onChange }: ColorPickerProps) {
  // HSV interno preserva matiz/saturação mesmo quando o hex resultante os perde
  // (ex.: v=0 vira #000000 independentemente de h e s).
  const [hsv, setHsv] = useState<Hsv>(() => hexToHsv(value));
  const [showCustom, setShowCustom] = useState(false);
  const isPreset = (SUBJECT_COLORS as readonly string[]).includes(value);

  // Ressincroniza quando a cor muda por fora (ex.: começar a editar outra matéria).
  useEffect(() => {
    setHsv((current) =>
      hsvToHex(current).toLowerCase() === value.toLowerCase() ? current : hexToHsv(value)
    );
  }, [value]);

  const apply = (next: Hsv) => {
    setHsv(next);
    onChange(hsvToHex(next));
  };

  const hueColor = hsvToHex({ h: hsv.h, s: 1, v: 1 });

  return (
    <View className="gap-2.5">
      <View className="flex-row items-center gap-2">
        {SUBJECT_COLORS.map((c) => (
          <Pressable
            key={c}
            onPress={() => {
              setHsv(hexToHsv(c));
              onChange(c);
              setShowCustom(false);
            }}
            className={cn(
              'h-8 w-8 rounded-lg border-2',
              value === c ? 'border-foreground' : 'border-transparent'
            )}
            style={{ backgroundColor: c }}
            accessibilityLabel={`cor ${c}`}
          />
        ))}
        <Pressable
          onPress={() => setShowCustom((s) => !s)}
          className={cn(
            'ml-auto h-8 w-8 items-center justify-center rounded-lg border-2',
            !isPreset || showCustom ? 'border-foreground' : 'border-border'
          )}
          style={!isPreset ? { backgroundColor: value } : undefined}
          accessibilityLabel="cor personalizada">
          {isPreset ? (
            <Svg width={20} height={20}>
              <Defs>
                <LinearGradient id="wheel" x1="0" y1="0" x2="1" y2="1">
                  {HUE_STOPS.map((c, i) => (
                    <Stop key={i} offset={`${i / (HUE_STOPS.length - 1)}`} stopColor={c} />
                  ))}
                </LinearGradient>
              </Defs>
              <Rect x="0" y="0" width={20} height={20} rx={5} fill="url(#wheel)" />
            </Svg>
          ) : null}
        </Pressable>
      </View>

      {showCustom ? (
        <>
          <View className="overflow-hidden rounded-xl border border-border">
            <TouchPad
              height={SV_HEIGHT}
              onPick={(x, y) => apply({ ...hsv, s: x, v: 1 - y })}>
              {(width) => (
                <>
                  <Svg width={width} height={SV_HEIGHT}>
                    <Defs>
                      <LinearGradient id="sat" x1="0" y1="0" x2="1" y2="0">
                        <Stop offset="0" stopColor="#ffffff" />
                        <Stop offset="1" stopColor={hueColor} />
                      </LinearGradient>
                      <LinearGradient id="val" x1="0" y1="0" x2="0" y2="1">
                        <Stop offset="0" stopColor="#000000" stopOpacity="0" />
                        <Stop offset="1" stopColor="#000000" stopOpacity="1" />
                      </LinearGradient>
                    </Defs>
                    <Rect x="0" y="0" width={width} height={SV_HEIGHT} fill="url(#sat)" />
                    <Rect x="0" y="0" width={width} height={SV_HEIGHT} fill="url(#val)" />
                  </Svg>
                  <Marker x={hsv.s * width} y={(1 - hsv.v) * SV_HEIGHT} color={value} />
                </>
              )}
            </TouchPad>
          </View>

          <View className="overflow-hidden rounded-full">
            <TouchPad height={HUE_HEIGHT} onPick={(x) => apply({ ...hsv, h: x * 360 })}>
              {(width) => (
                <>
                  <Svg width={width} height={HUE_HEIGHT}>
                    <Defs>
                      <LinearGradient id="hue" x1="0" y1="0" x2="1" y2="0">
                        {HUE_STOPS.map((c, i) => (
                          <Stop key={i} offset={`${i / (HUE_STOPS.length - 1)}`} stopColor={c} />
                        ))}
                      </LinearGradient>
                    </Defs>
                    <Rect x="0" y="0" width={width} height={HUE_HEIGHT} fill="url(#hue)" />
                  </Svg>
                  <Marker x={(hsv.h / 360) * width} y={HUE_HEIGHT / 2} color={hueColor} />
                </>
              )}
            </TouchPad>
          </View>
        </>
      ) : null}
    </View>
  );
}
