import { router } from 'expo-router';
import { useRef, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { BarraProgreso } from '@/components/BarraProgreso';
import { Boton } from '@/components/Boton';
import { GrillaChecks } from '@/components/GrillaChecks';
import { Personaje } from '@/components/Personaje';
import { TarjetaCompartir } from '@/components/TarjetaCompartir';
import { objetivoPorId } from '@/data/objetivos';
import { compartirVista } from '@/logic/compartir';
import { hoyLocal } from '@/logic/fechas';
import { nivelAlcanzado, proximoNivel, UMBRAL_FINAL } from '@/logic/niveles';
import { diasCompletados, grillaDias } from '@/logic/progreso';
import { useStore } from '@/state/store';
import { usePersonaje } from '@/state/usePersonaje';
import type { EstadoPersonaje } from '@/state/tipos';
import { colores, espaciado, tipografia } from '@/theme/tokens';

const SALUDO_POR_ESTADO: Record<EstadoPersonaje, string> = {
  radiante: 'Ya escribiste hoy',
  feliz: 'Hoy es un buen día para escribir',
  preocupado: 'Todavía no escribiste hoy',
  triste: 'Se cortó la racha, pero podés empezar de nuevo',
};

export default function HomeScreen() {
  const rachaActual = useStore((s) => s.rachaActual);
  const frases = useStore((s) => s.frases);
  const fraseActivaId = useStore((s) => s.fraseActivaId);
  const sesiones = useStore((s) => s.sesiones);
  const personajeEstado = usePersonaje();

  const tarjetaRef = useRef<View>(null);
  const [compartiendo, setCompartiendo] = useState(false);

  const fraseActiva = frases.find((f) => f.id === fraseActivaId);
  const objetivo = fraseActiva ? objetivoPorId(fraseActiva.objetivoId) : undefined;
  const nivelActivo = fraseActiva ? nivelAlcanzado(fraseActiva.repeticiones) : null;
  const siguienteNivel = fraseActiva ? proximoNivel(fraseActiva.repeticiones) : null;
  const metaNivel = siguienteNivel?.umbral ?? UMBRAL_FINAL;

  const hoy = hoyLocal();
  const puntosTotales = sesiones.reduce((sum, s) => sum + s.repeticiones, 0);
  const puntosHoy = sesiones.filter((s) => s.fecha === hoy).reduce((sum, s) => sum + s.repeticiones, 0);
  const grilla = grillaDias(sesiones, hoy, 3);

  async function compartir() {
    if (compartiendo) return;
    setCompartiendo(true);
    try {
      await compartirVista(tarjetaRef);
    } catch {
      // el usuario canceló o algo falló; no rompemos la pantalla
    } finally {
      setCompartiendo(false);
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.contenedor}>
      <View style={styles.header}>
        <Text style={styles.puntosNumero}>{puntosTotales}</Text>
        <Text style={styles.puntosTexto}>puntos</Text>
      </View>

      <Personaje estado={personajeEstado} tamano={100} />
      <Text style={styles.saludo}>{SALUDO_POR_ESTADO[personajeEstado]}</Text>

      <View style={styles.rachaFila}>
        <Text style={styles.rachaNumero}>🔥 {rachaActual}</Text>
        <Text style={styles.rachaTexto}>{rachaActual === 1 ? 'día' : 'días'} de racha</Text>
      </View>

      {fraseActiva && (
        <View style={styles.frase}>
          {objetivo && <Text style={styles.objetivoTag}>{objetivo.emoji} {objetivo.nombre}</Text>}
          <Text style={styles.fraseTexto}>"{fraseActiva.texto}"</Text>

          {fraseActiva.grabada ? (
            <Text style={styles.nivelTexto}>🏅 Creencia grabada</Text>
          ) : (
            <>
              {nivelActivo && <Text style={styles.nivelTexto}>Nivel: {nivelActivo.nombre}</Text>}
              <View style={styles.fraseProgresoFila}>
                <View style={styles.fraseProgresoBarra}>
                  <BarraProgreso valor={fraseActiva.repeticiones} meta={metaNivel} />
                </View>
                <Text style={styles.fraseProgresoTexto}>
                  {fraseActiva.repeticiones}/{metaNivel}
                </Text>
              </View>
              {siguienteNivel && <Text style={styles.proximoNivelTexto}>Próximo nivel: {siguienteNivel.nombre}</Text>}
            </>
          )}
        </View>
      )}

      <View style={styles.grillaContenedor}>
        <GrillaChecks filas={grilla} />
      </View>

      <View style={styles.tarjetaOculta}>
        <TarjetaCompartir
          ref={tarjetaRef}
          formato="9:16"
          modo={{ tipo: 'sesion', racha: rachaActual, repeticionesHoy: puntosHoy, dias: diasCompletados(sesiones) }}
        />
      </View>

      <View style={styles.botones}>
        <Boton texto="Compartir" variante="secundario" onPress={compartir} deshabilitado={compartiendo} />
        <Boton texto="Comenzar" onPress={() => router.push('/sesion')} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colores.fondo,
    padding: espaciado.l,
    gap: espaciado.l,
  },
  header: {
    alignItems: 'center',
  },
  puntosNumero: {
    color: colores.texto,
    fontSize: tipografia.titulo,
    fontWeight: '700',
  },
  puntosTexto: {
    color: colores.textoSuave,
    fontSize: tipografia.chico,
    textTransform: 'uppercase',
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
    alignItems: 'center',
  },
  objetivoTag: {
    color: colores.textoSuave,
    fontSize: tipografia.chico,
  },
  nivelTexto: {
    color: colores.dorado,
    fontSize: tipografia.chico,
    fontWeight: '600',
  },
  proximoNivelTexto: {
    color: colores.textoSuave,
    fontSize: tipografia.chico,
  },
  fraseTexto: {
    color: colores.acento,
    fontSize: tipografia.cuerpo,
    textAlign: 'center',
  },
  fraseProgresoFila: {
    width: '100%',
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
  grillaContenedor: {
    width: '100%',
    maxWidth: 260,
  },
  tarjetaOculta: {
    position: 'absolute',
    left: -9999,
    top: 0,
  },
  botones: {
    width: '100%',
    gap: espaciado.s,
  },
});
