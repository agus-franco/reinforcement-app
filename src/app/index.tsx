import { StyleSheet, Text, View } from 'react-native';

import { colores, tipografia } from '@/theme/tokens';

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Rewire</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colores.fondo,
  },
  text: {
    color: colores.texto,
    fontSize: tipografia.titulo,
  },
});
