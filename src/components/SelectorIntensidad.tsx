import { Pressable, StyleSheet, Text, View } from 'react-native';

import { DURACION_SEG, type Intensidad } from '@/state/tipos';
import { colores, espaciado, radios, tipografia } from '@/theme/tokens';

interface Props {
  valor: Intensidad;
  onCambiar: (valor: Intensidad) => void;
}

const INTENSIDADES: { valor: Intensidad; nombre: string }[] = [
  { valor: 'despacio', nombre: 'Despacio' },
  { valor: 'moderado', nombre: 'Moderado' },
  { valor: 'intenso', nombre: 'Intenso' },
  { valor: 'profundo', nombre: 'Profundo' },
];

export function SelectorIntensidad({ valor, onCambiar }: Props) {
  return (
    <View style={styles.opciones}>
      {INTENSIDADES.map((i) => (
        <Pressable
          key={i.valor}
          onPress={() => onCambiar(i.valor)}
          style={[styles.opcion, valor === i.valor && styles.opcionSeleccionada]}
        >
          <Text style={[styles.texto, valor === i.valor && styles.textoSeleccionado]}>{i.nombre}</Text>
          <Text style={styles.duracion}>{DURACION_SEG[i.valor] / 60} min</Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  opciones: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: espaciado.s,
    justifyContent: 'center',
  },
  opcion: {
    paddingVertical: espaciado.m,
    paddingHorizontal: espaciado.m,
    borderRadius: radios.m,
    backgroundColor: colores.superficie,
    borderWidth: 1,
    borderColor: colores.superficie,
    alignItems: 'center',
    minWidth: 90,
  },
  opcionSeleccionada: {
    borderColor: colores.acento,
  },
  texto: {
    color: colores.texto,
    fontSize: tipografia.cuerpo,
    fontWeight: '600',
  },
  textoSeleccionado: {
    color: colores.acento,
  },
  duracion: {
    color: colores.textoSuave,
    fontSize: tipografia.chico,
    marginTop: 2,
  },
});
