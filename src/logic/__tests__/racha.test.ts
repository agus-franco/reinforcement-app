import { alCompletarDia, estadoPersonaje, evaluarAlAbrir, PROTECTORES_MAX, type EstadoRacha } from '../racha';

const inicial: EstadoRacha = {
  rachaActual: 0,
  mejorRacha: 0,
  ultimoDiaCompletado: null,
  protectores: 0,
};

describe('alCompletarDia', () => {
  it('día 1: primera vez que se completa, racha pasa a 1', () => {
    const r = alCompletarDia(inicial, '2026-08-26');
    expect(r.rachaActual).toBe(1);
    expect(r.mejorRacha).toBe(1);
    expect(r.ultimoDiaCompletado).toBe('2026-08-26');
  });

  it('día consecutivo: racha suma 1', () => {
    const dia1 = alCompletarDia(inicial, '2026-08-26');
    const dia2 = alCompletarDia(dia1, '2026-08-27');
    expect(dia2.rachaActual).toBe(2);
    expect(dia2.mejorRacha).toBe(2);
  });

  it('doble sesión el mismo día: no incrementa dos veces', () => {
    const dia1 = alCompletarDia(inicial, '2026-08-26');
    const dia1DeNuevo = alCompletarDia(dia1, '2026-08-26');
    expect(dia1DeNuevo.rachaActual).toBe(1);
    expect(dia1DeNuevo).toEqual(dia1);
  });

  it('ganancia de protector cada 7 días consecutivos', () => {
    let e = inicial;
    let fecha = new Date(2026, 7, 20); // 2026-08-20
    for (let i = 0; i < 7; i++) {
      const f = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}-${String(fecha.getDate()).padStart(2, '0')}`;
      e = alCompletarDia(e, f);
      fecha = new Date(fecha.getTime() + 86_400_000);
    }
    expect(e.rachaActual).toBe(7);
    expect(e.protectores).toBe(1);
  });

  it('tope de protectores: no supera PROTECTORES_MAX aunque se acumulen varios múltiplos de 7', () => {
    let e: EstadoRacha = { ...inicial, protectores: PROTECTORES_MAX };
    let fecha = new Date(2026, 7, 20);
    for (let i = 0; i < 14; i++) {
      const f = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}-${String(fecha.getDate()).padStart(2, '0')}`;
      e = alCompletarDia(e, f);
      fecha = new Date(fecha.getTime() + 86_400_000);
    }
    expect(e.rachaActual).toBe(14); // dos múltiplos de 7 alcanzados (7 y 14)
    expect(e.protectores).toBe(PROTECTORES_MAX);
  });

  it('si no es consecutivo (llamado sin pasar por evaluarAlAbrir), reinicia en 1', () => {
    const dia1 = alCompletarDia(inicial, '2026-08-20');
    const conHueco = alCompletarDia(dia1, '2026-08-25'); // salto de varios días, sin evaluar
    expect(conHueco.rachaActual).toBe(1);
    expect(conHueco.mejorRacha).toBe(1); // la mejor racha anterior (1) ya era 1, no cambia
  });
});

describe('evaluarAlAbrir', () => {
  it('sin actividad previa: no hace nada', () => {
    expect(evaluarAlAbrir(inicial, '2026-08-26')).toEqual(inicial);
  });

  it('mismo día: no hace nada', () => {
    const e: EstadoRacha = { rachaActual: 3, mejorRacha: 3, ultimoDiaCompletado: '2026-08-26', protectores: 0 };
    expect(evaluarAlAbrir(e, '2026-08-26')).toEqual(e);
  });

  it('ayer fue el último día: todavía consecutivo, no toca nada', () => {
    const e: EstadoRacha = { rachaActual: 3, mejorRacha: 3, ultimoDiaCompletado: '2026-08-25', protectores: 0 };
    expect(evaluarAlAbrir(e, '2026-08-26')).toEqual(e);
  });

  it('salto de 1 día CON protector disponible: se cubre, racha se preserva', () => {
    const e: EstadoRacha = { rachaActual: 5, mejorRacha: 5, ultimoDiaCompletado: '2026-08-24', protectores: 1 };
    const r = evaluarAlAbrir(e, '2026-08-26'); // faltó el 25
    expect(r.rachaActual).toBe(5);
    expect(r.protectores).toBe(0);
    expect(r.ultimoDiaCompletado).toBe('2026-08-25'); // se corre a ayer
  });

  it('salto de 1 día SIN protector: se corta la racha', () => {
    const e: EstadoRacha = { rachaActual: 5, mejorRacha: 5, ultimoDiaCompletado: '2026-08-24', protectores: 0 };
    const r = evaluarAlAbrir(e, '2026-08-26');
    expect(r.rachaActual).toBe(0);
    expect(r.mejorRacha).toBe(5);
    expect(r.protectores).toBe(0); // no se consumen protectores que no había
  });

  it('salto de varios días con protectores suficientes: se cubre todo', () => {
    const e: EstadoRacha = { rachaActual: 10, mejorRacha: 10, ultimoDiaCompletado: '2026-08-20', protectores: 2 };
    const r = evaluarAlAbrir(e, '2026-08-23'); // faltan 21 y 22 = 2 días
    expect(r.rachaActual).toBe(10);
    expect(r.protectores).toBe(0);
    expect(r.ultimoDiaCompletado).toBe('2026-08-22');
  });

  it('salto de varios días con protectores insuficientes: se corta y no se consumen', () => {
    const e: EstadoRacha = { rachaActual: 10, mejorRacha: 10, ultimoDiaCompletado: '2026-08-20', protectores: 1 };
    const r = evaluarAlAbrir(e, '2026-08-23'); // faltan 2 días, solo hay 1 protector
    expect(r.rachaActual).toBe(0);
    expect(r.mejorRacha).toBe(10);
    expect(r.protectores).toBe(1); // se mantienen, no se gastan en un intento fallido
  });
});

describe('estadoPersonaje', () => {
  const HOY = '2026-08-26';

  it('radiante si ya completó hoy', () => {
    const e: EstadoRacha = { rachaActual: 3, mejorRacha: 3, ultimoDiaCompletado: HOY, protectores: 0 };
    expect(estadoPersonaje(e, HOY, 10)).toBe('radiante');
    expect(estadoPersonaje(e, HOY, 20)).toBe('radiante');
  });

  it('feliz si no completó hoy pero todavía es temprano', () => {
    const e: EstadoRacha = { rachaActual: 3, mejorRacha: 3, ultimoDiaCompletado: '2026-08-25', protectores: 0 };
    expect(estadoPersonaje(e, HOY, 10)).toBe('feliz');
  });

  it('preocupado si no completó hoy y ya es tarde', () => {
    const e: EstadoRacha = { rachaActual: 3, mejorRacha: 3, ultimoDiaCompletado: '2026-08-25', protectores: 0 };
    expect(estadoPersonaje(e, HOY, 18)).toBe('preocupado');
  });

  it('triste si la racha se perdió recién (racha 0, mejorRacha > 0)', () => {
    const e: EstadoRacha = { rachaActual: 0, mejorRacha: 5, ultimoDiaCompletado: '2026-08-20', protectores: 0 };
    expect(estadoPersonaje(e, HOY, 10)).toBe('triste');
    expect(estadoPersonaje(e, HOY, 20)).toBe('triste');
  });

  it('nunca completó nada: no es triste, solo feliz/preocupado', () => {
    expect(estadoPersonaje(inicial, HOY, 10)).toBe('feliz');
    expect(estadoPersonaje(inicial, HOY, 20)).toBe('preocupado');
  });
});
