const DIACRITICOS = new RegExp('[' + String.fromCharCode(0x0300) + '-' + String.fromCharCode(0x036f) + ']', 'g');
// Marcador temporal (carácter de control, no aparece en texto normal) para proteger la
// ñ: al descomponer con NFD, 'ñ' se parte en 'n' + tilde combinante, que cae en el
// mismo rango que las demás tildes — sin esto, 'año' terminaría normalizado como 'ano'.
const MARCADOR_ENIE = String.fromCharCode(0x0001);

/** Minusculas + sin diacriticos (letras con tilde pasan a su forma simple), preservando la ñ. */
export function normalizar(texto: string): string {
  const protegido = texto.toLowerCase().split('ñ').join(MARCADOR_ENIE);
  const sinTildes = protegido.normalize('NFD').replace(DIACRITICOS, '');
  return sinTildes.split(MARCADOR_ENIE).join('ñ');
}

/** Compara un caracter tipeado contra el esperado, normalizando mayusculas/tildes. */
export function esCorrecto(esperado: string, tipeado: string): boolean {
  return normalizar(esperado) === normalizar(tipeado);
}
