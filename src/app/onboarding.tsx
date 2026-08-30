import * as Notifications from 'expo-notifications';
import { Redirect, router } from 'expo-router';
import { useState } from 'react';
import { Platform, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { Boton } from '@/components/Boton';
import { Opcion } from '@/components/Opcion';
import { SelectorHora } from '@/components/SelectorHora';
import { objetivoPorId, OBJETIVOS } from '@/data/objetivos';
import { programarRecordatorioDiario } from '@/logic/notificaciones';
import { validarFrase } from '@/logic/validarFrase';
import { useStore } from '@/state/store';
import { useHidratado } from '@/state/useHidratado';
import { colores, espaciado, tipografia } from '@/theme/tokens';

type Paso = 1 | 2 | 3;

export default function OnboardingScreen() {
  const hidratado = useHidratado();
  const onboardingCompleto = useStore((s) => s.onboardingCompleto);
  const completarOnboarding = useStore((s) => s.completarOnboarding);

  const [paso, setPaso] = useState<Paso>(1);
  const [objetivoId, setObjetivoId] = useState<string | null>(null);
  const [escribiendoPropia, setEscribiendoPropia] = useState(false);
  const [fraseElegida, setFraseElegida] = useState<string | null>(null);
  const [fraseCustom, setFraseCustom] = useState('');
  const [hora, setHora] = useState('09:00');

  const objetivo = objetivoId ? objetivoPorId(objetivoId) : undefined;
  const avisosFraseCustom = validarFrase(fraseCustom);

  function elegirObjetivo(id: string) {
    setObjetivoId(id);
    setFraseElegida(null);
    setEscribiendoPropia(false);
    setPaso(2);
  }

  function elegirFrasePredefinida(texto: string) {
    setFraseElegida(texto);
    setPaso(3);
  }

  function confirmarFraseCustom() {
    const limpia = fraseCustom.trim();
    if (!limpia) return;
    setFraseElegida(limpia);
    setPaso(3);
  }

  async function empezar() {
    if (!objetivoId || !fraseElegida) return;

    if (Platform.OS !== 'web') {
      try {
        await Notifications.requestPermissionsAsync();
        await programarRecordatorioDiario(hora);
      } catch {
        // seguimos igual sin notificaciones: no es bloqueante
      }
    }

    completarOnboarding(objetivoId, fraseElegida, hora);
    router.replace('/');
  }

  // Evita re-onboardear (y borrar frases/progreso ya existentes: completarOnboarding
  // reemplaza el array de frases entero) si se llega acá por error una vez completado.
  if (!hidratado) return null;
  if (onboardingCompleto) return <Redirect href="/" />;

  return (
    <ScrollView contentContainerStyle={styles.contenedor}>
      <Text style={styles.progreso}>Paso {paso} de 3</Text>

      {paso === 1 && (
        <View style={styles.paso}>
          <Text style={styles.titulo}>¿Qué querés reprogramar?</Text>
          <View style={styles.opciones}>
            {OBJETIVOS.map((o) => (
              <Opcion
                key={o.id}
                emoji={o.emoji}
                texto={o.nombre}
                seleccionada={objetivoId === o.id}
                onPress={() => elegirObjetivo(o.id)}
              />
            ))}
          </View>
        </View>
      )}

      {paso === 2 && objetivo && (
        <View style={styles.paso}>
          <Text style={styles.titulo}>Elegí tu frase</Text>
          <Text style={styles.subtitulo}>{objetivo.emoji} {objetivo.nombre}</Text>

          {!escribiendoPropia && (
            <>
              <View style={styles.opciones}>
                {objetivo.frases.map((f) => (
                  <Opcion key={f} texto={f} seleccionada={fraseElegida === f} onPress={() => elegirFrasePredefinida(f)} />
                ))}
              </View>
              <Text style={styles.linkPropia} onPress={() => setEscribiendoPropia(true)}>
                ✏️ Prefiero escribir la mía
              </Text>
            </>
          )}

          {escribiendoPropia && (
            <View style={styles.editor}>
              <TextInput
                value={fraseCustom}
                onChangeText={setFraseCustom}
                placeholder="Escribí tu frase en primera persona..."
                placeholderTextColor={colores.textoSuave}
                style={styles.input}
                multiline
              />
              {avisosFraseCustom.map((aviso) => (
                <Text key={aviso} style={styles.aviso}>
                  💡 {aviso}
                </Text>
              ))}
              <Boton texto="Usar esta frase" onPress={confirmarFraseCustom} deshabilitado={!fraseCustom.trim()} />
              <Text style={styles.linkPropia} onPress={() => setEscribiendoPropia(false)}>
                ← Volver a las sugeridas
              </Text>
            </View>
          )}

          <Text style={styles.linkPropia} onPress={() => setPaso(1)}>
            ← Cambiar objetivo
          </Text>
        </View>
      )}

      {paso === 3 && (
        <View style={styles.paso}>
          <Text style={styles.titulo}>¿A qué hora te lo recuerdo?</Text>
          <Text style={styles.subtitulo}>Un momento tranquilo del día, sin apuro.</Text>
          <SelectorHora valor={hora} onCambiar={setHora} />
          <Boton texto="Empezar" onPress={empezar} />
          <Text style={styles.linkPropia} onPress={() => setPaso(2)}>
            ← Volver
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    flexGrow: 1,
    backgroundColor: colores.fondo,
    padding: espaciado.l,
    justifyContent: 'center',
    gap: espaciado.l,
  },
  progreso: {
    color: colores.textoSuave,
    fontSize: tipografia.chico,
    textAlign: 'center',
  },
  paso: {
    gap: espaciado.m,
  },
  titulo: {
    color: colores.texto,
    fontSize: tipografia.subtitulo,
    fontWeight: '700',
    textAlign: 'center',
  },
  subtitulo: {
    color: colores.textoSuave,
    fontSize: tipografia.cuerpo,
    textAlign: 'center',
  },
  opciones: {
    gap: espaciado.s,
  },
  linkPropia: {
    color: colores.acento,
    fontSize: tipografia.chico,
    textAlign: 'center',
    paddingVertical: espaciado.s,
  },
  editor: {
    gap: espaciado.s,
  },
  input: {
    color: colores.texto,
    backgroundColor: colores.superficie,
    borderRadius: 16,
    padding: espaciado.m,
    fontSize: tipografia.cuerpo,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  aviso: {
    color: colores.dorado,
    fontSize: tipografia.chico,
  },
});
