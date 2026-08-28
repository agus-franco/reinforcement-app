import { esCorrecto, normalizar } from '../frase';

describe('normalizar', () => {
  it('pasa a minúsculas', () => {
    expect(normalizar('Amo')).toBe('amo');
  });

  it('quita tildes', () => {
    expect(normalizar('público')).toBe('publico');
    expect(normalizar('PÚBLICO')).toBe('publico');
  });

  it('preserva la ñ (no es lo mismo "año" que "ano")', () => {
    expect(normalizar('año')).toBe('año');
    expect(normalizar('AÑO')).toBe('año');
    expect(normalizar('año')).not.toBe('ano');
  });

  it('deja espacios y signos intactos', () => {
    expect(normalizar('Confío en mí')).toBe('confio en mi');
  });
});

describe('esCorrecto', () => {
  it('acepta la misma letra sin importar mayúsculas', () => {
    expect(esCorrecto('A', 'a')).toBe(true);
    expect(esCorrecto('a', 'A')).toBe(true);
  });

  it('acepta tildes equivalentes', () => {
    expect(esCorrecto('ú', 'u')).toBe(true);
    expect(esCorrecto('ó', 'o')).toBe(true);
  });

  it('NO acepta la ñ como si fuera n', () => {
    expect(esCorrecto('ñ', 'n')).toBe(false);
  });

  it('rechaza una letra distinta', () => {
    expect(esCorrecto('a', 'b')).toBe(false);
  });

  it('acepta el espacio', () => {
    expect(esCorrecto(' ', ' ')).toBe(true);
  });
});
