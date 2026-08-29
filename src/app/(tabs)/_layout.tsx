import { Redirect, Tabs } from 'expo-router';
import { Text } from 'react-native';

import { useStore } from '@/state/store';
import { useHidratado } from '@/state/useHidratado';
import { colores } from '@/theme/tokens';

function Icono({ emoji, enfocado }: { emoji: string; enfocado: boolean }) {
  return <Text style={{ fontSize: 22, opacity: enfocado ? 1 : 0.5 }}>{emoji}</Text>;
}

export default function TabsLayout() {
  const hidratado = useHidratado();
  const onboardingCompleto = useStore((s) => s.onboardingCompleto);

  if (!hidratado) return null;
  if (!onboardingCompleto) return <Redirect href="/onboarding" />;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colores.acento,
        tabBarInactiveTintColor: colores.textoSuave,
        tabBarStyle: { backgroundColor: colores.superficie, borderTopColor: colores.fondo },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ title: 'Home', tabBarIcon: ({ focused }) => <Icono emoji="🏠" enfocado={focused} /> }}
      />
      <Tabs.Screen
        name="ranking"
        options={{ title: 'Ranking', tabBarIcon: ({ focused }) => <Icono emoji="🏆" enfocado={focused} /> }}
      />
      <Tabs.Screen
        name="premium"
        options={{ title: 'Premium', tabBarIcon: ({ focused }) => <Icono emoji="⚡" enfocado={focused} /> }}
      />
      <Tabs.Screen
        name="perfil"
        options={{ title: 'Perfil', tabBarIcon: ({ focused }) => <Icono emoji="👤" enfocado={focused} /> }}
      />
    </Tabs>
  );
}
