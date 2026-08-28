import { useEffect, useState } from 'react';

import { useStore } from './store';

/**
 * El store persistido carga desde AsyncStorage de forma asíncrona. Antes de que
 * termine, onboardingCompleto lee el default (false) aunque el usuario ya lo haya
 * hecho — hay que esperar la hidratación antes de decidir redirects.
 */
export function useHidratado(): boolean {
  const [hidratado, setHidratado] = useState(useStore.persist.hasHydrated());

  useEffect(() => {
    if (useStore.persist.hasHydrated()) {
      setHidratado(true);
      return;
    }
    return useStore.persist.onFinishHydration(() => setHidratado(true));
  }, []);

  return hidratado;
}
