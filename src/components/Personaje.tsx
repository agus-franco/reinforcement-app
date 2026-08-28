import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';

import type { EstadoPersonaje } from '@/state/tipos';
import { colores, radios } from '@/theme/tokens';

interface Props {
  estado: EstadoPersonaje;
  tamano?: number;
}

const BORDE_POR_ESTADO: Record<EstadoPersonaje, string> = {
  radiante: colores.acento,
  feliz: colores.superficie,
  preocupado: colores.superficie,
  triste: colores.superficie,
};

const ROTACION_POR_ESTADO: Record<EstadoPersonaje, string> = {
  radiante: '0deg',
  feliz: '0deg',
  preocupado: '-6deg',
  triste: '0deg',
};

const OPACIDAD_POR_ESTADO: Record<EstadoPersonaje, number> = {
  radiante: 1,
  feliz: 1,
  preocupado: 0.75,
  triste: 0.5,
};

export function Personaje({ estado, tamano = 96 }: Props) {
  const pulso = useSharedValue(1);

  useEffect(() => {
    if (estado === 'radiante') {
      pulso.value = withRepeat(withTiming(1.06, { duration: 900 }), -1, true);
    } else {
      pulso.value = withTiming(1);
    }
  }, [estado, pulso]);

  // Un solo transform combinando el pulso animado (scale) y la inclinación estática
  // (rotate): dos objetos de estilo distintos no mezclan sus arrays de transform entre
  // sí, el último gana entero, así que tienen que ir juntos en el mismo array.
  const estiloAnimado = useAnimatedStyle(() => ({
    transform: [{ scale: pulso.value }, { rotate: ROTACION_POR_ESTADO[estado] }],
  }));

  return (
    <Animated.View
      style={[
        styles.circulo,
        estiloAnimado,
        {
          width: tamano,
          height: tamano,
          borderRadius: tamano / 2,
          borderColor: BORDE_POR_ESTADO[estado],
          opacity: OPACIDAD_POR_ESTADO[estado],
        },
      ]}
    >
      <Text style={[styles.emoji, { fontSize: tamano * 0.45 }]}>🧠</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  circulo: {
    backgroundColor: colores.superficie,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: {
    textAlign: 'center',
  },
});
