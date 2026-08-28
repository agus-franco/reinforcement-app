import { Pressable, StyleSheet, Text } from 'react-native';

import { colores, espaciado, radios, tipografia } from '@/theme/tokens';

interface Props {
  texto: string;
  onPress: () => void;
  variante?: 'primario' | 'secundario';
  deshabilitado?: boolean;
}

export function Boton({ texto, onPress, variante = 'primario', deshabilitado = false }: Props) {
  const esPrimario = variante === 'primario';
  return (
    <Pressable
      onPress={onPress}
      disabled={deshabilitado}
      style={({ pressed }) => [
        styles.base,
        esPrimario ? styles.primario : styles.secundario,
        deshabilitado && styles.deshabilitado,
        pressed && !deshabilitado && styles.presionado,
      ]}
    >
      <Text style={[styles.texto, esPrimario ? styles.textoPrimario : styles.textoSecundario]}>{texto}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingVertical: espaciado.m,
    paddingHorizontal: espaciado.l,
    borderRadius: radios.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primario: {
    backgroundColor: colores.acento,
  },
  secundario: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colores.textoSuave,
  },
  deshabilitado: {
    opacity: 0.4,
  },
  presionado: {
    opacity: 0.8,
  },
  texto: {
    fontSize: tipografia.cuerpo,
    fontWeight: '600',
  },
  textoPrimario: {
    color: colores.fondo,
  },
  textoSecundario: {
    color: colores.texto,
  },
});
