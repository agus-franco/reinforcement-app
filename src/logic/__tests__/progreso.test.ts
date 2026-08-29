import { diasCompletados, grillaDias, pseudoAleatorio } from '../progreso';
import type { Sesion } from '@/state/tipos';

function sesion(parcial: Partial<Sesion>): Sesion {
  return {
    id: 'x',
    fecha: '2026-08-20',
    fraseId: 'f1',
    intensidad: 'moderado',
    repeticiones: 5,
    doradas: 0,
    duracionRealSeg: 180,
    ...parcial,
  };
}

describe('diasCompletados', () => {
  it('sin sesiones: lista vacía', () => {
    expect(diasCompletados([])).toEqual([]);
  });

  it('ignora sesiones con 0 repeticiones', () => {
    expect(diasCompletados([sesion({ repeticiones: 0 })])).toEqual([]);
  });

  it('un día con una sesión', () => {
    expect(diasCompletados([sesion({ fecha: '2026-08-20' })])).toEqual([{ fecha: '2026-08-20', dorado: false }]);
  });

  it('varias sesiones el mismo día se colapsan en un solo punto', () => {
    const r = diasCompletados([sesion({ fecha: '2026-08-20' }), sesion({ fecha: '2026-08-20' })]);
    expect(r).toHaveLength(1);
  });

  it('ordena cronológicamente sin importar el orden de entrada', () => {
    const r = diasCompletados([sesion({ fecha: '2026-08-25' }), sesion({ fecha: '2026-08-20' })]);
    expect(r.map((d) => d.fecha)).toEqual(['2026-08-20', '2026-08-25']);
  });

  it('un día es dorado si alguna sesión de ese día tuvo doradas', () => {
    const r = diasCompletados([sesion({ fecha: '2026-08-20', doradas: 0 }), sesion({ fecha: '2026-08-20', doradas: 2 })]);
    expect(r[0].dorado).toBe(true);
  });
});

describe('grillaDias', () => {
  const HOY = '2026-08-26';

  it('devuelve `filas` filas de 7 días cada una', () => {
    const g = grillaDias([], HOY, 3);
    expect(g).toHaveLength(3);
    g.forEach((fila) => expect(fila).toHaveLength(7));
  });

  it('hoy es el último día de la última fila', () => {
    const g = grillaDias([], HOY, 2);
    expect(g[1][6].fecha).toBe(HOY);
  });

  it('los días son consecutivos y crecientes de principio a fin', () => {
    const g = grillaDias([], HOY, 2);
    const plano = g.flat().map((d) => d.fecha);
    for (let i = 1; i < plano.length; i++) {
      expect(plano[i] > plano[i - 1]).toBe(true);
    }
  });

  it('marca completado el día que tuvo una sesión con repeticiones', () => {
    const g = grillaDias([sesion({ fecha: HOY })], HOY, 1);
    expect(g[0][6].completado).toBe(true);
    expect(g[0][0].completado).toBe(false);
  });

  it('marca dorado el día que tuvo una repetición dorada', () => {
    const g = grillaDias([sesion({ fecha: HOY, doradas: 1 })], HOY, 1);
    expect(g[0][6].dorado).toBe(true);
  });

  it('sin sesiones, ningún día está completado', () => {
    const g = grillaDias([], HOY, 3);
    expect(g.flat().every((d) => !d.completado)).toBe(true);
  });
});

describe('pseudoAleatorio', () => {
  it('es determinístico: mismo seed, mismo resultado', () => {
    expect(pseudoAleatorio(7)).toBe(pseudoAleatorio(7));
  });

  it('devuelve valores en [0, 1)', () => {
    for (let i = 0; i < 50; i++) {
      const v = pseudoAleatorio(i);
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
  });
});
