import { z } from 'zod'

export const esquemaCita = z.object({
  pacienteId: z.string().min(1, 'Selecciona un paciente.'),
  medicoId: z.string().min(1, 'Selecciona un médico.'),
  servicioId: z.string().min(1, 'Selecciona un servicio.'),
  fecha: z.string().min(1, 'Indica la fecha.'),
  hora: z.string().regex(/^\d{2}:\d{2}$/, 'Indica la hora.'),
  notas: z.string().max(200).optional(),
})

export type DatosCita = z.infer<typeof esquemaCita>

/** Une fecha "yyyy-MM-dd" y hora "HH:mm" en una fecha local. */
export function combinarFechaHora(fecha: string, hora: string) {
  return new Date(`${fecha}T${hora}:00`)
}
