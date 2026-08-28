import type { RefObject } from 'react';
import type { View } from 'react-native';
import * as Sharing from 'expo-sharing';
import { captureRef } from 'react-native-view-shot';

/** Captura la vista referenciada y abre el share sheet nativo. No-op si no hay share sheet disponible (ej. web de escritorio). */
export async function compartirVista(ref: RefObject<View | null>): Promise<void> {
  const disponible = await Sharing.isAvailableAsync();
  if (!disponible) return;

  const uri = await captureRef(ref, { format: 'png', quality: 1 });
  await Sharing.shareAsync(uri, { mimeType: 'image/png', UTI: 'public.png' });
}
