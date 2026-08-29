import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { useStore } from '@/state/store';
import { colores, espaciado, radios, tipografia } from '@/theme/tokens';

type Periodo = 'diario' | 'semanal' | 'anual';

interface EntradaRanking {
  nombre: string;
  puntos: number;
  vos?: boolean;
}

// Datos de ejemplo: no hay backend ni otros usuarios reales todavía. Nunca se
// presentan como datos genuinos — ver banner de preview en la pantalla.
const EJEMPLOS: Record<Periodo, Omit<EntradaRanking, 'vos'>[]> = {
  diario: [
    { nombre: 'Caro', puntos: 41 },
    { nombre: 'Juli', puntos: 33 },
    { nombre: 'Male', puntos: 22 },
    { nombre: 'Nico', puntos: 15 },
    { nombre: 'Fran', puntos: 9 },
  ],
  semanal: [
    { nombre: 'Male', puntos: 210 },
    { nombre: 'Caro', puntos: 188 },
    { nombre: 'Vale', puntos: 150 },
    { nombre: 'Juli', puntos: 120 },
    { nombre: 'Tomi', puntos: 95 },
  ],
  anual: [
    { nombre: 'Vale', puntos: 3400 },
    { nombre: 'Male', puntos: 2980 },
    { nombre: 'Caro', puntos: 2510 },
    { nombre: 'Fran', puntos: 1870 },
    { nombre: 'Nico', puntos: 1200 },
  ],
};

const PERIODOS: { valor: Periodo; nombre: string }[] = [
  { valor: 'diario', nombre: 'Diario' },
  { valor: 'semanal', nombre: 'Semanal' },
  { valor: 'anual', nombre: 'Anual' },
];

export default function RankingScreen() {
  const [periodo, setPeriodo] = useState<Periodo>('semanal');
  const sesiones = useStore((s) => s.sesiones);

  const puntosReales = sesiones.reduce((sum, s) => sum + s.repeticiones, 0);

  const lista: EntradaRanking[] = [...EJEMPLOS[periodo], { nombre: 'Vos', puntos: puntosReales, vos: true }].sort(
    (a, b) => b.puntos - a.puntos,
  );

  return (
    <ScrollView contentContainerStyle={styles.contenedor}>
      <Text style={styles.titulo}>Ranking</Text>

      <View style={styles.banner}>
        <Text style={styles.bannerTexto}>
          👀 Vista previa — estos son datos de ejemplo. Vas a poder compararte con otros usuarios reales más adelante.
        </Text>
      </View>

      <View style={styles.periodos}>
        {PERIODOS.map((p) => (
          <Text
            key={p.valor}
            style={[styles.periodoTexto, periodo === p.valor && styles.periodoTextoActivo]}
            onPress={() => setPeriodo(p.valor)}
          >
            {p.nombre}
          </Text>
        ))}
      </View>

      <View style={styles.lista}>
        {lista.map((entrada, i) => (
          <View key={entrada.nombre} style={[styles.fila, entrada.vos && styles.filaVos]}>
            <Text style={styles.posicion}>#{i + 1}</Text>
            <Text style={[styles.nombre, entrada.vos && styles.nombreVos]}>{entrada.nombre}</Text>
            <Text style={styles.puntos}>{entrada.puntos} pts</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    flexGrow: 1,
    backgroundColor: colores.fondo,
    padding: espaciado.l,
    gap: espaciado.l,
  },
  titulo: {
    color: colores.texto,
    fontSize: tipografia.titulo,
    fontWeight: '700',
  },
  banner: {
    backgroundColor: colores.superficie,
    borderRadius: radios.m,
    padding: espaciado.m,
  },
  bannerTexto: {
    color: colores.textoSuave,
    fontSize: tipografia.chico,
  },
  periodos: {
    flexDirection: 'row',
    gap: espaciado.l,
  },
  periodoTexto: {
    color: colores.textoSuave,
    fontSize: tipografia.cuerpo,
    fontWeight: '600',
  },
  periodoTextoActivo: {
    color: colores.acento,
  },
  lista: {
    gap: espaciado.s,
  },
  fila: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espaciado.m,
    backgroundColor: colores.superficie,
    borderRadius: radios.m,
    padding: espaciado.m,
  },
  filaVos: {
    borderWidth: 1,
    borderColor: colores.acento,
  },
  posicion: {
    color: colores.textoSuave,
    fontSize: tipografia.cuerpo,
    fontVariant: ['tabular-nums'],
    width: 32,
  },
  nombre: {
    flex: 1,
    color: colores.texto,
    fontSize: tipografia.cuerpo,
  },
  nombreVos: {
    color: colores.acento,
    fontWeight: '700',
  },
  puntos: {
    color: colores.textoSuave,
    fontSize: tipografia.chico,
    fontVariant: ['tabular-nums'],
  },
});
