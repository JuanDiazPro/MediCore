import { useMemo } from 'react'
import { addDays, format, startOfDay, startOfMonth, startOfWeek, subMonths } from 'date-fns'
import { es } from 'date-fns/locale'
import {
  AlarmClock,
  ArrowRight,
  BellRing,
  CalendarCheck,
  CalendarDays,
  CircleDollarSign,
  Gauge,
  Receipt,
  Stethoscope,
  TrendingDown,
  UserX,
  Users,
} from 'lucide-react'
import { Link } from 'react-router'

import {
  GraficaApilada,
  GraficaBarras,
  GraficaLinea,
  TarjetaGrafica,
} from '@/components/charts/Graficas'
import { Cargando, ErrorCarga, Vacio } from '@/components/layout/Estados'
import { EstadoBadge, RecordatorioBadge } from '@/components/layout/EstadoBadge'
import { IconCircle } from '@/components/layout/IconCircle'
import { PageHeader } from '@/components/layout/PageHeader'
import { StatCard } from '@/components/layout/StatCard'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { useUsuario } from '@/features/auth/sesion'
import { useDatosTablero } from '@/features/dashboard/useDatosTablero'
import { usePlanes } from '@/features/seguimiento/useSeguimiento'
import { useMedicos, usePacientesIndice, useServicios } from '@/hooks/useCatalogos'
import { ETIQUETA_ROL } from '@/lib/estados'
import {
  formatearMonedaEntera,
  fechaLarga,
  formatearMoneda,
  formatearNumero,
  formatearPorcentaje,
  hora,
} from '@/lib/formato'
import {
  agrupar,
  impactoRecordatorios,
  ocupacion,
  sumarIngresos,
  tasaInasistencia,
} from '@/lib/metricas'
import { clasificarPlan } from '@/lib/seguimiento'
import type { Cita } from '@/types'

const moneda0 = (v: number) =>
  v >= 1000 ? `$${formatearNumero(Math.round(v / 1000))} mil` : formatearMoneda(v)
const pct = (v: number) => formatearPorcentaje(v)

function useRangos() {
  return useMemo(() => {
    const hoy = startOfDay(new Date())
    return {
      hoy,
      manana: addDays(hoy, 1),
      semana: startOfWeek(hoy, { weekStartsOn: 1 }),
      finSemana: addDays(startOfWeek(hoy, { weekStartsOn: 1 }), 7),
      mes: startOfMonth(hoy),
      mesPasado: startOfMonth(subMonths(hoy, 1)),
    }
  }, [])
}

const entre = (iso: string, a: Date, b: Date) => iso >= a.toISOString() && iso < b.toISOString()

function CitasDelDia({
  citas,
  titulo,
  mostrarMedico = true,
}: {
  citas: Cita[]
  titulo: string
  mostrarMedico?: boolean
}) {
  const { porId: pacientes } = usePacientesIndice()
  const { porId: servicios } = useServicios()
  const { porId: medicosPorId } = useMedicos()
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle>{titulo}</CardTitle>
        <Button asChild size="sm" variant="secondary">
          <Link to="/agenda">
            Agenda
            <ArrowRight />
          </Link>
        </Button>
      </CardHeader>
      {citas.length === 0 ? (
        <Vacio icono={CalendarDays} titulo="Sin citas hoy" />
      ) : (
        <ul className="max-h-[26rem] divide-y divide-border overflow-y-auto pr-1">
          {citas.map((c) => {
            const p = pacientes.get(c.pacienteId)
            return (
              <li key={c.id} className="flex flex-wrap items-center justify-between gap-2 py-3">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="w-12 shrink-0 font-semibold text-navy">{hora(c.inicio)}</span>
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-navy">
                      {p ? `${p.nombre} ${p.apellidos}` : '…'}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {servicios.get(c.servicioId)?.nombre}
                      {mostrarMedico && ` · ${medicosPorId.get(c.medicoId)?.nombre ?? ''}`}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  {c.recordatorioEnviado && c.estado !== 'asistio' && <RecordatorioBadge />}
                  <EstadoBadge estado={c.estado} />
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </Card>
  )
}

function TableroAdmin() {
  const r = useRangos()
  const d = useDatosTablero()

  const kpis = useMemo(() => {
    const hoy = d.citas.filter((c) => entre(c.inicio, r.hoy, r.manana) && c.estado !== 'cancelada')
    const ultimos30 = d.citas.filter((c) => entre(c.inicio, addDays(r.hoy, -30), r.hoy))
    const ingresosMes = sumarIngresos(d.pagos.filter((p) => entre(p.fecha, r.mes, r.manana)))
    const ingresosPasado = sumarIngresos(d.pagos.filter((p) => entre(p.fecha, r.mesPasado, r.mes)))
    return {
      hoy,
      ocupacion: ocupacion(d.citas, d.medicos, r.semana, r.finSemana),
      inasistencia: tasaInasistencia(ultimos30),
      ingresosMes,
      ingresosPasado,
    }
  }, [d.citas, d.pagos, d.medicos, r])

  const impacto = useMemo(
    () => (d.clinica ? impactoRecordatorios(d.citas, d.clinica.recordatoriosDesde) : null),
    [d.citas, d.clinica],
  )
  const porMedico = useMemo(
    () =>
      agrupar(
        d.citas.filter((c) => entre(c.inicio, r.mes, r.manana) && c.estado !== 'cancelada'),
        (c) => d.medicosPorId.get(c.medicoId)?.nombre.replace(/^Dra?\.\s/, '') ?? c.medicoId,
      ).map((x) => ({ medico: x.clave, citas: x.valor })),
    [d.citas, d.medicosPorId, r],
  )
  const mesRecordatorios = d.clinica
    ? format(new Date(d.clinica.recordatoriosDesde), 'MMM yy', { locale: es }).replace('.', '')
    : undefined

  if (d.cargando) return <Cargando filas={8} />
  if (d.error) return <ErrorCarga error={d.error} reintentar={d.reintentar} />

  const variacion = kpis.ingresosPasado ? kpis.ingresosMes / kpis.ingresosPasado - 1 : 0

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icono={CalendarCheck}
          valor={String(kpis.hoy.length)}
          etiqueta="Citas de hoy"
          detalle={`${kpis.hoy.filter((c) => c.estado === 'confirmada').length} confirmadas`}
        />
        <StatCard icono={Gauge} valor={pct(kpis.ocupacion)} etiqueta="Ocupación esta semana" />
        <StatCard
          icono={UserX}
          valor={pct(kpis.inasistencia)}
          etiqueta="Inasistencia (últimos 30 días)"
          detalle={impacto ? `Antes de recordatorios: ${pct(impacto.antes)}` : undefined}
          tono="bueno"
        />
        <StatCard
          icono={CircleDollarSign}
          valor={formatearMonedaEntera(kpis.ingresosMes)}
          etiqueta="Ingresos del mes"
          detalle={`Mes pasado: ${formatearMonedaEntera(kpis.ingresosPasado)}`}
          tono={variacion >= 0 ? 'bueno' : 'neutro'}
        />
      </div>

      {impacto && (
        <Card className="flex-col gap-4 bg-navy text-white sm:flex-row sm:items-center">
          <IconCircle icon={TrendingDown} className="bg-white/10 text-brand" />
          <div className="flex-1">
            <p className="text-lg font-bold">
              Con recordatorios automáticos, la inasistencia bajó de {pct(impacto.antes)} a{' '}
              {pct(impacto.despues)}.
            </p>
            <p className="text-sm text-white/70">
              Recordatorios activos desde el {fechaLarga(d.clinica!.recordatoriosDesde)}. Cada cita
              recuperada es ingreso que antes se perdía.
            </p>
          </div>
          <Button
            asChild
            variant="secondary"
            className="border-white/30 bg-white/10 text-white hover:bg-white/20"
          >
            <Link to="/seguimiento">
              Ver seguimiento
              <ArrowRight />
            </Link>
          </Button>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <TarjetaGrafica
          titulo="Ingresos mensuales"
          descripcion="Cobros registrados en caja (MXN)"
          tabla={{
            columnas: ['Mes', 'Ingresos'],
            filas: d.serie.map((s) => [s.mes, formatearMoneda(s.ingresos)]),
          }}
        >
          <GraficaBarras
            datos={d.serie}
            x="mes"
            y="ingresos"
            nombre="Ingresos"
            formato={formatearMoneda}
            formatoEje={moneda0}
          />
        </TarjetaGrafica>
        <TarjetaGrafica
          titulo="Inasistencias por mes"
          descripcion="Porcentaje de citas a las que el paciente no llegó"
          tabla={{
            columnas: ['Mes', 'Inasistencia'],
            filas: d.serie.map((s) => [s.mes, pct(s.inasistencia)]),
          }}
        >
          <GraficaLinea
            datos={d.serie}
            x="mes"
            y="inasistencia"
            nombre="Inasistencia"
            formato={pct}
            marca={
              mesRecordatorios
                ? { x: mesRecordatorios, etiqueta: 'Recordatorios activados' }
                : undefined
            }
          />
        </TarjetaGrafica>
        <TarjetaGrafica
          titulo="Citas por médico"
          descripcion="Mes en curso"
          tabla={{
            columnas: ['Médico', 'Citas'],
            filas: porMedico.map((m) => [m.medico, m.citas]),
          }}
        >
          <GraficaBarras
            datos={porMedico}
            x="medico"
            y="citas"
            nombre="Citas"
            formato={(v) => String(v)}
            horizontal
          />
        </TarjetaGrafica>
        <TarjetaGrafica
          titulo="Pacientes nuevos y recurrentes"
          descripcion="Pacientes atendidos cada mes"
          tabla={{
            columnas: ['Mes', 'Nuevos', 'Recurrentes'],
            filas: d.serie.map((s) => [s.mes, s.nuevos, s.recurrentes]),
          }}
        >
          <GraficaApilada
            datos={d.serie}
            x="mes"
            series={[
              { clave: 'recurrentes', nombre: 'Recurrentes' },
              { clave: 'nuevos', nombre: 'Nuevos' },
            ]}
          />
        </TarjetaGrafica>
      </div>
    </div>
  )
}

function TableroMedico({ medicoId }: { medicoId: string }) {
  const r = useRangos()
  const d = useDatosTablero(medicoId)
  const planes = usePlanes({ medicoId })

  const hoy = d.citas.filter((c) => entre(c.inicio, r.hoy, r.manana) && c.estado !== 'cancelada')
  const mes = d.citas.filter((c) => entre(c.inicio, r.mes, r.manana))
  const vencidos = (planes.data ?? []).filter((p) => clasificarPlan(p) === 'vencido').length
  const porAtender = hoy.filter((c) => c.estado === 'pendiente' || c.estado === 'confirmada')

  if (d.cargando) return <Cargando filas={8} />
  if (d.error) return <ErrorCarga error={d.error} reintentar={d.reintentar} />

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icono={CalendarCheck}
          valor={String(hoy.length)}
          etiqueta="Mis citas de hoy"
          detalle={`${porAtender.length} por atender`}
        />
        <StatCard
          icono={Stethoscope}
          valor={String(mes.filter((c) => c.estado === 'asistio').length)}
          etiqueta="Consultas este mes"
        />
        <StatCard
          icono={UserX}
          valor={pct(tasaInasistencia(mes))}
          etiqueta="Mi inasistencia del mes"
        />
        <StatCard
          icono={AlarmClock}
          valor={String(vencidos)}
          etiqueta="Controles vencidos"
          tono={vencidos ? 'malo' : 'bueno'}
          detalle={vencidos ? 'Revisa seguimiento' : 'Todo al día'}
          cargando={planes.isPending}
        />
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Por atender hoy</CardTitle>
          </CardHeader>
          {porAtender.length === 0 ? (
            <Vacio icono={Stethoscope} titulo="No tienes pacientes pendientes hoy" />
          ) : (
            <PorAtender citas={porAtender} />
          )}
        </Card>
        <TarjetaGrafica
          titulo="Mis citas por mes"
          tabla={{ columnas: ['Mes', 'Citas'], filas: d.serie.map((s) => [s.mes, s.citas]) }}
        >
          <GraficaBarras
            datos={d.serie}
            x="mes"
            y="citas"
            nombre="Citas"
            formato={(v) => String(v)}
          />
        </TarjetaGrafica>
      </div>
    </div>
  )
}

function PorAtender({ citas }: { citas: Cita[] }) {
  const { porId: pacientes } = usePacientesIndice()
  const { porId: servicios } = useServicios()
  return (
    <ul className="divide-y divide-border">
      {citas.map((c) => {
        const p = pacientes.get(c.pacienteId)
        return (
          <li key={c.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
            <div className="flex items-center gap-3">
              <span className="w-12 font-semibold text-navy">{hora(c.inicio)}</span>
              <div>
                <p className="font-semibold text-navy">{p ? `${p.nombre} ${p.apellidos}` : '…'}</p>
                <p className="text-xs text-muted-foreground">
                  {servicios.get(c.servicioId)?.nombre}
                </p>
              </div>
            </div>
            <Button asChild size="sm">
              <Link to={`/consulta/${c.id}`}>
                <Stethoscope />
                Atender
              </Link>
            </Button>
          </li>
        )
      })}
    </ul>
  )
}

function TableroRecepcion() {
  const r = useRangos()
  const d = useDatosTablero()

  const hoy = d.citas.filter((c) => entre(c.inicio, r.hoy, r.manana) && c.estado !== 'cancelada')
  const manana = d.citas.filter(
    (c) =>
      entre(c.inicio, r.manana, addDays(r.manana, 1)) &&
      (c.estado === 'pendiente' || c.estado === 'confirmada'),
  )
  const cobradas = new Set(d.pagos.map((p) => p.citaId))
  const porCobrar = hoy.filter((c) => c.estado === 'asistio' && !cobradas.has(c.id)).length
  const porConfirmar = [...hoy, ...manana].filter((c) => c.estado === 'pendiente').length
  const sinRecordatorio = manana.filter((c) => !c.recordatorioEnviado).length

  if (d.cargando) return <Cargando filas={8} />
  if (d.error) return <ErrorCarga error={d.error} reintentar={d.reintentar} />

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icono={CalendarCheck} valor={String(hoy.length)} etiqueta="Citas de hoy" />
        <StatCard
          icono={Users}
          valor={String(porConfirmar)}
          etiqueta="Por confirmar (hoy y mañana)"
          tono={porConfirmar ? 'malo' : 'bueno'}
          detalle={porConfirmar ? 'Llamar o enviar mensaje' : 'Todo confirmado'}
        />
        <StatCard icono={Receipt} valor={String(porCobrar)} etiqueta="Por cobrar hoy" />
        <StatCard
          icono={BellRing}
          valor={String(sinRecordatorio)}
          etiqueta="Recordatorios pendientes de mañana"
        />
      </div>
      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <CitasDelDia citas={hoy} titulo="Agenda de hoy" />
        <Card>
          <CardHeader>
            <CardTitle>Accesos rápidos</CardTitle>
          </CardHeader>
          <div className="grid gap-3">
            <Button asChild>
              <Link to="/agenda">
                <CalendarDays />
                Agendar cita
              </Link>
            </Button>
            <Button asChild variant="secondary">
              <Link to="/caja">
                <Receipt />
                Ir a caja ({porCobrar} por cobrar)
              </Link>
            </Button>
            <Button asChild variant="secondary">
              <Link to="/seguimiento">
                <BellRing />
                Recordatorios de mañana
              </Link>
            </Button>
            <Button asChild variant="secondary">
              <Link to="/pacientes">
                <Users />
                Buscar paciente
              </Link>
            </Button>
          </div>
        </Card>
      </div>
    </div>
  )
}

export function Tablero() {
  const usuario = useUsuario()
  const saludo = usuario.nombre.split(' ').slice(0, 2).join(' ')
  return (
    <>
      <PageHeader
        titulo={`Hola, ${saludo}`}
        descripcion={
          <span className="first-letter:uppercase">
            {fechaLarga(new Date())} · Tablero de {ETIQUETA_ROL[usuario.rol].toLowerCase()}
          </span>
        }
      />
      {usuario.rol === 'admin' && <TableroAdmin />}
      {usuario.rol === 'medico' && usuario.medicoId && (
        <TableroMedico medicoId={usuario.medicoId} />
      )}
      {usuario.rol === 'recepcion' && <TableroRecepcion />}
    </>
  )
}
