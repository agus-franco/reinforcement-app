export interface Nivel {
  umbral: number;
  nombre: string;
}

/**
 * Escalera de niveles por frase. "Creencia grabada" (el estado final, colección de
 * Perfil) ahora es el último nivel, no 100 repeticiones — eso era muy poco para que
 * algo quede grabado de verdad.
 */
export const NIVELES: Nivel[] = [
  { umbral: 25, nombre: 'Primera chispa' },
  { umbral: 100, nombre: 'Sendero' },
  { umbral: 500, nombre: 'Circuito' },
  { umbral: 1000, nombre: 'Hábito' },
  { umbral: 2000, nombre: 'Convicción' },
  { umbral: 5000, nombre: 'Creencia grabada' },
];

export const UMBRAL_FINAL = NIVELES[NIVELES.length - 1].umbral;

/** El nivel más alto ya alcanzado con esta cantidad de repeticiones, o null si ninguno todavía. */
export function nivelAlcanzado(repeticiones: number): Nivel | null {
  let actual: Nivel | null = null;
  for (const nivel of NIVELES) {
    if (repeticiones >= nivel.umbral) {
      actual = nivel;
    } else {
      break;
    }
  }
  return actual;
}

/** El próximo nivel todavía no alcanzado, o null si ya está en el nivel final. */
export function proximoNivel(repeticiones: number): Nivel | null {
  return NIVELES.find((nivel) => repeticiones < nivel.umbral) ?? null;
}

export function esNivelFinal(repeticiones: number): boolean {
  return repeticiones >= UMBRAL_FINAL;
}
