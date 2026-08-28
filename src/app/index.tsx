import { Redirect } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { useHidratado } from '@/state/useHidratado';
import { useStore } from '@/state/store';
import { colores, tipografia } from '@/theme/tokens';

export default function HomeScreen() {
  const hidratado = useHidratado();
  const onboardingCompleto = useStore((s) => s.onboardingCompleto);

  if (!hidratado) {
    return <View style={styles.container} />;
  }

  if (!onboardingCompleto) {
    return <Redirect href="/onboarding" />;
  }

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
