import { useMemo, useState } from 'react'
import {
  AlarmClock,
  BellRing,
  CalendarCheck,
  CalendarClock,
  HeartPulse,
  Inbox,
  Megaphone,
  Send,
  UserCheck,
} from 'lucide-react'

import { Cargando, ErrorCarga, Vacio } from '@/components/layout/Estados'
import { EstadoBadge, RecordatorioBadge } from '@/components/layout/EstadoBadge'
import { PageHeader } from '@/components/layout/PageHeader'
import { StatCard } from '@/components/layout/StatCard'
import { Button } from '@/components/ui/button'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select } from '@/components/ui/form'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from '@/components/ui/toast'
import { PERMISOS } from '@/features/auth/permisos'
import { useUsuario } from '@/features/auth/sesion'
import { Bandeja } from '@/features/seguimiento/Bandeja'
import { Campanas } from '@/features/seguimiento/Campanas'
import { TablaPlanes } from '@/features/seguimiento/TablaPlanes'
import { useCitasManana, usePlanes, useRecordarManana } from '@/features/seguimiento/useSeguimiento'
import { useMedicos, usePacientesIndice, useServicios } from '@/hooks/useCatalogos'
import { ETIQUETA_CANAL } from '@/lib/estados'
import { hora } from '@/lib/formato'
import {
  clasificarPlan,
  ordenarPorPrioridad,
  resumenVencimientos,
  type Vencimiento,
} from '@/lib/seguimiento'
import type { CanalMensaje } from '@/types'

function CitasManana() {
  const citas = useCitasManana()
  const recordar = useRecordarManana()
  const { porId: pacientes } = usePacientesIndice()
  const { porId: medicos } = useMedicos()
  const { porId: servicios } = useServicios()
  const [canal, setCanal] = useState<CanalMensaje>('whatsapp')

  if (citas.isPending) return <Cargando />
  if (citas.isError) return <ErrorCarga error={citas.error} reintentar={() => citas.refetch()} />
  const sinRecordatorio = citas.data.filter((c) => !c.recordatorioEnviado).length

  return (
    <Card>
      <CardHeader className="gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <CardTitle>Citas de mañana</CardTitle>
          <CardDescription>
            {citas.data.length} citas · {sinRecordatorio} sin recordatorio
          </CardDescription>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <div className="sm:w-40">
            <Select
              aria-label="Canal"
              value={canal}
              onChange={(e) => setCanal(e.target.value as CanalMensaje)}
            >
              <option value="whatsapp">WhatsApp</option>
              <option value="sms">SMS</option>
              <option value="correo">Correo</option>
            </Select>
          </div>
          <Button
            disabled={sinRecordatorio === 0 || recordar.isPending}
            onClick={() =>
              recordar.mutate(canal, {
                onSuccess: (n) =>
                  toast.mensaje(
                    `${n} recordatorios enviados por ${ETIQUETA_CANAL[canal]} (simulado)`,
                    'Los pacientes recibirán el aviso de su cita de mañana.',
                  ),
              })
            }
          >
            <Send />
            {recordar.isPending ? 'Enviando…' : 'Recordar a todos'}
          </Button>
        </div>
      </CardHeader>
      {citas.data.length === 0 ? (
        <Vacio icono={CalendarClock} titulo="No hay citas para mañana" />
      ) : (
        <ul className="divide-y divide-border">
          {citas.data.map((c) => {
            const p = pacientes.get(c.pacienteId)
            return (
              <li key={c.id} className="flex flex-wrap items-center justify-between gap-2 py-3">
                <div className="flex items-center gap-4">
                  <span className="w-12 font-semibold text-navy">{hora(c.inicio)}</span>
                  <div>
                    <p className="font-semibold text-navy">
                      {p ? `${p.nombre} ${p.apellidos}` : '…'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {servicios.get(c.servicioId)?.nombre} · {medicos.get(c.medicoId)?.nombre}
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <EstadoBadge estado={c.estado} />
                  {c.recordatorioEnviado && <RecordatorioBadge />}
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </Card>
  )
}

const FILTROS: { valor: Vencimiento | 'todos'; etiqueta: string }[] = [
  { valor: 'todos', etiqueta: 'Todos' },
  { valor: 'vencido', etiqueta: 'Vencidos' },
  { valor: 'esta_semana', etiqueta: 'Esta semana' },
  { valor: 'proximo', etiqueta: 'Al corriente' },
]

export function Seguimiento() {
  const usuario = useUsuario()
  const medicoId = usuario.rol === 'medico' ? usuario.medicoId : undefined
  const planes = usePlanes({ medicoId })
  const [filtro, setFiltro] = useState<Vencimiento | 'todos'>('vencido')

  const resumen = useMemo(() => resumenVencimientos(planes.data ?? []), [planes.data])
  const lista = useMemo(
    () =>
      ordenarPorPrioridad(planes.data ?? []).filter(
        (p) => filtro === 'todos' || clasificarPlan(p) === filtro,
      ),
    [planes.data, filtro],
  )

  return (
    <>
      <PageHeader
        titulo="Seguimiento activo"
        descripcion="Que los pacientes lleguen a su cita y regresen a su control."
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <StatCard
          icono={AlarmClock}
          valor={String(resumen.vencido)}
          etiqueta="Controles vencidos"
          cargando={planes.isPending}
          tono="malo"
          detalle="Contactar hoy"
        />
        <StatCard
          icono={CalendarClock}
          valor={String(resumen.esta_semana)}
          etiqueta="Vencen esta semana"
          cargando={planes.isPending}
        />
        <StatCard
          icono={UserCheck}
          valor={String(resumen.proximo)}
          etiqueta="Pacientes al corriente"
          cargando={planes.isPending}
          tono="bueno"
        />
      </div>

      <Tabs defaultValue="planes">
        <TabsList>
          <TabsTrigger value="planes">
            <HeartPulse />
            Por contactar
          </TabsTrigger>
          <TabsTrigger value="manana">
            <CalendarCheck />
            Citas de mañana
          </TabsTrigger>
          {PERMISOS.enviarCampanas(usuario.rol) && (
            <TabsTrigger value="campanas">
              <Megaphone />
              Campañas
            </TabsTrigger>
          )}
          <TabsTrigger value="bandeja">
            <Inbox />
            Bandeja
          </TabsTrigger>
        </TabsList>

        <TabsContent value="planes">
          <Card>
            <div className="flex flex-wrap gap-2" role="group" aria-label="Filtrar planes">
              {FILTROS.map((f) => (
                <Button
                  key={f.valor}
                  size="sm"
                  variant={filtro === f.valor ? 'default' : 'secondary'}
                  aria-pressed={filtro === f.valor}
                  onClick={() => setFiltro(f.valor)}
                >
                  {f.etiqueta}
                </Button>
              ))}
            </div>
            {planes.isPending ? (
              <Cargando />
            ) : planes.isError ? (
              <ErrorCarga error={planes.error} reintentar={() => planes.refetch()} />
            ) : lista.length === 0 ? (
              <Vacio icono={BellRing} titulo="Nada pendiente en este filtro" />
            ) : (
              <TablaPlanes planes={lista} />
            )}
          </Card>
        </TabsContent>
        <TabsContent value="manana">
          <CitasManana />
        </TabsContent>
        {PERMISOS.enviarCampanas(usuario.rol) && (
          <TabsContent value="campanas">
            <Campanas />
          </TabsContent>
        )}
        <TabsContent value="bandeja">
          <Card>
            <Bandeja />
          </Card>
        </TabsContent>
      </Tabs>
    </>
  )
}
