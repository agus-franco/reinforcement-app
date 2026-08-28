import type { Sesion } from '@/state/tipos';

export interface DiaCompletado {
  fecha: string;
  dorado: boolean;
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

/** Hash determinístico en [0,1) a partir de un entero: mismo seed, mismo resultado siempre. */
export function pseudoAleatorio(seed: number): number {
  const x = Math.sin(seed * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}
