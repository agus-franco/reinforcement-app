import { useEffect, useState } from 'react';

import { hoyLocal } from '@/logic/fechas';
import { estadoPersonaje } from '@/logic/racha';
import { useStore } from './store';
import type { EstadoPersonaje } from './tipos';

export function usePersonaje(): EstadoPersonaje {
  const rachaActual = useStore((s) => s.rachaActual);
  const mejorRacha = useStore((s) => s.mejorRacha);
  const ultimoDiaCompletado = useStore((s) => s.ultimoDiaCompletado);
  const [hora, setHora] = useState(() => new Date().getHours());

  useEffect(() => {
    const intervalo = setInterval(() => setHora(new Date().getHours()), 60_000);
    return () => clearInterval(intervalo);
  }, []);

  // protectores no influye en estadoPersonaje(), 0 es un valor inerte aquí.
  return estadoPersonaje({ rachaActual, mejorRacha, ultimoDiaCompletado, protectores: 0 }, hoyLocal(), hora);
}
