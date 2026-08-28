import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { colores, radios } from '@/theme/tokens';

interface Props {
  valor: number;
  meta: number;
}

export function BarraProgreso({ valor, meta }: Props) {
  const progreso = useSharedValue(0);

  useEffect(() => {
    progreso.value = withTiming(meta > 0 ? Math.min(1, valor / meta) : 0, { duration: 700 });
  }, [valor, meta, progreso]);

  const estiloAnimado = useAnimatedStyle(() => ({
    width: `${progreso.value * 100}%`,
  }));

  return (
    <View style={styles.track}>
      <Animated.View style={[styles.relleno, estiloAnimado]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    // Sin width fijo a propósito: en una columna se estira solo (alignItems:'stretch'
    // por default), y en una fila el que la usa la envuelve en flex:1 si necesita que
    // comparta espacio con otro elemento — así sirve para los dos casos.
    height: 8,
    borderRadius: radios.pill,
    backgroundColor: colores.superficie,
    overflow: 'hidden',
  },
  relleno: {
    height: '100%',
    borderRadius: radios.pill,
    backgroundColor: colores.acento,
  },
});
