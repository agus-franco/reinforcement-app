function pad(n: number): string {
  return n.toString().padStart(2, '0');
}

/** Fecha de hoy en 'YYYY-MM-DD', hora LOCAL del dispositivo. No usar toISOString(). */
export function hoyLocal(referencia: Date = new Date()): string {
  return `${referencia.getFullYear()}-${pad(referencia.getMonth() + 1)}-${pad(referencia.getDate())}`;
}

/** Cantidad de días de calendario entre dos fechas 'YYYY-MM-DD' (b - a). Usa UTC para evitar DST. */
export function diasEntre(a: string, b: string): number {
  const [ay, am, ad] = a.split('-').map(Number);
  const [by, bm, bd] = b.split('-').map(Number);
  const msA = Date.UTC(ay, am - 1, ad);
  const msB = Date.UTC(by, bm - 1, bd);
  return Math.round((msB - msA) / 86_400_000);
}

/** Fecha 'YYYY-MM-DD' resultante de restar n días a la dada (n puede ser 0). */
export function restarDias(fecha: string, n: number): string {
  const [y, m, d] = fecha.split('-').map(Number);
  const ms = Date.UTC(y, m - 1, d) - n * 86_400_000;
  const dt = new Date(ms);
  return `${dt.getUTCFullYear()}-${pad(dt.getUTCMonth() + 1)}-${pad(dt.getUTCDate())}`;
}

/** Fecha 'YYYY-MM-DD' del día anterior a la dada. */
export function diaAnterior(fecha: string): string {
  return restarDias(fecha, 1);
}
