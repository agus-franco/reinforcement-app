import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { Boton } from '@/components/Boton';
import { Opcion } from '@/components/Opcion';
import { SelectorHora } from '@/components/SelectorHora';
import { SelectorIntensidad } from '@/components/SelectorIntensidad';
import { objetivoPorId, OBJETIVOS } from '@/data/objetivos';
import { programarRecordatorioDiario } from '@/logic/notificaciones';
import { validarFrase } from '@/logic/validarFrase';
import { useStore } from '@/state/store';
import { colores, espaciado, radios, tipografia } from '@/theme/tokens';

export default function AjustesScreen() {
  const horaRecordatorio = useStore((s) => s.horaRecordatorio);
  const intensidadDefault = useStore((s) => s.intensidadDefault);
  const hapticsActivado = useStore((s) => s.hapticsActivado);
  const frases = useStore((s) => s.frases);
  const fraseActivaId = useStore((s) => s.fraseActivaId);
  const setAjuste = useStore((s) => s.setAjuste);
  const cambiarFraseActiva = useStore((s) => s.cambiarFraseActiva);
  const borrarTodo = useStore((s) => s.borrarTodo);

  const [cambiandoFrase, setCambiandoFrase] = useState(false);
  const [objetivoNuevo, setObjetivoNuevo] = useState<string | null>(null);
  const [escribiendoPropia, setEscribiendoPropia] = useState(false);
  const [fraseCustom, setFraseCustom] = useState('');
  const [confirmandoBorrado, setConfirmandoBorrado] = useState(false);

  const fraseActiva = frases.find((f) => f.id === fraseActivaId);
  const objetivoActivo = fraseActiva ? objetivoPorId(fraseActiva.objetivoId) : undefined;
  const avisosFraseCustom = validarFrase(fraseCustom);

  function cambiarHora(nuevaHora: string) {
    setAjuste({ horaRecordatorio: nuevaHora });
    programarRecordatorioDiario(nuevaHora).catch(() => {});
  }

  function cerrarCambioDeFrase() {
    setCambiandoFrase(false);
    setObjetivoNuevo(null);
    setEscribiendoPropia(false);
    setFraseCustom('');
  }

  function elegirNuevaFrase(objId: string, texto: string) {
    cambiarFraseActiva(objId, texto);
    cerrarCambioDeFrase();
  }

  return (
    <ScrollView contentContainerStyle={styles.contenedor}>
      <Text style={styles.volver} onPress={() => router.replace('/')}>
        ← Volver
      </Text>
      <Text style={styles.titulo}>Ajustes</Text>

      <Seccion titulo="Recordatorio diario">
        <SelectorHora valor={horaRecordatorio} onCambiar={cambiarHora} />
      </Seccion>

      <Seccion titulo="Intensidad por defecto">
        <SelectorIntensidad valor={intensidadDefault} onCambiar={(v) => setAjuste({ intensidadDefault: v })} />
      </Seccion>

      <Seccion titulo="Vibración">
        <Pressable style={styles.toggle} onPress={() => setAjuste({ hapticsActivado: !hapticsActivado })}>
          <Text style={styles.toggleTexto}>{hapticsActivado ? 'Activada' : 'Desactivada'}</Text>
        </Pressable>
      </Seccion>

      <Seccion titulo="Tu frase">
        {!cambiandoFrase ? (
          <>
            {fraseActiva && (
              <Text style={styles.fraseActual}>
                {objetivoActivo ? `${objetivoActivo.emoji} ` : ''}"{fraseActiva.texto}"
              </Text>
            )}
            <Boton texto="Cambiar frase" variante="secundario" onPress={() => setCambiandoFrase(true)} />
          </>
        ) : !objetivoNuevo ? (
          <View style={styles.opciones}>
            {OBJETIVOS.map((o) => (
              <Opcion key={o.id} emoji={o.emoji} texto={o.nombre} seleccionada={false} onPress={() => setObjetivoNuevo(o.id)} />
            ))}
            <Text style={styles.link} onPress={cerrarCambioDeFrase}>
              Cancelar
            </Text>
          </View>
        ) : (
          <View style={styles.opciones}>
            {!escribiendoPropia ? (
              <>
                {objetivoPorId(objetivoNuevo)?.frases.map((f) => (
                  <Opcion key={f} texto={f} seleccionada={false} onPress={() => elegirNuevaFrase(objetivoNuevo, f)} />
                ))}
                <Text style={styles.link} onPress={() => setEscribiendoPropia(true)}>
                  ✏️ Prefiero escribir la mía
                </Text>
              </>
            ) : (
              <View style={styles.editor}>
                <TextInput
                  value={fraseCustom}
                  onChangeText={setFraseCustom}
                  placeholder="Escribí tu frase en primera persona..."
                  placeholderTextColor={colores.textoSuave}
                  style={styles.input}
                  multiline
                />
                {avisosFraseCustom.map((a) => (
                  <Text key={a} style={styles.aviso}>
                    💡 {a}
                  </Text>
                ))}
                <Boton
                  texto="Usar esta frase"
                  onPress={() => elegirNuevaFrase(objetivoNuevo, fraseCustom.trim())}
                  deshabilitado={!fraseCustom.trim()}
                />
              </View>
            )}
            <Text style={styles.link} onPress={() => setObjetivoNuevo(null)}>
              ← Cambiar objetivo
            </Text>
            <Text style={styles.link} onPress={cerrarCambioDeFrase}>
              Cancelar
            </Text>
          </View>
        )}
      </Seccion>

      <Seccion titulo="Datos">
        {!confirmandoBorrado ? (
          <Boton texto="Borrar todos los datos" variante="secundario" onPress={() => setConfirmandoBorrado(true)} />
        ) : (
          <View style={styles.confirmacion}>
            <Text style={styles.confirmacionTexto}>
              Esto borra tu racha, tus frases y todo tu progreso. No se puede deshacer.
            </Text>
            <Boton
              texto="Sí, borrar todo"
              onPress={() => {
                borrarTodo();
                router.replace('/');
              }}
            />
            <Text style={styles.link} onPress={() => setConfirmandoBorrado(false)}>
              Cancelar
            </Text>
          </View>
        )}
      </Seccion>
    </ScrollView>
  );
}

function Seccion({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <View style={styles.seccion}>
      <Text style={styles.seccionTitulo}>{titulo}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    flexGrow: 1,
    backgroundColor: colores.fondo,
    padding: espaciado.l,
    gap: espaciado.l,
  },
  volver: {
    color: colores.acento,
    fontSize: tipografia.chico,
  },
  titulo: {
    color: colores.texto,
    fontSize: tipografia.titulo,
    fontWeight: '700',
  },
  seccion: {
    gap: espaciado.s,
  },
  seccionTitulo: {
    color: colores.textoSuave,
    fontSize: tipografia.chico,
    textTransform: 'uppercase',
  },
  toggle: {
    alignSelf: 'flex-start',
    paddingVertical: espaciado.s,
    paddingHorizontal: espaciado.m,
    borderRadius: radios.pill,
    backgroundColor: colores.superficie,
  },
  toggleTexto: {
    color: colores.texto,
    fontSize: tipografia.cuerpo,
    fontWeight: '600',
  },
  fraseActual: {
    color: colores.acento,
    fontSize: tipografia.cuerpo,
  },
  opciones: {
    gap: espaciado.s,
  },
  link: {
    color: colores.acento,
    fontSize: tipografia.chico,
    paddingVertical: espaciado.s,
  },
  editor: {
    gap: espaciado.s,
  },
  input: {
    color: colores.texto,
    backgroundColor: colores.superficie,
    borderRadius: radios.m,
    padding: espaciado.m,
    fontSize: tipografia.cuerpo,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  aviso: {
    color: colores.dorado,
    fontSize: tipografia.chico,
  },
  confirmacion: {
    gap: espaciado.s,
  },
  confirmacionTexto: {
    color: colores.textoSuave,
    fontSize: tipografia.chico,
  },
});
