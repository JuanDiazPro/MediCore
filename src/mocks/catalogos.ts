import type { Cie10, Servicio } from '@/types'

/** Catálogo CIE-10 de EJEMPLO (subconjunto pequeño, solo para el demo). */
export const CIE10: Cie10[] = [
  { codigo: 'A09', descripcion: 'Diarrea y gastroenteritis de presunto origen infeccioso' },
  { codigo: 'B35.3', descripcion: 'Tiña del pie' },
  { codigo: 'D50.9', descripcion: 'Anemia por deficiencia de hierro, sin otra especificación' },
  { codigo: 'E03.9', descripcion: 'Hipotiroidismo, no especificado' },
  { codigo: 'E11.9', descripcion: 'Diabetes mellitus tipo 2 sin complicaciones' },
  { codigo: 'E66.9', descripcion: 'Obesidad, no especificada' },
  { codigo: 'E78.5', descripcion: 'Hiperlipidemia, no especificada' },
  { codigo: 'F41.1', descripcion: 'Trastorno de ansiedad generalizada' },
  { codigo: 'G43.9', descripcion: 'Migraña, no especificada' },
  { codigo: 'H10.9', descripcion: 'Conjuntivitis, no especificada' },
  { codigo: 'H66.9', descripcion: 'Otitis media, no especificada' },
  { codigo: 'I10', descripcion: 'Hipertensión esencial (primaria)' },
  { codigo: 'I25.9', descripcion: 'Enfermedad isquémica crónica del corazón, no especificada' },
  { codigo: 'I48.9', descripcion: 'Fibrilación y aleteo auricular, no especificado' },
  { codigo: 'J00', descripcion: 'Rinofaringitis aguda (resfriado común)' },
  { codigo: 'J02.9', descripcion: 'Faringitis aguda, no especificada' },
  { codigo: 'J03.9', descripcion: 'Amigdalitis aguda, no especificada' },
  { codigo: 'J20.9', descripcion: 'Bronquitis aguda, no especificada' },
  { codigo: 'J30.4', descripcion: 'Rinitis alérgica, no especificada' },
  { codigo: 'J45.9', descripcion: 'Asma, no especificada' },
  { codigo: 'K21.9', descripcion: 'Enfermedad por reflujo gastroesofágico sin esofagitis' },
  { codigo: 'K29.7', descripcion: 'Gastritis, no especificada' },
  { codigo: 'K58.9', descripcion: 'Síndrome del colon irritable sin diarrea' },
  { codigo: 'L20.9', descripcion: 'Dermatitis atópica, no especificada' },
  { codigo: 'L70.0', descripcion: 'Acné vulgar' },
  { codigo: 'L40.0', descripcion: 'Psoriasis vulgar' },
  { codigo: 'M54.5', descripcion: 'Lumbago no especificado' },
  { codigo: 'M25.5', descripcion: 'Dolor en articulación' },
  { codigo: 'N39.0', descripcion: 'Infección de vías urinarias, sitio no especificado' },
  { codigo: 'N76.0', descripcion: 'Vaginitis aguda' },
  { codigo: 'N94.6', descripcion: 'Dismenorrea, no especificada' },
  { codigo: 'O26.9', descripcion: 'Complicación relacionada con el embarazo, no especificada' },
  { codigo: 'R05', descripcion: 'Tos' },
  { codigo: 'R10.4', descripcion: 'Otros dolores abdominales y los no especificados' },
  { codigo: 'R50.9', descripcion: 'Fiebre, no especificada' },
  { codigo: 'R51', descripcion: 'Cefalea' },
  { codigo: 'Z00.0', descripcion: 'Examen médico general' },
  { codigo: 'Z00.1', descripcion: 'Control de salud de rutina del niño' },
  { codigo: 'Z34.9', descripcion: 'Supervisión de embarazo normal, no especificado' },
  { codigo: 'Z71.3', descripcion: 'Consulta para instrucción y vigilancia de la dieta' },
]

export const SERVICIOS_BASE: Servicio[] = [
  { id: 'srv-01', nombre: 'Consulta general', duracionMin: 30, precio: 500, activo: true },
  { id: 'srv-02', nombre: 'Consulta de especialidad', duracionMin: 30, precio: 850, activo: true },
  { id: 'srv-03', nombre: 'Consulta de primera vez', duracionMin: 45, precio: 950, activo: true },
  { id: 'srv-04', nombre: 'Consulta de control', duracionMin: 30, precio: 450, activo: true },
  { id: 'srv-05', nombre: 'Ultrasonido', duracionMin: 30, precio: 1200, activo: true },
  { id: 'srv-06', nombre: 'Electrocardiograma', duracionMin: 30, precio: 650, activo: true },
  { id: 'srv-07', nombre: 'Valoración nutricional', duracionMin: 45, precio: 700, activo: true },
  { id: 'srv-08', nombre: 'Procedimiento menor', duracionMin: 60, precio: 1500, activo: true },
]

export const ESPECIALIDADES = [
  {
    nombre: 'Medicina general',
    color: '#14B8A6',
    servicios: ['srv-01', 'srv-04', 'srv-03'],
    dx: ['J00', 'J02.9', 'A09', 'R51', 'I10', 'E11.9', 'K29.7', 'Z00.0', 'N39.0', 'M54.5'],
  },
  {
    nombre: 'Pediatría',
    color: '#6366F1',
    servicios: ['srv-02', 'srv-04', 'srv-03'],
    dx: ['Z00.1', 'J00', 'H66.9', 'J03.9', 'A09', 'R50.9', 'L20.9', 'J45.9'],
  },
  {
    nombre: 'Ginecología',
    color: '#EC4899',
    servicios: ['srv-02', 'srv-05', 'srv-04'],
    dx: ['Z34.9', 'N76.0', 'N94.6', 'O26.9', 'N39.0', 'D50.9'],
  },
  {
    nombre: 'Cardiología',
    color: '#F97316',
    servicios: ['srv-02', 'srv-06', 'srv-04'],
    dx: ['I10', 'I25.9', 'I48.9', 'E78.5', 'R51'],
  },
  {
    nombre: 'Dermatología',
    color: '#0EA5E9',
    servicios: ['srv-02', 'srv-08', 'srv-04'],
    dx: ['L70.0', 'L20.9', 'L40.0', 'B35.3'],
  },
  {
    nombre: 'Nutrición',
    color: '#84CC16',
    servicios: ['srv-07', 'srv-04'],
    dx: ['E66.9', 'Z71.3', 'E11.9', 'E78.5', 'K58.9'],
  },
] as const

export const MEDICAMENTOS_EJEMPLO = [
  {
    nombre: 'Paracetamol 500 mg',
    dosis: '1 tableta',
    frecuencia: 'cada 8 horas',
    duracion: '3 días',
  },
  {
    nombre: 'Ibuprofeno 400 mg',
    dosis: '1 tableta',
    frecuencia: 'cada 8 horas',
    duracion: '5 días',
  },
  {
    nombre: 'Amoxicilina 500 mg',
    dosis: '1 cápsula',
    frecuencia: 'cada 8 horas',
    duracion: '7 días',
  },
  {
    nombre: 'Loratadina 10 mg',
    dosis: '1 tableta',
    frecuencia: 'cada 24 horas',
    duracion: '10 días',
  },
  { nombre: 'Omeprazol 20 mg', dosis: '1 cápsula', frecuencia: 'en ayunas', duracion: '14 días' },
  {
    nombre: 'Losartán 50 mg',
    dosis: '1 tableta',
    frecuencia: 'cada 24 horas',
    duracion: '30 días',
  },
  {
    nombre: 'Metformina 850 mg',
    dosis: '1 tableta',
    frecuencia: 'cada 12 horas',
    duracion: '30 días',
  },
  {
    nombre: 'Ácido fólico 5 mg',
    dosis: '1 tableta',
    frecuencia: 'cada 24 horas',
    duracion: '30 días',
  },
  {
    nombre: 'Clindamicina gel 1%',
    dosis: 'Capa delgada',
    frecuencia: 'cada 12 horas',
    duracion: '21 días',
  },
]

export const MOTIVOS_SEGUIMIENTO = [
  'Control de presión arterial',
  'Revisión de estudios de laboratorio',
  'Control de peso',
  'Revisión anual',
  'Control de glucosa',
  'Control prenatal',
  'Revisión de tratamiento dermatológico',
  'Control del niño sano',
]
