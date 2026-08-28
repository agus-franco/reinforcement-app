import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { colores } from '@/theme/tokens';

export interface Rafaga {
  id: number;
  dorado: boolean;
}

interface Props {
  rafaga: Rafaga | null;
}

const N_PARTICULAS = 6;

/** Ráfaga de puntitos que se disparan hacia afuera y se apagan, al completar una frase. */
export function Particulas({ rafaga }: Props) {
  if (!rafaga) return null;
  return (
    <View pointerEvents="none" style={styles.contenedor}>
      {Array.from({ length: N_PARTICULAS }).map((_, i) => (
        <Particula key={`${rafaga.id}-${i}`} rafagaId={rafaga.id} indice={i} dorado={rafaga.dorado} />
      ))}
    </View>
  );
}

function Particula({ rafagaId, indice, dorado }: { rafagaId: number; indice: number; dorado: boolean }) {
  const progreso = useSharedValue(0);
  const angulo = (indice / N_PARTICULAS) * Math.PI * 2;
  const distancia = 36 + (indice % 3) * 12;

  useEffect(() => {
    progreso.value = 0;
    progreso.value = withTiming(1, { duration: 550, easing: Easing.out(Easing.cubic) });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rafagaId]);

  const estiloAnimado = useAnimatedStyle(() => {
    const dx = Math.cos(angulo) * distancia * progreso.value;
    const dy = Math.sin(angulo) * distancia * progreso.value - 16 * progreso.value;
    return {
      opacity: 1 - progreso.value,
      transform: [{ translateX: dx }, { translateY: dy }, { scale: 1 - progreso.value * 0.4 }],
    };
  });

  return (
    <Animated.View
      style={[styles.particula, { backgroundColor: dorado ? colores.dorado : colores.acento }, estiloAnimado]}
    />
  );
}

const styles = StyleSheet.create({
  contenedor: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: 0,
    height: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  particula: {
    position: 'absolute',
    width: 6,
    height: 6,
    borderRadius: 3,
  },
});
