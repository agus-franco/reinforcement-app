import { diaAnterior, diasEntre } from './fechas';
import type { EstadoPersonaje } from '@/state/tipos';

export const PROTECTORES_MAX = 2;
export const HORA_PREOCUPADO = 17;

export interface EstadoRacha {
  rachaActual: number;
  mejorRacha: number;
  ultimoDiaCompletado: string | null;
  protectores: number;
}

/**
 * Se llama al abrir la app o volver a foreground. Si pasaron días sin completar,
 * intenta cubrir el hueco con protectores (1 por día faltante); si no alcanzan, corta
 * la racha. Si el hueco se cubre, `ultimoDiaCompletado` se corre hasta ayer para que
 * el día de hoy quede como el próximo consecutivo natural.
 */
export function evaluarAlAbrir(e: EstadoRacha, hoy: string): EstadoRacha {
  if (e.ultimoDiaCompletado === null || e.ultimoDiaCompletado === hoy) {
    return e;
  }

  const gap = diasEntre(e.ultimoDiaCompletado, hoy);
  if (gap <= 1) {
    // ayer fue el último día completado: todavía consecutivo, nada que hacer hoy.
    return e;
  }

  const diasFaltantes = gap - 1;
  if (e.protectores >= diasFaltantes) {
    return {
      ...e,
      protectores: e.protectores - diasFaltantes,
      ultimoDiaCompletado: diaAnterior(hoy),
    };
  }

  return {
    ...e,
    rachaActual: 0,
    mejorRacha: Math.max(e.mejorRacha, e.rachaActual),
  };
}

/**
 * Se llama al completar una sesión con >= 1 repetición. Suma el día si todavía no
 * contaba, y otorga un protector cada 7 días consecutivos (tope PROTECTORES_MAX).
 * No depende de que evaluarAlAbrir haya corrido antes: recalcula consecutividad sola.
 */
export function alCompletarDia(e: EstadoRacha, hoy: string): EstadoRacha {
  if (e.ultimoDiaCompletado === hoy) {
    return e;
  }

  const esConsecutivo = e.ultimoDiaCompletado !== null && diasEntre(e.ultimoDiaCompletado, hoy) === 1;
  const rachaActual = e.rachaActual > 0 && esConsecutivo ? e.rachaActual + 1 : 1;

  let protectores = e.protectores;
  if (rachaActual % 7 === 0) {
    protectores = Math.min(PROTECTORES_MAX, protectores + 1);
  }

  return {
    ...e,
    rachaActual,
    mejorRacha: Math.max(e.mejorRacha, rachaActual),
    protectores,
    ultimoDiaCompletado: hoy,
  };
}

/** Derivado para la UI, no se almacena. */
export function estadoPersonaje(e: EstadoRacha, hoy: string, hora: number): EstadoPersonaje {
  if (e.ultimoDiaCompletado === hoy) {
    return 'radiante';
  }
  if (e.rachaActual === 0 && e.mejorRacha > 0) {
    return 'triste';
  }
  return hora >= HORA_PREOCUPADO ? 'preocupado' : 'feliz';
}
