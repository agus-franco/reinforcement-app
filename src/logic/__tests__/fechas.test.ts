import { diaAnterior, diasEntre, hoyLocal } from '../fechas';

describe('hoyLocal', () => {
  it('usa la fecha local, no UTC (medianoche no debe saltar de día)', () => {
    // 23:50 hora local del 2026-08-26 no debe convertirse en 2026-08-27 (lo que
    // pasaría con toISOString() si el dispositivo está en un huso horario negativo).
    const referencia = new Date(2026, 7, 26, 23, 50);
    expect(hoyLocal(referencia)).toBe('2026-08-26');
  });

  it('funciona igual temprano a la mañana', () => {
    const referencia = new Date(2026, 7, 26, 0, 5);
    expect(hoyLocal(referencia)).toBe('2026-08-26');
  });
});

describe('diasEntre', () => {
  it('es 0 para el mismo día', () => {
    expect(diasEntre('2026-08-26', '2026-08-26')).toBe(0);
  });

  it('es 1 para días consecutivos', () => {
    expect(diasEntre('2026-08-25', '2026-08-26')).toBe(1);
  });

  it('cruza meses correctamente', () => {
    expect(diasEntre('2026-08-31', '2026-09-01')).toBe(1);
  });

  it('cruza años correctamente', () => {
    expect(diasEntre('2026-12-31', '2027-01-01')).toBe(1);
  });

  it('no se ve afectado por horario de verano', () => {
    // marzo 2026: cambio de horario en varios países del hemisferio sur/norte
    expect(diasEntre('2026-03-07', '2026-03-08')).toBe(1);
  });
});

describe('diaAnterior', () => {
  it('resta un día', () => {
    expect(diaAnterior('2026-08-26')).toBe('2026-08-25');
  });

  it('cruza meses', () => {
    expect(diaAnterior('2026-09-01')).toBe('2026-08-31');
  });

  it('cruza años', () => {
    expect(diaAnterior('2027-01-01')).toBe('2026-12-31');
  });
});
