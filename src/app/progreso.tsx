import { router } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { Constelacion } from '@/components/Constelacion';
import { diasCompletados } from '@/logic/progreso';
import { useStore } from '@/state/store';
import { colores, espaciado, radios, tipografia } from '@/theme/tokens';

function fechaCorta(iso: string): string {
  const d = new Date(iso);
  return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;
}

export default function ProgresoScreen() {
  const rachaActual = useStore((s) => s.rachaActual);
  const mejorRacha = useStore((s) => s.mejorRacha);
  const sesiones = useStore((s) => s.sesiones);
  const frases = useStore((s) => s.frases);

  const dias = diasCompletados(sesiones);
  const grabadas = frases.filter((f) => f.grabada);

  return (
    <ScrollView contentContainerStyle={styles.contenedor}>
      <Text style={styles.volver} onPress={() => router.replace('/')}>
        ← Volver
      </Text>

      <Text style={styles.titulo}>Tu progreso</Text>

      <View style={styles.rachasFila}>
        <View style={styles.rachaBloque}>
          <Text style={styles.rachaNumero}>🔥 {rachaActual}</Text>
          <Text style={styles.rachaTexto}>racha actual</Text>
        </View>
        <View style={styles.rachaBloque}>
          <Text style={styles.rachaNumero}>{mejorRacha}</Text>
          <Text style={styles.rachaTexto}>mejor racha</Text>
        </View>
      </View>

      <View style={styles.constelacionContenedor}>
        <Constelacion dias={dias} ancho={300} alto={160} />
      </View>

      <View style={styles.seccion}>
        <Text style={styles.seccionTitulo}>Creencias grabadas</Text>
        {grabadas.length === 0 ? (
          <Text style={styles.vacio}>Todavía ninguna frase llegó a 100 repeticiones. Vas a llegar.</Text>
        ) : (
          <View style={styles.listaGrabadas}>
            {grabadas.map((f) => (
              <View key={f.id} style={styles.tarjetaGrabada}>
                <Text style={styles.fraseGrabadaTexto}>"{f.texto}"</Text>
                {f.grabadaEl && <Text style={styles.fraseGrabadaFecha}>grabada el {fechaCorta(f.grabadaEl)}</Text>}
              </View>
            ))}
          </View>
        )}
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
    alignItems: 'center',
  },
  volver: {
    alignSelf: 'flex-start',
    color: colores.acento,
    fontSize: tipografia.chico,
  },
  titulo: {
    color: colores.texto,
    fontSize: tipografia.subtitulo,
    fontWeight: '700',
  },
  rachasFila: {
    flexDirection: 'row',
    gap: espaciado.xl,
  },
  rachaBloque: {
    alignItems: 'center',
    gap: 2,
  },
  rachaNumero: {
    color: colores.texto,
    fontSize: tipografia.titulo,
    fontWeight: '700',
  },
  rachaTexto: {
    color: colores.textoSuave,
    fontSize: tipografia.chico,
  },
  constelacionContenedor: {
    backgroundColor: colores.superficie,
    borderRadius: radios.m,
    padding: espaciado.s,
  },
  seccion: {
    width: '100%',
    gap: espaciado.s,
  },
  seccionTitulo: {
    color: colores.texto,
    fontSize: tipografia.cuerpo,
    fontWeight: '600',
  },
  vacio: {
    color: colores.textoSuave,
    fontSize: tipografia.chico,
  },
  listaGrabadas: {
    gap: espaciado.s,
  },
  tarjetaGrabada: {
    backgroundColor: colores.superficie,
    borderRadius: radios.m,
    padding: espaciado.m,
    gap: 4,
  },
  fraseGrabadaTexto: {
    color: colores.acento,
    fontSize: tipografia.cuerpo,
    fontWeight: '600',
  },
  fraseGrabadaFecha: {
    color: colores.textoSuave,
    fontSize: tipografia.chico,
  },
});
