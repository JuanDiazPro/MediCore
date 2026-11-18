import { useState } from 'react'
import { HeartPulse, MessageCircle, Plus } from 'lucide-react'

import { Cargando, ErrorCarga, Vacio } from '@/components/layout/Estados'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { Bandeja } from '@/features/seguimiento/Bandeja'
import { PlanFormulario } from '@/features/seguimiento/PlanFormulario'
import { RecordatorioDialogo } from '@/features/seguimiento/RecordatorioDialogo'
import { TablaPlanes } from '@/features/seguimiento/TablaPlanes'
import { usePlanes } from '@/features/seguimiento/useSeguimiento'
import { usePaciente } from '@/features/pacientes/usePacientes'
import { ordenarPorPrioridad } from '@/lib/seguimiento'

/** Pestaña "Seguimiento" de la ficha del paciente. */
export function SeguimientoTab({ pacienteId }: { pacienteId: string }) {
  const planes = usePlanes({ pacienteId, incluirCerrados: true })
  const paciente = usePaciente(pacienteId)
  const [nuevo, setNuevo] = useState(false)
  const [mensaje, setMensaje] = useState(false)

  return (
    <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
      <Card>
        <CardHeader className="flex-row flex-wrap items-center justify-between gap-3">
          <CardTitle>Planes de seguimiento</CardTitle>
          <Button size="sm" onClick={() => setNuevo(true)}>
            <Plus />
            Nuevo plan
          </Button>
        </CardHeader>
        {planes.isPending ? (
          <Cargando filas={2} />
        ) : planes.isError ? (
          <ErrorCarga error={planes.error} />
        ) : planes.data.length === 0 ? (
          <Vacio icono={HeartPulse} titulo="Sin planes de seguimiento" />
        ) : (
          <TablaPlanes planes={ordenarPorPrioridad(planes.data)} mostrarPaciente={false} />
        )}
      </Card>
      <Card>
        <CardHeader className="flex-row flex-wrap items-center justify-between gap-3">
          <CardTitle>Mensajes</CardTitle>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => setMensaje(true)}
            disabled={!paciente.data}
          >
            <MessageCircle />
            Enviar mensaje
          </Button>
        </CardHeader>
        <Bandeja pacienteId={pacienteId} />
      </Card>
      <PlanFormulario
        abierto={nuevo}
        alCambiar={setNuevo}
        pacienteId={pacienteId}
        medicoId={paciente.data?.medicoId}
      />
      <RecordatorioDialogo
        paciente={mensaje ? (paciente.data ?? null) : null}
        alCerrar={() => setMensaje(false)}
      />
    </div>
  )
}
