import { normalizar } from './frase';

const PALABRAS_NEGACION = ['no', 'nunca', 'jamas', 'tampoco'];
const PRONOMBRES_NO_PRIMERA = [
  'tu',
  'vos',
  'usted',
  'ustedes',
  'el',
  'ella',
  'ellos',
  'ellas',
  'nosotros',
  'nosotras',
];
const MAX_PALABRAS = 10;

/**
 * Validación suave (nunca bloquea): devuelve tips para mejorar la frase, o [] si no
 * hay nada que sugerir. Reglas: primera persona, presente, en positivo, corta.
 */
export function validarFrase(texto: string): string[] {
  const limpio = texto.trim();
  if (!limpio) return [];

  const avisos: string[] = [];
  const palabras = limpio.split(/\s+/);
  const primeraPalabra = normalizar(palabras[0].replace(/[.,!?¿¡]/g, ''));

  if (PRONOMBRES_NO_PRIMERA.includes(primeraPalabra)) {
    avisos.push('Escribila en primera persona ("yo...") para que sea sobre vos.');
  }

  const tieneNegacion = palabras.some((p) => PALABRAS_NEGACION.includes(normalizar(p.replace(/[.,!?¿¡]/g, ''))));
  if (tieneNegacion) {
    avisos.push('Probá decirlo en positivo — funciona mejor lo que sí querés ser.');
  }

  if (palabras.length > MAX_PALABRAS) {
    avisos.push('Las frases cortas se graban mejor. Probá acortarla un poco.');
  }

  return avisos;
}
