import { PagosTab } from '@/features/caja/PagosTab'
import { ExpedienteTab } from '@/features/expediente/ExpedienteTab'
import { PacienteFicha } from '@/features/pacientes/PacienteFicha'
import { SeguimientoTab } from '@/features/seguimiento/SeguimientoTab'

/** Ficha del paciente con las pestañas que aportan otros módulos. */
export function PaginaPaciente() {
  return (
    <PacienteFicha
      expediente={(id) => <ExpedienteTab pacienteId={id} />}
      pagos={(id) => <PagosTab pacienteId={id} />}
      seguimiento={(id) => <SeguimientoTab pacienteId={id} />}
    />
  )
}
