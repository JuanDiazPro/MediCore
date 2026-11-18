import { toast } from '@/components/ui/toast'
import { useClinica, useMedicos, usePacientesIndice, useServicios } from '@/hooks/useCatalogos'
import type { Pago } from '@/types'

/** Genera y descarga el recibo simulado (con folio y marca DEMO). */
export function useDescargarRecibo() {
  const { data: clinica } = useClinica()
  const { porId: pacientes } = usePacientesIndice()
  const { porId: servicios } = useServicios()
  const { porId: medicos } = useMedicos()
  return async (pago: Pago) => {
    const paciente = pacientes.get(pago.pacienteId)
    if (!clinica || !paciente) return toast.error('Aún se cargan los datos')
    const { crearReciboPdf, descargar } = await import('@/lib/pdf')
    descargar(
      crearReciboPdf({
        clinica,
        pago,
        paciente,
        servicio: servicios.get(pago.servicioId),
        medico: medicos.get(pago.medicoId),
      }),
      `recibo-DEMO-${pago.folio}.pdf`,
    )
  }
}
