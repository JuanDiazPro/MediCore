import { useState } from 'react'
import { BellRing, CalendarPlus, CheckCheck, Pencil } from 'lucide-react'
import { Link } from 'react-router'

import { Avatar } from '@/components/layout/Avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { toast } from '@/components/ui/toast'
import { PlanFormulario } from '@/features/seguimiento/PlanFormulario'
import { RecordatorioDialogo } from '@/features/seguimiento/RecordatorioDialogo'
import { useCerrarPlan } from '@/features/seguimiento/useSeguimiento'
import { useMedicos, usePacientesIndice } from '@/hooks/useCatalogos'
import { clasificarPlan, diasDeAtraso } from '@/lib/seguimiento'
import { fechaCorta, haceTiempo } from '@/lib/formato'
import type { PlanSeguimiento } from '@/types'

function EstadoPlan({ plan }: { plan: PlanSeguimiento }) {
  const c = clasificarPlan(plan)
  if (c === 'vencido')
    return <Badge variant="no_asistio">Vencido hace {diasDeAtraso(plan)} d</Badge>
  if (c === 'esta_semana') return <Badge variant="pendiente">Esta semana</Badge>
  if (c === 'cerrado') return <Badge variant="neutral">Cerrado</Badge>
  return <Badge variant="confirmada">Al corriente</Badge>
}

/** Lista de planes con acciones: recordar, editar, cerrar y agendar. */
export function TablaPlanes({
  planes,
  mostrarPaciente = true,
}: {
  planes: PlanSeguimiento[]
  mostrarPaciente?: boolean
}) {
  const { porId: pacientes } = usePacientesIndice()
  const { porId: medicos } = useMedicos()
  const cerrar = useCerrarPlan()
  const [recordar, setRecordar] = useState<PlanSeguimiento | null>(null)
  const [editar, setEditar] = useState<PlanSeguimiento | null>(null)

  return (
    <>
      <ul className="divide-y divide-border">
        {planes.map((plan) => {
          const p = pacientes.get(plan.pacienteId)
          const nombre = p ? `${p.nombre} ${p.apellidos}` : '…'
          return (
            <li
              key={plan.id}
              className="flex flex-col gap-3 py-4 lg:flex-row lg:items-center lg:justify-between"
            >
              <div className="flex min-w-0 items-center gap-3">
                {mostrarPaciente && <Avatar nombre={nombre} />}
                <div className="min-w-0">
                  {mostrarPaciente && (
                    <Link
                      to={`/pacientes/${plan.pacienteId}?tab=seguimiento`}
                      className="font-semibold text-navy hover:text-brand-hover"
                    >
                      {nombre}
                    </Link>
                  )}
                  <p className={mostrarPaciente ? 'text-sm text-navy' : 'font-semibold text-navy'}>
                    {plan.motivo}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Control: {fechaCorta(plan.proximaFecha)} · {medicos.get(plan.medicoId)?.nombre}
                    {plan.ultimoRecordatorio &&
                      ` · Recordado ${haceTiempo(plan.ultimoRecordatorio)}`}
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2 lg:justify-end">
                <EstadoPlan plan={plan} />
                {plan.estado === 'activo' && (
                  <>
                    <Button size="sm" onClick={() => setRecordar(plan)} disabled={!p}>
                      <BellRing />
                      Recordar
                    </Button>
                    <Button asChild size="sm" variant="secondary">
                      <Link to={`/agenda?paciente=${plan.pacienteId}`}>
                        <CalendarPlus />
                        Agendar
                      </Link>
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      aria-label="Editar plan"
                      onClick={() => setEditar(plan)}
                    >
                      <Pencil className="size-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      aria-label="Cerrar plan"
                      disabled={cerrar.isPending}
                      onClick={() =>
                        cerrar.mutate(plan.id, {
                          onSuccess: () => toast.exito('Plan cerrado', plan.motivo),
                        })
                      }
                    >
                      <CheckCheck className="size-4" />
                    </Button>
                  </>
                )}
              </div>
            </li>
          )
        })}
      </ul>
      <RecordatorioDialogo
        paciente={recordar ? (pacientes.get(recordar.pacienteId) ?? null) : null}
        plan={recordar ?? undefined}
        alCerrar={() => setRecordar(null)}
      />
      {editar && (
        <PlanFormulario
          abierto={!!editar}
          alCambiar={(v) => !v && setEditar(null)}
          pacienteId={editar.pacienteId}
          plan={editar}
        />
      )}
    </>
  )
}
