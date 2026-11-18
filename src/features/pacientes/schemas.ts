import { differenceInYears, isValid, parseISO } from 'date-fns'
import { z } from 'zod'

import type { NuevoPaciente } from '@/services'
import type { Paciente } from '@/types'

const TIPOS_SANGRE = ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'] as const

export const esquemaPaciente = z.object({
  nombre: z.string().trim().min(2, 'Escribe el nombre.').max(60),
  apellidos: z.string().trim().min(2, 'Escribe los apellidos.').max(80),
  fechaNacimiento: z
    .string()
    .min(1, 'Indica la fecha de nacimiento.')
    .refine((v) => isValid(parseISO(v)), 'Fecha no válida.')
    .refine((v) => parseISO(v) <= new Date(), 'La fecha no puede ser futura.')
    .refine((v) => differenceInYears(new Date(), parseISO(v)) <= 120, 'Revisa el año.'),
  sexo: z.enum(['F', 'M'], { error: 'Selecciona el sexo.' }),
  telefono: z
    .string()
    .trim()
    .refine((v) => v.replace(/[\s-]/g, '').length === 10, 'Debe tener 10 dígitos.')
    .refine((v) => /^[\d\s-]+$/.test(v), 'Solo números, espacios o guiones.'),
  correo: z.union([z.literal(''), z.email('Correo no válido.')]),
  tipoSangre: z.enum(TIPOS_SANGRE),
  medicoId: z.string().min(1, 'Selecciona el médico tratante.'),
  alergias: z.string().max(200),
})

export type DatosPaciente = z.infer<typeof esquemaPaciente>

export { TIPOS_SANGRE }

/** Formatea "5512345678" como "55 1234 5678". */
export function formatearTelefono(tel: string) {
  const d = tel.replace(/\D/g, '')
  return d.length === 10 ? `${d.slice(0, 2)} ${d.slice(2, 6)} ${d.slice(6)}` : tel.trim()
}

export function aFormulario(p?: Paciente): DatosPaciente {
  return {
    nombre: p?.nombre ?? '',
    apellidos: p?.apellidos ?? '',
    fechaNacimiento: p ? p.fechaNacimiento.slice(0, 10) : '',
    sexo: p?.sexo ?? ('' as 'F'),
    telefono: p?.telefono ?? '',
    correo: p?.correo ?? '',
    tipoSangre: p?.tipoSangre ?? 'O+',
    medicoId: p?.medicoId ?? '',
    alergias: p?.alergias.join(', ') ?? '',
  }
}

export function aPaciente(d: DatosPaciente, base?: Paciente): NuevoPaciente {
  return {
    nombre: d.nombre.trim(),
    apellidos: d.apellidos.trim(),
    fechaNacimiento: new Date(`${d.fechaNacimiento}T12:00:00`).toISOString(),
    sexo: d.sexo,
    telefono: formatearTelefono(d.telefono),
    correo: d.correo.trim().toLowerCase(),
    tipoSangre: d.tipoSangre,
    medicoId: d.medicoId,
    alergias: d.alergias
      .split(',')
      .map((a) => a.trim())
      .filter(Boolean),
    historia: base?.historia ?? {
      heredofamiliares: '',
      personalesPatologicos: '',
      personalesNoPatologicos: '',
    },
  }
}
