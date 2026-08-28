import { Pressable, StyleSheet, Text } from 'react-native';

import { colores, espaciado, radios, tipografia } from '@/theme/tokens';

interface Props {
  texto: string;
  emoji?: string;
  seleccionada: boolean;
  onPress: () => void;
}

export function Opcion({ texto, emoji, seleccionada, onPress }: Props) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.base, seleccionada && styles.seleccionada]}
    >
      {emoji ? <Text style={styles.emoji}>{emoji}</Text> : null}
      <Text style={[styles.texto, seleccionada && styles.textoSeleccionado]}>{texto}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espaciado.s,
    paddingVertical: espaciado.m,
    paddingHorizontal: espaciado.l,
    borderRadius: radios.m,
    backgroundColor: colores.superficie,
    borderWidth: 1,
    borderColor: colores.superficie,
  },
  seleccionada: {
    borderColor: colores.acento,
  },
  emoji: {
    fontSize: tipografia.subtitulo,
  },
  texto: {
    color: colores.texto,
    fontSize: tipografia.cuerpo,
    flexShrink: 1,
  },
  textoSeleccionado: {
    color: colores.acento,
    fontWeight: '600',
  },
});
