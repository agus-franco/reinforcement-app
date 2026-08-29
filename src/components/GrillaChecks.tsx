import { StyleSheet, Text, View } from 'react-native';

import type { DiaGrilla } from '@/logic/progreso';
import { colores, espaciado, radios } from '@/theme/tokens';

interface Props {
  filas: DiaGrilla[][];
}

export function GrillaChecks({ filas }: Props) {
  return (
    <View style={styles.contenedor}>
      {filas.map((fila, i) => (
        <View key={i} style={styles.fila}>
          {fila.map((dia) => (
            <View
              key={dia.fecha}
              style={[
                styles.celda,
                dia.completado && styles.celdaCompletada,
                dia.dorado && styles.celdaDorada,
              ]}
            >
              {dia.completado && <Text style={styles.check}>✓</Text>}
            </View>
          ))}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    gap: espaciado.xs,
  },
  fila: {
    flexDirection: 'row',
    gap: espaciado.xs,
  },
  celda: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: radios.m,
    backgroundColor: colores.superficie,
    alignItems: 'center',
    justifyContent: 'center',
  },
  celdaCompletada: {
    backgroundColor: colores.acento,
  },
  celdaDorada: {
    backgroundColor: colores.dorado,
  },
  check: {
    color: colores.fondo,
    fontSize: 12,
    fontWeight: '700',
  },
});
