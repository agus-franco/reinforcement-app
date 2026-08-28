import { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';

import { colores } from '@/theme/tokens';

/** Un glow muy sutil que crece y se achica lento, para que el fondo no se sienta estático. */
export function FondoRespirando() {
  const t = useSharedValue(0);

  useEffect(() => {
    t.value = withRepeat(withTiming(1, { duration: 4000, easing: Easing.inOut(Easing.sin) }), -1, true);
  }, [t]);

  const estilo = useAnimatedStyle(() => ({
    opacity: 0.05 + t.value * 0.06,
    transform: [{ scale: 1 + t.value * 0.15 }],
  }));

  return <Animated.View pointerEvents="none" style={[styles.blob, estilo]} />;
}

const styles = StyleSheet.create({
  blob: {
    position: 'absolute',
    top: '28%',
    left: '8%',
    right: '8%',
    height: 300,
    borderRadius: 300,
    backgroundColor: colores.acento,
  },
});
