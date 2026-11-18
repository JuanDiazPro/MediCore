import { ExpedienteTab } from '@/features/expediente/ExpedienteTab'
import { PacienteFicha } from '@/features/pacientes/PacienteFicha'

/** Ficha del paciente con las pestañas que aportan otros módulos. */
export function PaginaPaciente() {
  return <PacienteFicha expediente={(id) => <ExpedienteTab pacienteId={id} />} />
}
