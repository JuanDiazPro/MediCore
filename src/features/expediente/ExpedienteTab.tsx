import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  CalendarDays,
  ChevronDown,
  Download,
  HeartPulse,
  History,
  Pencil,
  Stethoscope,
  Wallet,
} from 'lucide-react'

import { Cargando, ErrorCarga, Vacio } from '@/components/layout/Estados'
import { EstadoBadge } from '@/components/layout/EstadoBadge'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { useCitas } from '@/features/agenda/useCitas'
import { PERMISOS } from '@/features/auth/permisos'
import { useUsuario } from '@/features/auth/sesion'
import { usePagos } from '@/features/caja/usePagos'
import { useConsultasPaciente } from '@/features/consultas/useConsultas'
import { useDescargarReceta } from '@/features/consultas/useDescargarReceta'
import { HistoriaFormulario } from '@/features/expediente/HistoriaFormulario'
import { construirLineaTiempo, type EventoTiempo } from '@/features/expediente/lineaTiempo'
import { usePaciente } from '@/features/pacientes/usePacientes'
import { usePlanes } from '@/features/seguimiento/useSeguimiento'
import { CLAVES, useMedicos, useServicios } from '@/hooks/useCatalogos'
import { ETIQUETA_METODO } from '@/lib/estados'
import { fechaCorta, fechaHora, formatearMoneda } from '@/lib/formato'
import { cn } from '@/lib/utils'
import { pacientesService } from '@/services'
import type { Consulta, Paciente } from '@/types'

const ICONOS = {
  consulta: Stethoscope,
  cita: CalendarDays,
  pago: Wallet,
  seguimiento: HeartPulse,
}

function DetalleConsulta({ consulta, paciente }: { consulta: Consulta; paciente: Paciente }) {
  const descargar = useDescargarReceta()
  const s = consulta.signos
  const signos = [
    s.presionSistolica && `TA ${s.presionSistolica}/${s.presionDiastolica ?? '—'} mmHg`,
    s.frecuenciaCardiaca && `FC ${s.frecuenciaCardiaca} lpm`,
    s.temperatura && `T ${s.temperatura} °C`,
    s.pesoKg && `Peso ${s.pesoKg} kg`,
    s.tallaCm && `Talla ${s.tallaCm} cm`,
  ].filter(Boolean)
  return (
    <div className="mt-3 flex flex-col gap-3 rounded-2xl bg-muted/70 p-4 text-sm">
      {signos.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {signos.map((x) => (
            <Badge key={String(x)} variant="neutral" className="bg-white">
              {x}
            </Badge>
          ))}
        </div>
      )}
      <dl className="grid gap-3 sm:grid-cols-2">
        {(
          [
            ['Subjetivo', consulta.subjetivo],
            ['Objetivo', consulta.objetivo],
            ['Análisis', consulta.analisis],
            ['Plan', consulta.plan],
          ] as const
        ).map(([t, v]) => (
          <div key={t}>
            <dt className="text-xs font-semibold text-brand-hover uppercase">{t}</dt>
            <dd className="text-navy">{v}</dd>
          </div>
        ))}
      </dl>
      {consulta.receta && (
        <div className="flex flex-col gap-2 border-t border-border pt-3 sm:flex-row sm:items-center sm:justify-between">
          <ul className="text-navy">
            {consulta.receta.medicamentos.map((m) => (
              <li key={m.nombre}>
                <strong>{m.nombre}</strong>: {m.dosis}, {m.frecuencia}, {m.duracion}
              </li>
            ))}
          </ul>
          <Button size="sm" variant="secondary" onClick={() => descargar(consulta, paciente)}>
            <Download />
            Receta PDF
          </Button>
        </div>
      )}
    </div>
  )
}

function ElementoTiempo({ e, paciente }: { e: EventoTiempo; paciente: Paciente }) {
  const [abierto, setAbierto] = useState(false)
  const { porId: medicos } = useMedicos()
  const { porId: servicios } = useServicios()
  const Icono = ICONOS[e.tipo]

  let titulo: string
  let detalle: string
  let extra = null
  if (e.tipo === 'consulta') {
    titulo =
      e.consulta.diagnosticos.map((d) => `${d.codigo} ${d.descripcion}`).join(' · ') || 'Consulta'
    detalle = `Consulta con ${medicos.get(e.consulta.medicoId)?.nombre ?? 'médico'}`
  } else if (e.tipo === 'cita') {
    titulo = servicios.get(e.cita.servicioId)?.nombre ?? 'Cita'
    detalle = `Cita con ${medicos.get(e.cita.medicoId)?.nombre ?? 'médico'}`
    extra = <EstadoBadge estado={e.cita.estado} />
  } else if (e.tipo === 'pago') {
    titulo = `Pago ${e.pago.folio}: ${formatearMoneda(e.pago.monto)}`
    detalle = `${servicios.get(e.pago.servicioId)?.nombre ?? ''} · ${ETIQUETA_METODO[e.pago.metodo]}`
  } else {
    titulo = `Plan de seguimiento: ${e.plan.motivo}`
    detalle = `Próximo control ${fechaCorta(e.plan.proximaFecha)}`
    extra = (
      <Badge variant={e.plan.estado === 'activo' ? 'default' : 'neutral'}>
        {e.plan.estado === 'activo' ? 'Activo' : 'Cerrado'}
      </Badge>
    )
  }

  return (
    <li className="group relative pb-6 pl-14 last:pb-0">
      <span
        aria-hidden
        className="absolute top-12 bottom-0 left-[21px] w-px bg-border group-last:hidden"
      />
      <span
        className={cn(
          'absolute top-0 left-0 grid size-11 place-items-center rounded-full',
          e.tipo === 'consulta' ? 'bg-brand text-white' : 'bg-brand-soft text-brand-hover',
        )}
      >
        <Icono aria-hidden className="size-5" strokeWidth={1.75} />
      </span>
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-xs text-muted-foreground">{fechaHora(e.fecha)}</p>
          <p className="font-semibold text-navy">{titulo}</p>
          <p className="text-sm text-muted-foreground">{detalle}</p>
        </div>
        <div className="flex items-center gap-2">
          {extra}
          {e.tipo === 'consulta' && (
            <Button
              size="sm"
              variant="ghost"
              aria-expanded={abierto}
              onClick={() => setAbierto((v) => !v)}
            >
              {abierto ? 'Ocultar' : 'Ver nota'}
              <ChevronDown className={cn('transition-transform', abierto && 'rotate-180')} />
            </Button>
          )}
        </div>
      </div>
      {abierto && e.tipo === 'consulta' && (
        <DetalleConsulta consulta={e.consulta} paciente={paciente} />
      )}
    </li>
  )
}

export function ExpedienteTab({ pacienteId }: { pacienteId: string }) {
  const usuario = useUsuario()
  const paciente = usePaciente(pacienteId)
  const consultas = useConsultasPaciente(pacienteId)
  const citas = useCitas({ pacienteId })
  const pagos = usePagos({ pacienteId })
  const planes = usePlanes({ pacienteId, incluirCerrados: true })
  const bitacora = useQuery({
    queryKey: [...CLAVES.bitacora, pacienteId],
    queryFn: () => pacientesService.bitacora(pacienteId),
  })
  const [editar, setEditar] = useState(false)
  const [mostrar, setMostrar] = useState(10)

  const linea = useMemo(
    () =>
      construirLineaTiempo(
        consultas.data ?? [],
        (citas.data ?? []).filter(
          (c) => c.inicio <= new Date().toISOString() || c.estado !== 'cancelada',
        ),
        pagos.data ?? [],
        planes.data ?? [],
      ),
    [consultas.data, citas.data, pagos.data, planes.data],
  )

  if (paciente.isPending) return <Cargando />
  if (paciente.isError) return <ErrorCarga error={paciente.error} />
  const p = paciente.data
  const cargandoLinea =
    consultas.isPending || citas.isPending || pagos.isPending || planes.isPending
  const errorLinea = consultas.error ?? citas.error ?? pagos.error ?? planes.error

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_1.6fr]">
      <div className="flex flex-col gap-6">
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Historia clínica</CardTitle>
            {PERMISOS.editarExpediente(usuario.rol) && (
              <Button size="sm" variant="secondary" onClick={() => setEditar(true)}>
                <Pencil />
                Editar
              </Button>
            )}
          </CardHeader>
          <dl className="flex flex-col gap-4 text-sm">
            {(
              [
                ['Heredofamiliares', p.historia.heredofamiliares],
                ['Personales patológicos', p.historia.personalesPatologicos],
                ['Personales no patológicos', p.historia.personalesNoPatologicos],
                ['Alergias', p.alergias.join(', ') || 'Ninguna conocida'],
              ] as const
            ).map(([t, v]) => (
              <div key={t}>
                <dt className="text-xs font-semibold text-brand-hover uppercase">{t}</dt>
                <dd className="text-navy">{v || 'Sin registrar'}</dd>
              </div>
            ))}
          </dl>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center gap-3">
            <History aria-hidden className="size-5 text-brand" />
            <CardTitle>Bitácora de cambios</CardTitle>
          </CardHeader>
          {bitacora.isPending ? (
            <Cargando filas={2} />
          ) : !bitacora.data?.length ? (
            <p className="text-sm text-muted-foreground">
              Aún no hay cambios registrados en este navegador.
            </p>
          ) : (
            <ul className="divide-y divide-border text-sm">
              {bitacora.data.slice(0, 8).map((b) => (
                <li key={b.id} className="py-2.5">
                  <p className="text-navy">{b.accion}</p>
                  <p className="text-xs text-muted-foreground">
                    {b.usuario} · {fechaHora(b.fecha)}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Línea de tiempo</CardTitle>
        </CardHeader>
        {cargandoLinea ? (
          <Cargando filas={5} />
        ) : errorLinea ? (
          <ErrorCarga error={errorLinea} />
        ) : linea.length === 0 ? (
          <Vacio titulo="Sin actividad registrada" />
        ) : (
          <>
            <ol>
              {linea.slice(0, mostrar).map((e) => (
                <ElementoTiempo
                  key={`${e.tipo}-${e.tipo === 'consulta' ? e.consulta.id : e.tipo === 'cita' ? e.cita.id : e.tipo === 'pago' ? e.pago.id : e.plan.id}`}
                  e={e}
                  paciente={p}
                />
              ))}
            </ol>
            {linea.length > mostrar && (
              <Button
                variant="secondary"
                size="sm"
                className="w-fit self-center"
                onClick={() => setMostrar((n) => n + 10)}
              >
                Ver más ({linea.length - mostrar})
              </Button>
            )}
          </>
        )}
      </Card>

      <HistoriaFormulario abierto={editar} alCambiar={setEditar} paciente={p} />
    </div>
  )
}
