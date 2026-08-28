import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { hoyLocal } from '@/logic/fechas';
import { nuevoId } from '@/logic/id';
import { alCompletarDia, evaluarAlAbrir as evaluarRachaAlAbrir } from '@/logic/racha';
import type {
  EstadoApp,
  FraseActiva,
  Intensidad,
  ResumenSesion,
  Sesion,
  SesionActual,
} from './tipos';
import { META_REPETICIONES } from './tipos';

const SESION_STALE_MS = 30 * 60 * 1000;
const PROBABILIDAD_DORADA = 0.05;

interface Store extends EstadoApp {
  sesionActual: SesionActual | null;

  completarOnboarding: (objetivoId: string, textoFrase: string, hora: string) => void;
  iniciarSesion: (intensidad: Intensidad) => void;
  registrarRepeticion: () => { dorada: boolean };
  finalizarSesion: () => ResumenSesion | null;
  cambiarFraseActiva: (objetivoId: string, texto: string) => void;
  setAjuste: (
    cambios: Partial<Pick<EstadoApp, 'horaRecordatorio' | 'intensidadDefault' | 'hapticsActivado'>>,
  ) => void;
  evaluarAlAbrir: () => void;
  borrarTodo: () => void;
}

const estadoInicial: EstadoApp = {
  onboardingCompleto: false,
  fraseActivaId: null,
  frases: [],
  sesiones: [],
  rachaActual: 0,
  mejorRacha: 0,
  ultimoDiaCompletado: null,
  protectores: 0,
  intensidadDefault: 'moderado',
  horaRecordatorio: '09:00',
  hapticsActivado: true,
};

function crearFrase(objetivoId: string, texto: string): FraseActiva {
  return {
    id: nuevoId(),
    texto,
    objetivoId,
    repeticiones: 0,
    grabada: false,
    creadaEl: new Date().toISOString(),
  };
}

/** Cierra una sesión en curso y aplica sus efectos (racha, historial). Uso interno. */
function finalizarSesionInterna(get: () => Store, set: (fn: (s: Store) => Partial<Store>) => void): ResumenSesion | null {
  const estado = get();
  const sesionActual = estado.sesionActual;
  if (!sesionActual) return null;

  const hoy = hoyLocal();
  const duracionRealSeg = Math.round((Date.now() - sesionActual.inicioTs) / 1000);
  const sesion: Sesion = {
    id: nuevoId(),
    fecha: hoy,
    fraseId: sesionActual.fraseId,
    intensidad: sesionActual.intensidad,
    repeticiones: sesionActual.repeticiones,
    doradas: sesionActual.doradas,
    duracionRealSeg,
  };

  let { rachaActual, mejorRacha, ultimoDiaCompletado, protectores } = estado;
  if (sesionActual.repeticiones >= 1) {
    const r = alCompletarDia({ rachaActual, mejorRacha, ultimoDiaCompletado, protectores }, hoy);
    ({ rachaActual, mejorRacha, ultimoDiaCompletado, protectores } = r);
  }

  const frase = estado.frases.find((f) => f.id === sesionActual.fraseId);
  const mejorSesionPrevia = estado.sesiones.reduce((max, s) => Math.max(max, s.repeticiones), 0);
  const esRecordPersonal = sesionActual.repeticiones > 0 && sesionActual.repeticiones > mejorSesionPrevia;
  const fraseRecienGrabada = !!frase?.grabada && !sesionActual.yaGrabadaAlEmpezar;

  set(() => ({
    sesiones: [...estado.sesiones, sesion],
    rachaActual,
    mejorRacha,
    ultimoDiaCompletado,
    protectores,
    sesionActual: null,
  }));

  return {
    repeticionesHoy: sesionActual.repeticiones,
    totalFrase: frase ? frase.repeticiones : 0,
    metaFrase: META_REPETICIONES,
    fraseRecienGrabada,
    rachaActual,
    huboDoradas: sesionActual.doradas > 0,
    esRecordPersonal,
  };
}

export const useStore = create<Store>()(
  persist(
    (set, get) => ({
      ...estadoInicial,
      sesionActual: null,

      completarOnboarding: (objetivoId, textoFrase, hora) => {
        const frase = crearFrase(objetivoId, textoFrase);
        set({
          onboardingCompleto: true,
          fraseActivaId: frase.id,
          frases: [frase],
          horaRecordatorio: hora,
        });
      },

      iniciarSesion: (intensidad) => {
        const { fraseActivaId, frases } = get();
        if (!fraseActivaId) return;
        const frase = frases.find((f) => f.id === fraseActivaId);
        set({
          sesionActual: {
            fraseId: fraseActivaId,
            intensidad,
            inicioTs: Date.now(),
            repeticiones: 0,
            doradas: 0,
            yaGrabadaAlEmpezar: frase ? frase.grabada : false,
          },
        });
      },

      registrarRepeticion: () => {
        const estado = get();
        const sesionActual = estado.sesionActual;
        if (!sesionActual) return { dorada: false };

        const dorada = Math.random() < PROBABILIDAD_DORADA;
        const nuevaSesionActual: SesionActual = {
          ...sesionActual,
          repeticiones: sesionActual.repeticiones + 1,
          doradas: sesionActual.doradas + (dorada ? 1 : 0),
        };

        const frases = estado.frases.map((f) => {
          if (f.id !== sesionActual.fraseId || f.grabada) return f;
          const repeticiones = Math.min(META_REPETICIONES, f.repeticiones + 1);
          const grabada = repeticiones >= META_REPETICIONES;
          return {
            ...f,
            repeticiones,
            grabada,
            grabadaEl: grabada ? new Date().toISOString() : f.grabadaEl,
          };
        });

        set({ sesionActual: nuevaSesionActual, frases });
        return { dorada };
      },

      finalizarSesion: () => finalizarSesionInterna(get, set),

      cambiarFraseActiva: (objetivoId, texto) => {
        const estado = get();
        const existente = estado.frases.find(
          (f) => f.objetivoId === objetivoId && f.texto === texto && !f.grabada,
        );
        if (existente) {
          set({ fraseActivaId: existente.id });
          return;
        }
        const frase = crearFrase(objetivoId, texto);
        set({ fraseActivaId: frase.id, frases: [...estado.frases, frase] });
      },

      setAjuste: (cambios) => set(cambios),

      evaluarAlAbrir: () => {
        const estado = get();

        // Si quedó una sesión abierta hace rato (app cerrada a mitad de sesión), cerrarla.
        if (estado.sesionActual && Date.now() - estado.sesionActual.inicioTs > SESION_STALE_MS) {
          finalizarSesionInterna(get, set);
        }

        const hoy = hoyLocal();
        const r = evaluarRachaAlAbrir(
          {
            rachaActual: estado.rachaActual,
            mejorRacha: estado.mejorRacha,
            ultimoDiaCompletado: estado.ultimoDiaCompletado,
            protectores: estado.protectores,
          },
          hoy,
        );
        set({
          rachaActual: r.rachaActual,
          mejorRacha: r.mejorRacha,
          ultimoDiaCompletado: r.ultimoDiaCompletado,
          protectores: r.protectores,
        });
      },

      borrarTodo: () => set({ ...estadoInicial, sesionActual: null }),
    }),
    {
      name: 'rewire-estado',
      storage: createJSONStorage(() => AsyncStorage),
      version: 1,
      migrate: (persisted) => persisted as Store,
    },
  ),
);
