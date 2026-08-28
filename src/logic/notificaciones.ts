import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

const CANAL_ID = 'recordatorio-diario';

const COPYS: { titulo: string; cuerpo: string }[] = [
  { titulo: '🧠 Tu cerebro te espera', cuerpo: 'Un par de minutos hoy, para vos.' },
  { titulo: '🧠 Hora de reprogramar', cuerpo: 'Tu frase te está esperando.' },
  { titulo: '🧠 No rompas la racha', cuerpo: 'Un ratito de escritura y listo.' },
];

/** Llamar una sola vez al arrancar la app (root layout). */
export function configurarManejadorNotificaciones(): void {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
    }),
  });
}

/**
 * Cancela cualquier recordatorio programado antes y programa uno nuevo diario a la
 * hora dada. Llamar al completar el onboarding y cada vez que cambie horaRecordatorio.
 * En web es un no-op (las notificaciones locales no aplican ahí).
 */
export async function programarRecordatorioDiario(hora: string): Promise<void> {
  if (Platform.OS === 'web') return;

  await Notifications.cancelAllScheduledNotificationsAsync();

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync(CANAL_ID, {
      name: 'Recordatorio diario',
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }

  const [horaN, minutoN] = hora.split(':').map(Number);
  const copy = COPYS[Math.floor(Math.random() * COPYS.length)];

  await Notifications.scheduleNotificationAsync({
    content: { title: copy.titulo, body: copy.cuerpo },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: horaN,
      minute: minutoN,
      channelId: Platform.OS === 'android' ? CANAL_ID : undefined,
    },
  });
}
