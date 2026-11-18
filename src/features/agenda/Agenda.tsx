import { useMemo, useRef, useState } from 'react'
import type {
  DateSelectArg,
  DatesSetArg,
  EventClickArg,
  EventContentArg,
  EventDropArg,
  EventInput,
} from '@fullcalendar/core'
import esLocale from '@fullcalendar/core/locales/es'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction'
import FullCalendar from '@fullcalendar/react'
import timeGridPlugin from '@fullcalendar/timegrid'
import { BellRing, Plus } from 'lucide-react'
import { useSearchParams } from 'react-router'

import { ErrorCarga } from '@/components/layout/Estados'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Label, Select } from '@/components/ui/form'
import { toast } from '@/components/ui/toast'
import { CitaDetalle } from '@/features/agenda/CitaDetalle'
import { CitaFormulario, type ValoresIniciales } from '@/features/agenda/CitaFormulario'
import { useCitas, useMoverCita } from '@/features/agenda/useCitas'
import { useUsuario } from '@/features/auth/sesion'
import { useMedicos, usePacientesIndice, useServicios } from '@/hooks/useCatalogos'
import { COLOR_ESTADO, ETIQUETA_ESTADO } from '@/lib/estados'
import { fechaHora } from '@/lib/formato'
import type { EstadoCita } from '@/types'

const esCelular = () => typeof window !== 'undefined' && window.innerWidth < 768

function ContenidoEvento({ event, view }: EventContentArg) {
  const { estado, paciente, servicio, recordatorio } = event.extendedProps as {
    estado: EstadoCita
    paciente: string
    servicio: string
    recordatorio: boolean
  }
  const mes = view.type === 'dayGridMonth'
  return (
    <div className="flex h-full min-w-0 items-start gap-1.5 overflow-hidden px-1.5 py-1 leading-tight">
      <span
        aria-hidden
        className="mt-1 size-2 shrink-0 rounded-full ring-2 ring-white"
        style={{ background: COLOR_ESTADO[estado] }}
      />
      <span className="min-w-0">
        <span className="block truncate text-xs font-semibold text-navy">
          {mes && `${event.start?.toTimeString().slice(0, 5)} `}
          {paciente}
        </span>
        {!mes && <span className="block truncate text-[11px] text-slate-600">{servicio}</span>}
      </span>
      {recordatorio && !mes && (
        <BellRing
          aria-label="Recordatorio enviado"
          className="ml-auto size-3 shrink-0 text-brand-hover"
        />
      )}
    </div>
  )
}

export function Agenda() {
  const usuario = useUsuario()
  const [params, setParams] = useSearchParams()
  const pacienteInicial = params.get('paciente') ?? undefined
  const [medicoId, setMedicoId] = useState(usuario.rol === 'medico' ? (usuario.medicoId ?? '') : '')
  const [verCanceladas, setVerCanceladas] = useState(false)
  const [rango, setRango] = useState<{ desde: string; hasta: string } | null>(null)
  const [detalle, setDetalle] = useState<string | null>(null)
  const [nueva, setNueva] = useState<ValoresIniciales | null>(
    pacienteInicial ? { pacienteId: pacienteInicial } : null,
  )
  const calendario = useRef<FullCalendar>(null)

  const { data: medicos = [], porId: medicosPorId } = useMedicos()
  const { porId: pacientes } = usePacientesIndice()
  const { porId: servicios } = useServicios()
  const citas = useCitas(
    { desde: rango?.desde, hasta: rango?.hasta, medicoId: medicoId || undefined },
    !!rango,
  )
  const mover = useMoverCita()

  const eventos = useMemo<EventInput[]>(
    () =>
      (citas.data ?? [])
        .filter((c) => verCanceladas || c.estado !== 'cancelada')
        .map((c) => {
          const medico = medicosPorId.get(c.medicoId)
          const p = pacientes.get(c.pacienteId)
          const color = medico?.color ?? '#14B8A6'
          return {
            id: c.id,
            start: c.inicio,
            end: c.fin,
            title: p ? `${p.nombre} ${p.apellidos}` : 'Paciente',
            backgroundColor: `${color}26`,
            borderColor: color,
            textColor: '#0F2A44',
            editable: c.estado === 'pendiente' || c.estado === 'confirmada',
            classNames: [`cita-${c.estado}`],
            extendedProps: {
              estado: c.estado,
              paciente: p ? `${p.nombre} ${p.apellidos.split(' ')[0]}` : '…',
              servicio: servicios.get(c.servicioId)?.nombre ?? '',
              recordatorio: c.recordatorioEnviado,
            },
          }
        }),
    [citas.data, medicosPorId, pacientes, servicios, verCanceladas],
  )

  const medicoSeleccionado = medicosPorId.get(medicoId)
  const horarioLaboral = medicoSeleccionado
    ? medicoSeleccionado.horario.map((h) => ({
        daysOfWeek: [h.dia],
        startTime: h.inicio,
        endTime: h.fin,
      }))
    : { daysOfWeek: [1, 2, 3, 4, 5, 6], startTime: '08:00', endTime: '20:00' }

  const alSoltar = (info: EventDropArg) => {
    mover.mutate(
      {
        id: info.event.id,
        inicio: info.event.start!.toISOString(),
        fin: info.event.end?.toISOString(),
      },
      {
        onSuccess: (c) => toast.exito('Cita reprogramada', fechaHora(c.inicio)),
        onError: (e) => {
          info.revert()
          toast.error('No se pudo mover la cita', e.message)
        },
      },
    )
  }

  return (
    <>
      <PageHeader
        titulo="Agenda"
        descripcion="Arrastra una cita para reprogramarla o selecciona un horario libre para agendar."
        acciones={
          <Button onClick={() => setNueva({ medicoId: medicoId || undefined })}>
            <Plus />
            Nueva cita
          </Button>
        }
      />

      <Card className="gap-5 p-4 sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex flex-col gap-1.5 lg:w-80">
            <Label htmlFor="a-medico">Médico</Label>
            <Select id="a-medico" value={medicoId} onChange={(e) => setMedicoId(e.target.value)}>
              <option value="">Todos los médicos</option>
              {medicos.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.nombre} · {m.especialidad}
                </option>
              ))}
            </Select>
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
            {(['pendiente', 'confirmada', 'asistio', 'no_asistio'] as EstadoCita[]).map((e) => (
              <span key={e} className="inline-flex items-center gap-1.5">
                <span className="size-2 rounded-full" style={{ background: COLOR_ESTADO[e] }} />
                {ETIQUETA_ESTADO[e]}
              </span>
            ))}
            <span className="inline-flex items-center gap-1.5">
              <BellRing className="size-3 text-brand-hover" />
              Recordatorio enviado
            </span>
            <label className="inline-flex cursor-pointer items-center gap-2 font-medium text-navy">
              <input
                type="checkbox"
                className="size-4 accent-[#14B8A6]"
                checked={verCanceladas}
                onChange={(e) => setVerCanceladas(e.target.checked)}
              />
              Ver canceladas
            </label>
          </div>
        </div>

        {!medicoId && (
          <div className="flex flex-wrap gap-2">
            {medicos.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => setMedicoId(m.id)}
                className="inline-flex items-center gap-2 rounded-full bg-muted px-3 py-1 text-xs font-medium text-navy hover:bg-brand-soft"
              >
                <span className="size-2.5 rounded-full" style={{ background: m.color }} />
                {m.nombre.replace(/^(Dra?\.)\s/, '$1 ')}
              </button>
            ))}
          </div>
        )}

        {citas.isError && <ErrorCarga error={citas.error} reintentar={() => citas.refetch()} />}

        <div className="agenda relative">
          {citas.isFetching && (
            <div className="absolute top-2 right-2 z-10 rounded-full bg-white px-3 py-1 text-xs text-muted-foreground shadow-soft">
              Cargando…
            </div>
          )}
          <FullCalendar
            ref={calendario}
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            locale={esLocale}
            initialView={esCelular() ? 'timeGridDay' : 'timeGridWeek'}
            headerToolbar={{
              left: 'prev,next today',
              center: 'title',
              right: 'timeGridDay,timeGridWeek,dayGridMonth',
            }}
            buttonText={{ today: 'Hoy', day: 'Día', week: 'Semana', month: 'Mes' }}
            height="auto"
            slotMinTime="07:00:00"
            slotMaxTime="21:00:00"
            slotDuration="00:30:00"
            allDaySlot={false}
            nowIndicator
            hiddenDays={[0]}
            businessHours={horarioLaboral}
            selectable
            selectMirror
            eventDurationEditable={false}
            dayMaxEvents={3}
            slotEventOverlap={false}
            eventMaxStack={medicoId ? undefined : 2}
            moreLinkText={(n) => `+${n} más`}
            events={eventos}
            eventContent={ContenidoEvento}
            datesSet={(arg: DatesSetArg) =>
              setRango((r) =>
                r?.desde === arg.start.toISOString() && r?.hasta === arg.end.toISOString()
                  ? r
                  : { desde: arg.start.toISOString(), hasta: arg.end.toISOString() },
              )
            }
            select={(arg: DateSelectArg) => {
              setNueva({ inicio: arg.start, medicoId: medicoId || undefined })
              arg.view.calendar.unselect()
            }}
            eventClick={(arg: EventClickArg) => setDetalle(arg.event.id)}
            eventDrop={alSoltar}
          />
        </div>
      </Card>

      <CitaFormulario
        abierto={!!nueva}
        alCambiar={(v) => {
          if (!v) {
            setNueva(null)
            if (params.has('paciente')) setParams({}, { replace: true })
          }
        }}
        iniciales={nueva ?? undefined}
      />
      <CitaDetalle citaId={detalle} alCerrar={() => setDetalle(null)} />
    </>
  )
}
