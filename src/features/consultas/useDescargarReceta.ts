import { useClinica, useMedicos } from '@/hooks/useCatalogos'
import { toast } from '@/components/ui/toast'
import type { Consulta, Paciente } from '@/types'

/** Devuelve una función que genera y descarga la receta en PDF (carga jsPDF bajo demanda). */
export function useDescargarReceta() {
  const { data: clinica } = useClinica()
  const { porId: medicos } = useMedicos()
  return async (consulta: Consulta, paciente: Paciente) => {
    const medico = medicos.get(consulta.medicoId)
    if (!clinica || !medico) return toast.error('Aún se cargan los datos de la clínica')
    const { crearRecetaPdf, descargar } = await import('@/lib/pdf')
    descargar(
      crearRecetaPdf({ clinica, medico, paciente, consulta }),
      `receta-DEMO-${paciente.apellidos.split(' ')[0].toLowerCase()}-${consulta.fecha.slice(0, 10)}.pdf`,
    )
    toast.exito('Receta descargada', 'Lleva la marca de agua "DEMO, sin validez".')
  }
}
