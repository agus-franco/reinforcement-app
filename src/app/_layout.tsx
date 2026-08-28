import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { AppState } from 'react-native';

import { configurarManejadorNotificaciones } from '@/logic/notificaciones';
import { useStore } from '@/state/store';

export default function RootLayout() {
  useEffect(() => {
    configurarManejadorNotificaciones();
    useStore.getState().evaluarAlAbrir();

    const suscripcion = AppState.addEventListener('change', (estado) => {
      if (estado === 'active') {
        useStore.getState().evaluarAlAbrir();
      }
    });
    return () => suscripcion.remove();
  }, []);

  return <Stack screenOptions={{ headerShown: false }} />;
}
