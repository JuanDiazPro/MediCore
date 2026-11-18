import { useMemo, useState } from 'react'
import { addDays, format, parseISO, startOfMonth, subMonths } from 'date-fns'
import { CircleDollarSign, FileDown, Receipt, UserX } from 'lucide-react'

import { GraficaBarras, GraficaLinea, TarjetaGrafica } from '@/components/charts/Graficas'
import { Cargando, ErrorCarga } from '@/components/layout/Estados'
import { PageHeader } from '@/components/layout/PageHeader'
import { StatCard } from '@/components/layout/StatCard'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Label } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { useCitas } from '@/features/agenda/useCitas'
import { usePagos } from '@/features/caja/usePagos'
import { useClinica, useMedicos, useServicios } from '@/hooks/useCatalogos'
import { fechaCorta, formatearMoneda, formatearPorcentaje } from '@/lib/formato'
import { agrupar, serieMensual, sumarIngresos, tasaInasistencia } from '@/lib/metricas'

const fmt = (d: Date) => format(d, 'yyyy-MM-dd')
const PRESETS = [
  { etiqueta: 'Este mes', desde: () => startOfMonth(new Date()) },
  { etiqueta: '3 meses', desde: () => subMonths(new Date(), 3) },
  { etiqueta: '6 meses', desde: () => subMonths(new Date(), 6) },
]
const milesEje = (v: number) => (v >= 1000 ? `$${Math.round(v / 1000)} mil` : formatearMoneda(v))

export function Reportes() {
  const [desde, setDesde] = useState(() => fmt(subMonths(new Date(), 6)))
  const [hasta, setHasta] = useState(() => fmt(new Date()))
  const rango = useMemo(
    () => ({
      desde: parseISO(desde).toISOString(),
      hasta: addDays(parseISO(hasta), 1).toISOString(),
    }),
    [desde, hasta],
  )
  const pagos = usePagos(rango)
  const citas = useCitas(rango)
  const { data: clinica } = useClinica()
  const { porId: medicos } = useMedicos()
  const { porId: servicios } = useServicios()

  const datos = useMemo(() => {
    const p = pagos.data ?? []
    const c = citas.data ?? []
    const nombreMedico = (id: string) => medicos.get(id)?.nombre.replace(/^Dra?\.\s/, '') ?? id
    return {
      ingresos: sumarIngresos(p),
      inasistencia: tasaInasistencia(c),
      porMedico: agrupar(
        p,
        (x) => nombreMedico(x.medicoId),
        (x) => x.monto,
      ).map((x) => ({
        nombre: x.clave,
        ingresos: x.valor,
      })),
      porServicio: agrupar(
        p,
        (x) => servicios.get(x.servicioId)?.nombre ?? x.servicioId,
        (x) => x.monto,
      ).map((x) => ({ nombre: x.clave, ingresos: x.valor })),
      serie: serieMensual(c, p, parseISO(rango.desde), parseISO(hasta)),
    }
  }, [pagos.data, citas.data, medicos, servicios, rango.desde, hasta])

  const exportar = async () => {
    if (!clinica) return
    const { crearReportePdf, descargar } = await import('@/lib/pdf')
    const filas = [
      ...datos.porMedico.map((m) => ({
        Concepto: `Médico: ${m.nombre}`,
        Ingresos: formatearMoneda(m.ingresos),
      })),
      ...datos.porServicio.map((s) => ({
        Concepto: `Servicio: ${s.nombre}`,
        Ingresos: formatearMoneda(s.ingresos),
      })),
      ...datos.serie.map((s) => ({
        Concepto: `Inasistencia ${s.mes}`,
        Ingresos: formatearPorcentaje(s.inasistencia),
      })),
      { Concepto: 'TOTAL DE INGRESOS', Ingresos: formatearMoneda(datos.ingresos) },
    ]
    descargar(
      crearReportePdf(
        clinica,
        'Reporte de ingresos',
        `Del ${fechaCorta(rango.desde)} al ${fechaCorta(parseISO(hasta))}`,
        ['Concepto', 'Ingresos'],
        filas,
      ),
      `reporte-DEMO-${desde}-a-${hasta}.pdf`,
    )
  }

  const cargando = pagos.isPending || citas.isPending
  const error = pagos.error ?? citas.error

  return (
    <>
      <PageHeader
        titulo="Reportes"
        descripcion="Ingresos por médico y servicio, y evolución de inasistencias."
        acciones={
          <Button variant="secondary" onClick={exportar} disabled={cargando}>
            <FileDown />
            Exportar PDF
          </Button>
        }
      />

      <Card className="mb-6 flex-col gap-4 p-5 sm:flex-row sm:items-end">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="r-desde">Desde</Label>
          <Input
            id="r-desde"
            type="date"
            value={desde}
            max={hasta}
            onChange={(e) => e.target.value && setDesde(e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="r-hasta">Hasta</Label>
          <Input
            id="r-hasta"
            type="date"
            value={hasta}
            min={desde}
            onChange={(e) => e.target.value && setHasta(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Rangos rápidos">
          {PRESETS.map((p) => {
            const activo = desde === fmt(p.desde()) && hasta === fmt(new Date())
            return (
              <Button
                key={p.etiqueta}
                size="sm"
                variant={activo ? 'default' : 'secondary'}
                aria-pressed={activo}
                onClick={() => {
                  setDesde(fmt(p.desde()))
                  setHasta(fmt(new Date()))
                }}
              >
                {p.etiqueta}
              </Button>
            )
          })}
        </div>
      </Card>

      {cargando ? (
        <Cargando filas={6} />
      ) : error ? (
        <ErrorCarga error={error} reintentar={() => (pagos.refetch(), citas.refetch())} />
      ) : (
        <div className="flex flex-col gap-6">
          <div className="grid gap-4 sm:grid-cols-3">
            <StatCard
              icono={CircleDollarSign}
              valor={formatearMoneda(datos.ingresos)}
              etiqueta="Ingresos del periodo"
            />
            <StatCard icono={Receipt} valor={String(pagos.data?.length ?? 0)} etiqueta="Cobros" />
            <StatCard
              icono={UserX}
              valor={formatearPorcentaje(datos.inasistencia)}
              etiqueta="Inasistencia del periodo"
            />
          </div>
          <div className="grid gap-6 lg:grid-cols-2">
            <TarjetaGrafica
              titulo="Ingresos por médico"
              tabla={{
                columnas: ['Médico', 'Ingresos'],
                filas: datos.porMedico.map((m) => [m.nombre, formatearMoneda(m.ingresos)]),
              }}
            >
              <GraficaBarras
                datos={datos.porMedico}
                x="nombre"
                y="ingresos"
                nombre="Ingresos"
                formato={formatearMoneda}
                formatoEje={milesEje}
                horizontal
              />
            </TarjetaGrafica>
            <TarjetaGrafica
              titulo="Ingresos por servicio"
              tabla={{
                columnas: ['Servicio', 'Ingresos'],
                filas: datos.porServicio.map((s) => [s.nombre, formatearMoneda(s.ingresos)]),
              }}
            >
              <GraficaBarras
                datos={datos.porServicio}
                x="nombre"
                y="ingresos"
                nombre="Ingresos"
                formato={formatearMoneda}
                formatoEje={milesEje}
                horizontal
              />
            </TarjetaGrafica>
            <TarjetaGrafica
              titulo="Evolución de inasistencias"
              className="lg:col-span-2"
              tabla={{
                columnas: ['Mes', 'Inasistencia', 'Citas'],
                filas: datos.serie.map((s) => [
                  s.mes,
                  formatearPorcentaje(s.inasistencia),
                  s.citas,
                ]),
              }}
            >
              <GraficaLinea
                datos={datos.serie}
                x="mes"
                y="inasistencia"
                nombre="Inasistencia"
                formato={formatearPorcentaje}
              />
            </TarjetaGrafica>
          </div>
        </div>
      )}
    </>
  )
}
