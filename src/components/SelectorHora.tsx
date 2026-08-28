import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colores, espaciado, radios, tipografia } from '@/theme/tokens';

interface Props {
  valor: string; // 'HH:mm'
  onCambiar: (valor: string) => void;
}

const PASO_MINUTOS = 5;

function pad(n: number): string {
  return n.toString().padStart(2, '0');
}

function parsear(valor: string): { hora: number; minuto: number } {
  const [h, m] = valor.split(':').map(Number);
  return { hora: h || 0, minuto: m || 0 };
}

export function SelectorHora({ valor, onCambiar }: Props) {
  const { hora, minuto } = parsear(valor);

  function cambiarHora(delta: number) {
    const nuevaHora = (hora + delta + 24) % 24;
    onCambiar(`${pad(nuevaHora)}:${pad(minuto)}`);
  }

  function cambiarMinuto(delta: number) {
    const nuevoMinuto = (minuto + delta + 60) % 60;
    onCambiar(`${pad(hora)}:${pad(nuevoMinuto)}`);
  }

  return (
    <View style={styles.fila}>
      <Stepper etiqueta="Hora" valor={pad(hora)} onMenos={() => cambiarHora(-1)} onMas={() => cambiarHora(1)} />
      <Text style={styles.dosPuntos}>:</Text>
      <Stepper
        etiqueta="Min"
        valor={pad(minuto)}
        onMenos={() => cambiarMinuto(-PASO_MINUTOS)}
        onMas={() => cambiarMinuto(PASO_MINUTOS)}
      />
    </View>
  );
}

function Stepper({
  etiqueta,
  valor,
  onMenos,
  onMas,
}: {
  etiqueta: string;
  valor: string;
  onMenos: () => void;
  onMas: () => void;
}) {
  return (
    <View style={styles.stepper}>
      <Text style={styles.etiqueta}>{etiqueta}</Text>
      <View style={styles.controles}>
        <Pressable onPress={onMenos} style={styles.boton} hitSlop={8}>
          <Text style={styles.botonTexto}>–</Text>
        </Pressable>
        <Text style={styles.valor}>{valor}</Text>
        <Pressable onPress={onMas} style={styles.boton} hitSlop={8}>
          <Text style={styles.botonTexto}>+</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  fila: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: espaciado.s,
  },
  dosPuntos: {
    color: colores.texto,
    fontSize: tipografia.titulo,
    marginBottom: espaciado.m,
  },
  stepper: {
    alignItems: 'center',
    gap: espaciado.xs,
  },
  etiqueta: {
    color: colores.textoSuave,
    fontSize: tipografia.chico,
  },
  controles: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espaciado.s,
    backgroundColor: colores.superficie,
    borderRadius: radios.m,
    paddingHorizontal: espaciado.s,
  },
  boton: {
    paddingHorizontal: espaciado.s,
    paddingVertical: espaciado.s,
  },
  botonTexto: {
    color: colores.acento,
    fontSize: tipografia.subtitulo,
    fontWeight: '700',
  },
  valor: {
    color: colores.texto,
    fontSize: tipografia.titulo,
    fontVariant: ['tabular-nums'],
    minWidth: 44,
    textAlign: 'center',
  },
});
