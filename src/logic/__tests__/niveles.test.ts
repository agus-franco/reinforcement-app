import { esNivelFinal, nivelAlcanzado, NIVELES, proximoNivel, UMBRAL_FINAL } from '../niveles';

describe('NIVELES', () => {
  it('está ordenada de forma ascendente por umbral', () => {
    for (let i = 1; i < NIVELES.length; i++) {
      expect(NIVELES[i].umbral).toBeGreaterThan(NIVELES[i - 1].umbral);
    }
  });

  it('el umbral final es 5000', () => {
    expect(UMBRAL_FINAL).toBe(5000);
  });
});

describe('nivelAlcanzado', () => {
  it('null antes de llegar al primer umbral', () => {
    expect(nivelAlcanzado(0)).toBeNull();
    expect(nivelAlcanzado(24)).toBeNull();
  });

  it('justo en el primer umbral', () => {
    expect(nivelAlcanzado(25)?.nombre).toBe('Primera chispa');
  });

  it('entre dos umbrales, devuelve el más alto ya alcanzado', () => {
    expect(nivelAlcanzado(99)?.nombre).toBe('Primera chispa');
    expect(nivelAlcanzado(100)?.nombre).toBe('Sendero');
    expect(nivelAlcanzado(499)?.nombre).toBe('Sendero');
    expect(nivelAlcanzado(500)?.nombre).toBe('Circuito');
  });

  it('en o pasado el umbral final, devuelve el nivel final', () => {
    expect(nivelAlcanzado(5000)?.nombre).toBe('Creencia grabada');
    expect(nivelAlcanzado(10000)?.nombre).toBe('Creencia grabada');
  });
});

describe('proximoNivel', () => {
  it('el primero, si todavía no alcanzó nada', () => {
    expect(proximoNivel(0)?.umbral).toBe(25);
  });

  it('el siguiente umbral no alcanzado', () => {
    expect(proximoNivel(25)?.umbral).toBe(100);
    expect(proximoNivel(150)?.umbral).toBe(500);
  });

  it('null si ya está en el nivel final', () => {
    expect(proximoNivel(5000)).toBeNull();
    expect(proximoNivel(6000)).toBeNull();
  });
});

describe('esNivelFinal', () => {
  it('false por debajo del umbral final', () => {
    expect(esNivelFinal(4999)).toBe(false);
  });

  it('true en el umbral final y por encima', () => {
    expect(esNivelFinal(5000)).toBe(true);
    expect(esNivelFinal(5001)).toBe(true);
  });
});
