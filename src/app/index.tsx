import { Redirect, router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { BarraProgreso } from '@/components/BarraProgreso';
import { Boton } from '@/components/Boton';
import { Personaje } from '@/components/Personaje';
import { objetivoPorId } from '@/data/objetivos';
import { useStore } from '@/state/store';
import { usePersonaje } from '@/state/usePersonaje';
import type { EstadoPersonaje } from '@/state/tipos';
import { useHidratado } from '@/state/useHidratado';
import { colores, espaciado, tipografia } from '@/theme/tokens';

const SALUDO_POR_ESTADO: Record<EstadoPersonaje, string> = {
  radiante: 'Ya escribiste hoy',
  feliz: 'Hoy es un buen día para escribir',
  preocupado: 'Todavía no escribiste hoy',
  triste: 'Se cortó la racha, pero podés empezar de nuevo',
};

export default function HomeScreen() {
  const hidratado = useHidratado();
  const onboardingCompleto = useStore((s) => s.onboardingCompleto);
  const rachaActual = useStore((s) => s.rachaActual);
  const frases = useStore((s) => s.frases);
  const fraseActivaId = useStore((s) => s.fraseActivaId);
  const personajeEstado = usePersonaje();

  if (!hidratado) {
    return <View style={styles.container} />;
  }

  if (!onboardingCompleto) {
    return <Redirect href="/onboarding" />;
  }

  const fraseActiva = frases.find((f) => f.id === fraseActivaId);
  const objetivo = fraseActiva ? objetivoPorId(fraseActiva.objetivoId) : undefined;

  return (
    <View style={styles.container}>
      <Text style={styles.progresoLink} onPress={() => router.push('/progreso')}>
        Progreso →
      </Text>

      <Personaje estado={personajeEstado} tamano={120} />
      <Text style={styles.saludo}>{SALUDO_POR_ESTADO[personajeEstado]}</Text>

      <View style={styles.rachaFila}>
        <Text style={styles.rachaNumero}>🔥 {rachaActual}</Text>
        <Text style={styles.rachaTexto}>{rachaActual === 1 ? 'día' : 'días'} de racha</Text>
      </View>

      {fraseActiva && (
        <View style={styles.frase}>
          <Text style={styles.fraseTexto}>
            {objetivo ? `${objetivo.emoji} ` : ''}"{fraseActiva.texto}"
          </Text>
          <View style={styles.fraseProgresoFila}>
            <View style={styles.fraseProgresoBarra}>
              <BarraProgreso valor={fraseActiva.repeticiones} meta={100} />
            </View>
            <Text style={styles.fraseProgresoTexto}>{fraseActiva.repeticiones}/100</Text>
          </View>
        </View>
      )}

      <Boton texto="Escribir ahora" onPress={() => router.push('/sesion')} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colores.fondo,
    padding: espaciado.l,
    gap: espaciado.l,
  },
  progresoLink: {
    position: 'absolute',
    top: espaciado.l,
    right: espaciado.l,
    color: colores.acento,
    fontSize: tipografia.chico,
  },
  saludo: {
    color: colores.texto,
    fontSize: tipografia.subtitulo,
    fontWeight: '600',
    textAlign: 'center',
  },
  rachaFila: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: espaciado.s,
  },
  rachaNumero: {
    color: colores.texto,
    fontSize: tipografia.titulo,
    fontWeight: '700',
  },
  rachaTexto: {
    color: colores.textoSuave,
    fontSize: tipografia.cuerpo,
  },
  frase: {
    width: '100%',
    gap: espaciado.s,
  },
  fraseTexto: {
    color: colores.acento,
    fontSize: tipografia.cuerpo,
    textAlign: 'center',
  },
  fraseProgresoFila: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espaciado.s,
  },
  fraseProgresoBarra: {
    flex: 1,
  },
  fraseProgresoTexto: {
    color: colores.textoSuave,
    fontSize: tipografia.chico,
    fontVariant: ['tabular-nums'],
  },
});
