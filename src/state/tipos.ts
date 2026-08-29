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
  hapticsActivado: boolean;
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
  /** nivel ya alcanzado (nombre) al arrancar esta sesión, para detectar si subió uno nuevo. */
  nivelAlEmpezar: string | null;
}

export interface ResumenSesion {
  repeticionesHoy: number;
  totalFrase: number;
  /** Próximo umbral de nivel no alcanzado (o el umbral final si ya está en el último). */
  metaFrase: number;
  /** Se grabó (llegó al nivel final) recién en ESTA sesión, no que ya estuviera grabada. */
  fraseRecienGrabada: boolean;
  /** Nombre del nivel (intermedio o final) recién alcanzado en esta sesión, si hubo uno. */
  nivelNuevo: string | null;
  rachaActual: number;
  huboDoradas: boolean;
  esRecordPersonal: boolean;
}
