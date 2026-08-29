import { restarDias } from './fechas';
import type { Sesion } from '@/state/tipos';

export interface DiaCompletado {
  fecha: string;
  dorado: boolean;
}

export interface DiaGrilla extends DiaCompletado {
  completado: boolean;
}

/** Días únicos con >=1 repetición, ordenados cronológicamente. Dorado si alguna sesión de ese día tuvo una repetición dorada. */
export function diasCompletados(sesiones: Sesion[]): DiaCompletado[] {
  const porFecha = new Map<string, boolean>();
  for (const s of sesiones) {
    if (s.repeticiones < 1) continue;
    const dorado = s.doradas > 0;
    porFecha.set(s.fecha, (porFecha.get(s.fecha) ?? false) || dorado);
  }
  return Array.from(porFecha.entries())
    .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
    .map(([fecha, dorado]) => ({ fecha, dorado }));
}

/**
 * Últimos `filas * 7` días como grilla (más antiguo primero, hoy al final de la
 * última fila) — un check-grid simple en vez de constelación, para Home y la sesión
 * de escritura. No respeta límites de semana calendario (lunes-domingo); son
 * simplemente los últimos N*7 días consecutivos.
 */
export function grillaDias(sesiones: Sesion[], hoy: string, filas = 3): DiaGrilla[][] {
  const dias = diasCompletados(sesiones);
  const doradoPorFecha = new Map(dias.map((d) => [d.fecha, d.dorado]));
  const totalDias = filas * 7;

  const plano: DiaGrilla[] = [];
  for (let i = totalDias - 1; i >= 0; i--) {
    const fecha = restarDias(hoy, i);
    const dorado = doradoPorFecha.get(fecha) ?? false;
    plano.push({ fecha, completado: doradoPorFecha.has(fecha), dorado });
  }

  const resultado: DiaGrilla[][] = [];
  for (let f = 0; f < filas; f++) {
    resultado.push(plano.slice(f * 7, f * 7 + 7));
  }
  return resultado;
}

/** Hash determinístico en [0,1) a partir de un entero: mismo seed, mismo resultado siempre. */
export function pseudoAleatorio(seed: number): number {
  const x = Math.sin(seed * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}
