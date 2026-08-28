import { StyleSheet, Text, View } from 'react-native';
import { Circle, Line, Svg } from 'react-native-svg';

import type { DiaCompletado } from '@/logic/progreso';
import { pseudoAleatorio } from '@/logic/progreso';
import { colores, tipografia } from '@/theme/tokens';

interface Props {
  dias: DiaCompletado[];
  ancho?: number;
  alto?: number;
}

const MARGEN = 16;

export function Constelacion({ dias, ancho = 300, alto = 160 }: Props) {
  if (dias.length === 0) {
    return (
      <View style={[styles.vacioContenedor, { width: ancho, height: alto }]}>
        <Text style={styles.vacioTexto}>Tu constelación empieza con el primer día</Text>
      </View>
    );
  }

  const puntos = dias.map((d, i) => ({
    x: MARGEN + pseudoAleatorio(i * 2 + 1) * (ancho - MARGEN * 2),
    y: MARGEN + pseudoAleatorio(i * 2 + 2) * (alto - MARGEN * 2),
    dorado: d.dorado,
  }));

  return (
    <Svg width={ancho} height={alto}>
      {puntos.slice(1).map((p, i) => (
        <Line
          key={`linea-${i}`}
          x1={puntos[i].x}
          y1={puntos[i].y}
          x2={p.x}
          y2={p.y}
          stroke={colores.superficie}
          strokeWidth={1}
        />
      ))}
      {puntos.map((p, i) => (
        <Circle
          key={`punto-${i}`}
          cx={p.x}
          cy={p.y}
          r={p.dorado ? 5 : 3.5}
          fill={p.dorado ? colores.dorado : colores.acento}
        />
      ))}
    </Svg>
  );
}

const styles = StyleSheet.create({
  vacioContenedor: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  vacioTexto: {
    color: colores.textoSuave,
    fontSize: tipografia.chico,
    textAlign: 'center',
  },
});
