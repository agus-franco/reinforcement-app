import type { Objetivo } from '@/state/tipos';

export const OBJETIVOS: Objetivo[] = [
  {
    id: 'hablar-en-publico',
    nombre: 'Hablar en público',
    emoji: '🎤',
    frases: ['Amo hablar en público', 'Mi voz merece ser escuchada', 'Disfruto compartir mis ideas'],
  },
  {
    id: 'confianza',
    nombre: 'Confianza',
    emoji: '💪',
    frases: ['Confío en mí', 'Soy capaz de lograr lo que me propongo', 'Merezco las cosas buenas que me pasan'],
  },
  {
    id: 'disciplina',
    nombre: 'Disciplina',
    emoji: '🎯',
    frases: ['Termino lo que empiezo', 'Soy constante', 'Hago lo difícil primero'],
  },
  {
    id: 'calma',
    nombre: 'Calma / ansiedad',
    emoji: '🌊',
    frases: ['Estoy tranquilo y presente', 'Respiro y todo está bien', 'Suelto lo que no controlo'],
  },
  {
    id: 'salud',
    nombre: 'Salud / cuerpo',
    emoji: '🌱',
    frases: ['Cuido mi cuerpo todos los días', 'Me muevo porque me hace bien', 'Como para nutrirme'],
  },
  {
    id: 'dinero',
    nombre: 'Dinero / trabajo',
    emoji: '💼',
    frases: ['Genero valor y abundancia', 'Mi trabajo mejora cada día', 'Atraigo oportunidades'],
  },
];

export function objetivoPorId(id: string): Objetivo | undefined {
  return OBJETIVOS.find((o) => o.id === id);
}
