import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { AppState, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { AnilloTiempo } from '@/components/AnilloTiempo';
import { Boton } from '@/components/Boton';
import { esCorrecto } from '@/logic/frase';
import { useStore } from '@/state/store';
import { DURACION_SEG, META_REPETICIONES, type Intensidad, type ResumenSesion } from '@/state/tipos';
import { colores, espaciado, radios, tipografia } from '@/theme/tokens';

type Fase = 'selector' | 'escribiendo' | 'resumen';

const INTENSIDADES: { valor: Intensidad; nombre: string }[] = [
  { valor: 'despacio', nombre: 'Despacio' },
  { valor: 'moderado', nombre: 'Moderado' },
  { valor: 'intenso', nombre: 'Intenso' },
  { valor: 'profundo', nombre: 'Profundo' },
];

export default function SesionScreen() {
  const frases = useStore((s) => s.frases);
  const fraseActivaId = useStore((s) => s.fraseActivaId);
  const intensidadDefault = useStore((s) => s.intensidadDefault);
  const iniciarSesion = useStore((s) => s.iniciarSesion);
  const registrarRepeticion = useStore((s) => s.registrarRepeticion);
  const finalizarSesion = useStore((s) => s.finalizarSesion);

  const fraseActiva = frases.find((f) => f.id === fraseActivaId);

  const [fase, setFase] = useState<Fase>('selector');
  const [intensidad, setIntensidad] = useState<Intensidad>(intensidadDefault);
  const [indice, setIndice] = useState(0);
  const [progresoTiempo, setProgresoTiempo] = useState(1);
  const [restanteSeg, setRestanteSeg] = useState(0);
  const [resumen, setResumen] = useState<ResumenSesion | null>(null);

  const inputRef = useRef<TextInput>(null);
  const finTsRef = useRef(0);
  const duracionMsRef = useRef(0);
  const pausadoDesdeRef = useRef<number | null>(null);
  const tiempoAgotadoRef = useRef(false);
  const indiceRef = useRef(0);

  useEffect(() => {
    if (fase !== 'escribiendo') return;

    const intervalo = setInterval(() => {
      const restanteMs = Math.max(0, finTsRef.current - Date.now());
      setProgresoTiempo(duracionMsRef.current > 0 ? restanteMs / duracionMsRef.current : 0);
      setRestanteSeg(Math.ceil(restanteMs / 1000));
      if (restanteMs <= 0 && !tiempoAgotadoRef.current) {
        tiempoAgotadoRef.current = true;
        if (indiceRef.current === 0) {
          cerrarSesion();
        }
      }
    }, 250);

    const suscripcion = AppState.addEventListener('change', (estado) => {
      if (estado !== 'active') {
        pausadoDesdeRef.current = Date.now();
      } else if (pausadoDesdeRef.current !== null) {
        finTsRef.current += Date.now() - pausadoDesdeRef.current;
        pausadoDesdeRef.current = null;
      }
    });

    return () => {
      clearInterval(intervalo);
      suscripcion.remove();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fase]);

  function empezarSesion() {
    duracionMsRef.current = DURACION_SEG[intensidad] * 1000;
    finTsRef.current = Date.now() + duracionMsRef.current;
    tiempoAgotadoRef.current = false;
    pausadoDesdeRef.current = null;
    indiceRef.current = 0;
    setProgresoTiempo(1);
    setRestanteSeg(DURACION_SEG[intensidad]);
    setIndice(0);
    iniciarSesion(intensidad);
    setFase('escribiendo');
    setTimeout(() => inputRef.current?.focus(), 50);
  }

  function cerrarSesion() {
    const r = finalizarSesion();
    setResumen(r);
    setFase('resumen');
  }

  function onChangeText(t: string) {
    if (!fraseActiva) return;
    const letra = t.slice(-1);
    if (!letra) return;

    const esperada = fraseActiva.texto[indiceRef.current];
    if (esCorrecto(esperada, letra)) {
      const nuevoIndice = indiceRef.current + 1;
      Haptics.selectionAsync();

      if (nuevoIndice >= fraseActiva.texto.length) {
        registrarRepeticion();
        indiceRef.current = 0;
        setIndice(0);
        if (tiempoAgotadoRef.current) {
          cerrarSesion();
        }
      } else {
        indiceRef.current = nuevoIndice;
        setIndice(nuevoIndice);
      }
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    }
  }

  if (!fraseActiva) {
    return <View style={styles.contenedor} />;
  }

  if (fase === 'selector') {
    return (
      <View style={styles.contenedor}>
        <Text style={styles.titulo}>¿Cuánto querés escribir hoy?</Text>
        <View style={styles.opcionesIntensidad}>
          {INTENSIDADES.map((i) => (
            <Pressable
              key={i.valor}
              onPress={() => setIntensidad(i.valor)}
              style={[styles.opcionIntensidad, intensidad === i.valor && styles.opcionIntensidadSeleccionada]}
            >
              <Text
                style={[styles.opcionIntensidadTexto, intensidad === i.valor && styles.opcionIntensidadTextoSeleccionado]}
              >
                {i.nombre}
              </Text>
              <Text style={styles.opcionIntensidadDuracion}>{DURACION_SEG[i.valor] / 60} min</Text>
            </Pressable>
          ))}
        </View>
        <Boton texto="Empezar" onPress={empezarSesion} />
        <Text style={styles.volver} onPress={() => router.back()}>
          ← Volver
        </Text>
      </View>
    );
  }

  if (fase === 'escribiendo') {
    const repeticionesHoy = fraseActiva.repeticiones;
    return (
      <View style={styles.contenedor}>
        <View style={styles.encabezado}>
          <AnilloTiempo progreso={progresoTiempo} tamano={72}>
            <Text style={styles.tiempoRestante}>{formatoTiempo(restanteSeg)}</Text>
          </AnilloTiempo>
          <Pressable onPress={cerrarSesion} hitSlop={12}>
            <Text style={styles.cerrar}>✕</Text>
          </Pressable>
        </View>

        <View style={styles.centro}>
          <FraseFantasma texto={fraseActiva.texto} indice={indice} />
        </View>

        <View style={styles.contador}>
          <Text style={styles.contadorGrande}>{repeticionesHoy}</Text>
          <Text style={styles.contadorChico}>
            {Math.min(repeticionesHoy, META_REPETICIONES)}/{META_REPETICIONES}
          </Text>
        </View>

        <TextInput
          ref={inputRef}
          value=""
          onChangeText={onChangeText}
          autoFocus
          autoCorrect={false}
          autoComplete="off"
          autoCapitalize="none"
          spellCheck={false}
          contextMenuHidden
          caretHidden
          keyboardType={Platform.OS === 'android' ? 'visible-password' : 'default'}
          onBlur={() => inputRef.current?.focus()}
          style={styles.inputOculto}
        />
      </View>
    );
  }

  return (
    <View style={styles.contenedor}>
      <Text style={styles.titulo}>
        {resumen && resumen.repeticionesHoy > 0 ? '¡Listo por hoy!' : 'Sesión cerrada'}
      </Text>
      {resumen && (
        <View style={styles.resumen}>
          <Text style={styles.resumenLinea}>Repeticiones en esta sesión: {resumen.repeticionesHoy}</Text>
          <Text style={styles.resumenLinea}>
            Frase: {resumen.totalFrase}/{resumen.metaFrase}
          </Text>
          <Text style={styles.resumenLinea}>Racha: {resumen.rachaActual} días</Text>
          {resumen.fraseGrabada && <Text style={styles.resumenDestacado}>🎉 ¡Frase grabada!</Text>}
        </View>
      )}
      <Boton texto="Volver" onPress={() => router.replace('/')} />
    </View>
  );
}

function formatoTiempo(segundos: number): string {
  const m = Math.floor(segundos / 60);
  const s = segundos % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function FraseFantasma({ texto, indice }: { texto: string; indice: number }) {
  return (
    <Text style={styles.frase}>
      <Text style={styles.fraseEncendida}>{texto.slice(0, indice)}</Text>
      <Text style={styles.fraseFantasma}>{texto.slice(indice)}</Text>
    </Text>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    flex: 1,
    backgroundColor: colores.fondo,
    padding: espaciado.l,
    justifyContent: 'center',
    gap: espaciado.l,
  },
  titulo: {
    color: colores.texto,
    fontSize: tipografia.subtitulo,
    fontWeight: '700',
    textAlign: 'center',
  },
  opcionesIntensidad: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: espaciado.s,
    justifyContent: 'center',
  },
  opcionIntensidad: {
    paddingVertical: espaciado.m,
    paddingHorizontal: espaciado.m,
    borderRadius: radios.m,
    backgroundColor: colores.superficie,
    borderWidth: 1,
    borderColor: colores.superficie,
    alignItems: 'center',
    minWidth: 90,
  },
  opcionIntensidadSeleccionada: {
    borderColor: colores.acento,
  },
  opcionIntensidadTexto: {
    color: colores.texto,
    fontSize: tipografia.cuerpo,
    fontWeight: '600',
  },
  opcionIntensidadTextoSeleccionado: {
    color: colores.acento,
  },
  opcionIntensidadDuracion: {
    color: colores.textoSuave,
    fontSize: tipografia.chico,
    marginTop: 2,
  },
  volver: {
    color: colores.acento,
    fontSize: tipografia.chico,
    textAlign: 'center',
  },
  encabezado: {
    position: 'absolute',
    top: espaciado.l,
    left: espaciado.l,
    right: espaciado.l,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cerrar: {
    color: colores.textoSuave,
    fontSize: tipografia.subtitulo,
  },
  tiempoRestante: {
    color: colores.textoSuave,
    fontSize: tipografia.chico,
    fontVariant: ['tabular-nums'],
  },
  centro: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  frase: {
    fontSize: tipografia.frase,
    textAlign: 'center',
    lineHeight: tipografia.frase * 1.4,
  },
  fraseEncendida: {
    color: colores.acento,
  },
  fraseFantasma: {
    color: colores.textoSuave,
  },
  contador: {
    alignItems: 'center',
  },
  contadorGrande: {
    color: colores.texto,
    fontSize: tipografia.titulo,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  contadorChico: {
    color: colores.textoSuave,
    fontSize: tipografia.chico,
    fontVariant: ['tabular-nums'],
  },
  inputOculto: {
    position: 'absolute',
    opacity: 0,
    height: 1,
    width: 1,
  },
  resumen: {
    gap: espaciado.s,
    alignItems: 'center',
  },
  resumenLinea: {
    color: colores.textoSuave,
    fontSize: tipografia.cuerpo,
  },
  resumenDestacado: {
    color: colores.dorado,
    fontSize: tipografia.subtitulo,
    fontWeight: '700',
    marginTop: espaciado.s,
  },
});
