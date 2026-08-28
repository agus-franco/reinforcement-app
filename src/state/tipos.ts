export const META_REPETICIONES = 100;

export type Intensidad = 'despacio' | 'moderado' | 'intenso' | 'profundo';

export const DURACION_SEG: Record<Intensidad, number> = {
  despacio: 60,
  moderado: 180,
  intenso: 300,
  profundo: 600,
};

export interface Objetivo {
  id: string;
  nombre: string;
  emoji: string;
  frases: string[];
}

export interface FraseActiva {
  id: string;
  texto: string;
  objetivoId: string;
  repeticiones: number;
  grabada: boolean;
  creadaEl: string;
  grabadaEl?: string;
}

export interface Sesion {
  id: string;
  fecha: string;
  fraseId: string;
  intensidad: Intensidad;
  repeticiones: number;
  doradas: number;
  duracionRealSeg: number;
}

export interface EstadoApp {
  onboardingCompleto: boolean;
  fraseActivaId: string | null;
  frases: FraseActiva[];
  sesiones: Sesion[];
  rachaActual: number;
  mejorRacha: number;
  ultimoDiaCompletado: string | null;
  protectores: number;
  intensidadDefault: Intensidad;
  horaRecordatorio: string;
}

export type EstadoPersonaje = 'radiante' | 'feliz' | 'preocupado' | 'triste';

export interface SesionActual {
  fraseId: string;
  intensidad: Intensidad;
  inicioTs: number;
  repeticiones: number;
  doradas: number;
  /** grabada ya estaba en true al arrancar esta sesión (para no re-festejar). */
  yaGrabadaAlEmpezar: boolean;
}

export interface ResumenSesion {
  repeticionesHoy: number;
  totalFrase: number;
  metaFrase: number;
  /** Se grabó (llegó a 100) recién en ESTA sesión, no que ya estuviera grabada. */
  fraseRecienGrabada: boolean;
  rachaActual: number;
  huboDoradas: boolean;
  esRecordPersonal: boolean;
}
