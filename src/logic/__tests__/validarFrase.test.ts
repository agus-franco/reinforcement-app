import { validarFrase } from '../validarFrase';

describe('validarFrase', () => {
  it('frase vacía: sin avisos', () => {
    expect(validarFrase('')).toEqual([]);
    expect(validarFrase('   ')).toEqual([]);
  });

  it('frase válida en primera persona, positiva y corta: sin avisos', () => {
    expect(validarFrase('Amo hablar en público')).toEqual([]);
    expect(validarFrase('Confío en mí')).toEqual([]);
  });

  it('detecta pronombre que no es primera persona', () => {
    const avisos = validarFrase('Vos sos capaz de lograrlo');
    expect(avisos.length).toBeGreaterThan(0);
  });

  it('detecta negación', () => {
    const avisos = validarFrase('No tengo miedo');
    expect(avisos.length).toBeGreaterThan(0);
  });

  it('detecta frase larga', () => {
    const avisos = validarFrase('Yo soy una persona que puede lograr absolutamente todo lo que se proponga siempre');
    expect(avisos.length).toBeGreaterThan(0);
  });

  it('nunca bloquea: siempre devuelve un array, incluso con varios problemas', () => {
    const avisos = validarFrase('Vos nunca vas a poder hacer esto que te propusiste hace mucho tiempo atrás');
    expect(Array.isArray(avisos)).toBe(true);
    expect(avisos.length).toBeGreaterThanOrEqual(2);
  });
});
