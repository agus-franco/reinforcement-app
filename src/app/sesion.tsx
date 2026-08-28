import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { AppState, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { AnilloTiempo } from '@/components/AnilloTiempo';
import { BarraProgreso } from '@/components/BarraProgreso';
import { Boton } from '@/components/Boton';
import { FondoRespirando } from '@/components/FondoRespirando';
import { Particulas, type Rafaga } from '@/components/Particulas';
import { Personaje } from '@/components/Personaje';
import { SelectorIntensidad } from '@/components/SelectorIntensidad';
import { esCorrecto } from '@/logic/frase';
import { useStore } from '@/state/store';
import { usePersonaje } from '@/state/usePersonaje';
import { DURACION_SEG, META_REPETICIONES, type Intensidad, type ResumenSesion } from '@/state/tipos';
import { colores, espaciado, tipografia } from '@/theme/tokens';

const LINEAS_REFUERZO: ((r: ResumenSesion) => string)[] = [
  (r) => `Día ${r.rachaActual}. Tu frase ya salió ${r.totalFrase} veces de tus dedos.`,
  (r) => `Escribiste ${r.repeticionesHoy} ${r.repeticionesHoy === 1 ? 'vez' : 'veces'} hoy. Cada una cuenta.`,
  (r) => `Llevás ${r.totalFrase} de ${r.metaFrase} repeticiones. Vas construyendo algo real.`,
  (r) => `${r.rachaActual} ${r.rachaActual === 1 ? 'día' : 'días'} seguidos reprogramando tu cabeza.`,
];

function lineaRefuerzo(r: ResumenSesion): string {
  const generador = LINEAS_REFUERZO[Math.floor(Math.random() * LINEAS_REFUERZO.length)];
  return generador(r);
}

type Fase = 'selector' | 'escribiendo' | 'resumen';

export default function SesionScreen() {
  const frases = useStore((s) => s.frases);
  const fraseActivaId = useStore((s) => s.fraseActivaId);
  const intensidadDefault = useStore((s) => s.intensidadDefault);
  const iniciarSesion = useStore((s) => s.iniciarSesion);
  const registrarRepeticion = useStore((s) => s.registrarRepeticion);
  const finalizarSesion = useStore((s) => s.finalizarSesion);
  const hapticsActivado = useStore((s) => s.hapticsActivado);
  const personajeEstado = usePersonaje();

  const fraseActiva = frases.find((f) => f.id === fraseActivaId);

  const [fase, setFase] = useState<Fase>('selector');
  const [intensidad, setIntensidad] = useState<Intensidad>(intensidadDefault);
  const [indice, setIndice] = useState(0);
  const [progresoTiempo, setProgresoTiempo] = useState(1);
  const [restanteSeg, setRestanteSeg] = useState(0);
  const [resumen, setResumen] = useState<ResumenSesion | null>(null);
  const [rafaga, setRafaga] = useState<Rafaga | null>(null);
  const linea = useMemo(() => (resumen ? lineaRefuerzo(resumen) : ''), [resumen]);

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
      if (hapticsActivado) Haptics.selectionAsync();

      if (nuevoIndice >= fraseActiva.texto.length) {
        const { dorada } = registrarRepeticion();
        setRafaga({ id: Date.now(), dorado: dorada });
        indiceRef.current = 0;
        setIndice(0);
        if (tiempoAgotadoRef.current) {
          cerrarSesion();
        }
      } else {
        indiceRef.current = nuevoIndice;
        setIndice(nuevoIndice);
      }
    } else if (hapticsActivado) {
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
        <SelectorIntensidad valor={intensidad} onCambiar={setIntensidad} />
        <Boton texto="Empezar" onPress={empezarSesion} />
        <Text style={styles.volver} onPress={() => router.replace('/')}>
          ← Volver
        </Text>
      </View>
    );
  }

  if (fase === 'escribiendo') {
    const repeticionesHoy = fraseActiva.repeticiones;
    return (
      <View style={styles.contenedor}>
        <FondoRespirando />

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
          <Particulas rafaga={rafaga} />
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

  if (!resumen || resumen.repeticionesHoy === 0) {
    return (
      <View style={styles.contenedor}>
        <Text style={styles.titulo}>Sesión cerrada</Text>
        <Text style={styles.subtitulo}>No pasa nada, volvé cuando quieras.</Text>
        <Boton texto="Volver" onPress={() => router.replace('/')} />
      </View>
    );
  }

  if (resumen.fraseRecienGrabada) {
    return (
      <View style={styles.contenedor}>
        <Text style={styles.celebracionEmoji}>🎉</Text>
        <Text style={styles.titulo}>¡Frase grabada!</Text>
        <Text style={styles.fraseCelebracion}>"{fraseActiva.texto}"</Text>
        <Text style={styles.subtitulo}>100 repeticiones. Ahora es parte tuya.</Text>
        <Boton texto="Volver" onPress={() => router.replace('/')} />
      </View>
    );
  }

  return (
    <View style={styles.contenedor}>
      <Personaje estado={personajeEstado} tamano={80} />
      <Text style={styles.titulo}>¡Listo por hoy!</Text>

      <View style={styles.resumen}>
        <View style={styles.filaProgreso}>
          <Text style={styles.resumenLinea}>Tu frase</Text>
          <Text style={styles.resumenLinea}>
            {resumen.totalFrase}/{resumen.metaFrase}
          </Text>
        </View>
        <BarraProgreso valor={resumen.totalFrase} meta={resumen.metaFrase} />
      </View>

      <View style={styles.rachaFila}>
        <Text style={styles.rachaNumero}>🔥 {resumen.rachaActual}</Text>
        <Text style={styles.resumenLinea}>{resumen.rachaActual === 1 ? 'día' : 'días'} seguidos</Text>
      </View>

      {resumen.esRecordPersonal && <Text style={styles.badge}>⭐ ¡Tu mejor sesión!</Text>}
      {resumen.huboDoradas && <Text style={styles.badge}>✨ Encontraste una sinapsis dorada</Text>}

      <Text style={styles.linea}>{linea}</Text>

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
  subtitulo: {
    color: colores.textoSuave,
    fontSize: tipografia.cuerpo,
    textAlign: 'center',
  },
  resumen: {
    gap: espaciado.s,
    width: '100%',
  },
  resumenLinea: {
    color: colores.textoSuave,
    fontSize: tipografia.cuerpo,
  },
  filaProgreso: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  rachaFila: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
    gap: espaciado.s,
  },
  rachaNumero: {
    color: colores.texto,
    fontSize: tipografia.subtitulo,
    fontWeight: '700',
  },
  badge: {
    color: colores.dorado,
    fontSize: tipografia.cuerpo,
    fontWeight: '600',
    textAlign: 'center',
  },
  linea: {
    color: colores.textoSuave,
    fontSize: tipografia.chico,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  celebracionEmoji: {
    fontSize: tipografia.titulo * 1.5,
    textAlign: 'center',
  },
  fraseCelebracion: {
    color: colores.acento,
    fontSize: tipografia.subtitulo,
    fontWeight: '600',
    textAlign: 'center',
  },
});
