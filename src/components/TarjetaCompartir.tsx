import { forwardRef } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import type { DiaCompletado } from '@/logic/progreso';
import { colores, espaciado, tipografia } from '@/theme/tokens';
import { Constelacion } from './Constelacion';

export type ModoTarjeta =
  | { tipo: 'sesion'; racha: number; repeticionesHoy: number; dias: DiaCompletado[] }
  | { tipo: 'hito'; racha: number; dias: DiaCompletado[] }
  | { tipo: 'grabada'; fraseTexto: string; diasParaGrabar: number };

interface Props {
  modo: ModoTarjeta;
  formato: '9:16' | '1:1';
}

const TAMANOS = {
  '9:16': { width: 360, height: 640 },
  '1:1': { width: 360, height: 360 },
} as const;

export const TarjetaCompartir = forwardRef<View, Props>(function TarjetaCompartir({ modo, formato }, ref) {
  const { width, height } = TAMANOS[formato];

  return (
    <View ref={ref} style={[styles.tarjeta, { width, height }]}>
      <View style={styles.contenido}>
        {modo.tipo === 'sesion' && (
          <>
            <Text style={styles.rachaGrande}>Día {modo.racha}</Text>
            <Text style={styles.subtitulo}>{modo.repeticionesHoy} repeticiones hoy</Text>
            <View style={styles.constelacionChica}>
              <Constelacion dias={modo.dias} ancho={220} alto={120} />
            </View>
          </>
        )}

        {modo.tipo === 'hito' && (
          <>
            <Text style={styles.hitoEmoji}>🔥</Text>
            <Text style={styles.rachaGrande}>{modo.racha} días</Text>
            <Text style={styles.subtitulo}>seguidos reprogramando mi cabeza</Text>
            <View style={styles.constelacionGrande}>
              <Constelacion dias={modo.dias} ancho={280} alto={160} />
            </View>
          </>
        )}

        {modo.tipo === 'grabada' && (
          <>
            <Text style={styles.celebracionEmoji}>🎉</Text>
            <Text style={styles.fraseGrande}>"{modo.fraseTexto}"</Text>
            <Text style={styles.subtitulo}>grabada en {modo.diasParaGrabar} días</Text>
          </>
        )}
      </View>

      <Text style={styles.marca}>Rewire</Text>
    </View>
  );
});

const styles = StyleSheet.create({
  tarjeta: {
    backgroundColor: colores.fondo,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: espaciado.xl,
    paddingHorizontal: espaciado.l,
  },
  contenido: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: espaciado.s,
  },
  rachaGrande: {
    color: colores.texto,
    fontSize: 40,
    fontWeight: '700',
  },
  subtitulo: {
    color: colores.textoSuave,
    fontSize: tipografia.cuerpo,
    textAlign: 'center',
  },
  hitoEmoji: {
    fontSize: 48,
  },
  celebracionEmoji: {
    fontSize: 48,
  },
  fraseGrande: {
    color: colores.acento,
    fontSize: tipografia.subtitulo,
    fontWeight: '700',
    textAlign: 'center',
    paddingHorizontal: espaciado.m,
  },
  constelacionChica: {
    marginTop: espaciado.m,
  },
  constelacionGrande: {
    marginTop: espaciado.m,
  },
  marca: {
    color: colores.textoSuave,
    fontSize: tipografia.chico,
    letterSpacing: 1,
  },
});
