import { z } from 'zod'

/** Número opcional dentro de un rango; acepta campo vacío. */
const numeroOpcional = (min: number, max: number, mensaje: string) =>
  z.preprocess(
    (v) => (v === '' || v === null || v === undefined || Number.isNaN(v) ? undefined : Number(v)),
    z.number({ error: mensaje }).min(min, mensaje).max(max, mensaje).optional(),
  )

export const esquemaSignos = z.object({
  presionSistolica: numeroOpcional(60, 250, 'Entre 60 y 250 mmHg.'),
  presionDiastolica: numeroOpcional(30, 150, 'Entre 30 y 150 mmHg.'),
  frecuenciaCardiaca: numeroOpcional(30, 220, 'Entre 30 y 220 lpm.'),
  temperatura: numeroOpcional(34, 43, 'Entre 34 y 43 °C.'),
  pesoKg: numeroOpcional(1, 300, 'Entre 1 y 300 kg.'),
  tallaCm: numeroOpcional(30, 230, 'Entre 30 y 230 cm.'),
})

export const esquemaMedicamento = z.object({
  nombre: z.string().trim().min(2, 'Nombre del medicamento.'),
  dosis: z.string().trim().min(1, 'Dosis.'),
  frecuencia: z.string().trim().min(1, 'Frecuencia.'),
  duracion: z.string().trim().min(1, 'Duración.'),
})

export const esquemaConsulta = z.object({
  signos: esquemaSignos,
  subjetivo: z.string().trim().min(3, 'Describe lo que refiere el paciente.'),
  objetivo: z.string().trim().min(3, 'Anota la exploración física.'),
  analisis: z.string().trim().min(3, 'Escribe tu análisis o impresión diagnóstica.'),
  plan: z.string().trim().min(3, 'Describe el plan de manejo.'),
  diagnosticos: z
    .array(z.object({ codigo: z.string(), descripcion: z.string() }))
    .min(1, 'Agrega al menos un diagnóstico CIE-10.'),
  medicamentos: z.array(esquemaMedicamento),
  indicaciones: z.string().max(500),
})

export type DatosConsultaEntrada = z.input<typeof esquemaConsulta>
export type DatosConsulta = z.output<typeof esquemaConsulta>
