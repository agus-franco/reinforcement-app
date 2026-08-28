import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { Circle, Svg } from 'react-native-svg';

import { colores } from '@/theme/tokens';

interface Props {
  /** 1 = tiempo completo restante, 0 = se acabó. */
  progreso: number;
  tamano?: number;
  children?: ReactNode;
}

const GROSOR = 4;

export function AnilloTiempo({ progreso, tamano = 64, children }: Props) {
  const radio = (tamano - GROSOR) / 2;
  const circunferencia = 2 * Math.PI * radio;
  const clamp = Math.max(0, Math.min(1, progreso));
  const offset = circunferencia * (1 - clamp);
  const centro = tamano / 2;

  return (
    <View style={{ width: tamano, height: tamano }}>
      <Svg width={tamano} height={tamano}>
        <Circle cx={centro} cy={centro} r={radio} stroke={colores.superficie} strokeWidth={GROSOR} fill="none" />
        <Circle
          cx={centro}
          cy={centro}
          r={radio}
          stroke={colores.acento}
          strokeWidth={GROSOR}
          fill="none"
          strokeDasharray={`${circunferencia} ${circunferencia}`}
          strokeDashoffset={offset}
          strokeLinecap="round"
          rotation={-90}
          origin={`${centro}, ${centro}`}
        />
      </Svg>
      {children ? <View style={styles.overlay}>{children}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
