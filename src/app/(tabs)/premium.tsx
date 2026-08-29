import { StyleSheet, Text, View } from 'react-native';

import { colores, espaciado, radios, tipografia } from '@/theme/tokens';

export default function PremiumScreen() {
  return (
    <View style={styles.contenedor}>
      <Text style={styles.emoji}>⚡</Text>
      <Text style={styles.titulo}>Premium</Text>
      <Text style={styles.subtitulo}>Próximamente</Text>

      <View style={styles.tarjeta}>
        <Text style={styles.itemTitulo}>🔒 Bloqueo de apps</Text>
        <Text style={styles.itemTexto}>
          Bloqueá las apps que más te distraen hasta que completes tu escritura del día.
        </Text>
      </View>

      <View style={styles.tarjeta}>
        <Text style={styles.itemTitulo}>📊 Estadísticas avanzadas</Text>
        <Text style={styles.itemTexto}>Fluidez de tipeo, mejores horarios, mapa de calor de tu constancia.</Text>
      </View>

      <View style={styles.tarjeta}>
        <Text style={styles.itemTitulo}>✨ Frases premium</Text>
        <Text style={styles.itemTexto}>Packs de frases curados por objetivo, más allá de las predefinidas.</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    flex: 1,
    backgroundColor: colores.fondo,
    padding: espaciado.l,
    gap: espaciado.m,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: {
    fontSize: 40,
  },
  titulo: {
    color: colores.texto,
    fontSize: tipografia.titulo,
    fontWeight: '700',
  },
  subtitulo: {
    color: colores.textoSuave,
    fontSize: tipografia.cuerpo,
    marginBottom: espaciado.m,
  },
  tarjeta: {
    width: '100%',
    backgroundColor: colores.superficie,
    borderRadius: radios.m,
    padding: espaciado.m,
    gap: 4,
    opacity: 0.7,
  },
  itemTitulo: {
    color: colores.texto,
    fontSize: tipografia.cuerpo,
    fontWeight: '600',
  },
  itemTexto: {
    color: colores.textoSuave,
    fontSize: tipografia.chico,
  },
});
