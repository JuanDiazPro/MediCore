import { useMemo, useState } from 'react'
import { addDays, format, parseISO, startOfDay } from 'date-fns'
import { Banknote, CreditCard, FileDown, Landmark, Plus, Receipt, Wallet } from 'lucide-react'

import { Cargando, ErrorCarga, Vacio } from '@/components/layout/Estados'
import { PageHeader } from '@/components/layout/PageHeader'
import { StatCard } from '@/components/layout/StatCard'
import { Button } from '@/components/ui/button'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { useCitas } from '@/features/agenda/useCitas'
import { CobroFormulario, type CobroInicial } from '@/features/caja/CobroFormulario'
import { TablaPagos } from '@/features/caja/TablaPagos'
import { usePagos } from '@/features/caja/usePagos'
import { useClinica, useMedicos, usePacientesIndice, useServicios } from '@/hooks/useCatalogos'
import { calcularCorte } from '@/lib/caja'
import { ETIQUETA_METODO } from '@/lib/estados'
import { fechaLarga, formatearMoneda, hora } from '@/lib/formato'
import type { MetodoPago } from '@/types'

const ICONO_METODO: Record<MetodoPago, typeof Banknote> = {
  efectivo: Banknote,
  tarjeta: CreditCard,
  transferencia: Landmark,
}

export function Caja() {
  const [dia, setDia] = useState(() => format(new Date(), 'yyyy-MM-dd'))
  const [cobro, setCobro] = useState<CobroInicial | null>(null)
  const rango = useMemo(() => {
    const inicio = startOfDay(parseISO(dia))
    return { desde: inicio.toISOString(), hasta: addDays(inicio, 1).toISOString() }
  }, [dia])

  const pagos = usePagos(rango)
  const citas = useCitas({ ...rango, estados: ['asistio'] })
  const pagosDeCitas = usePagos({ desde: rango.desde })
  const { data: clinica } = useClinica()
  const { porId: pacientes } = usePacientesIndice()
  const { porId: servicios } = useServicios()
  const { porId: medicos } = useMedicos()

  const corte = useMemo(() => calcularCorte(pagos.data ?? []), [pagos.data])
  const cobradas = useMemo(
    () => new Set((pagosDeCitas.data ?? []).map((p) => p.citaId).filter(Boolean)),
    [pagosDeCitas.data],
  )
  const porCobrar = (citas.data ?? []).filter((c) => !cobradas.has(c.id))

  const descargarCorte = async () => {
    if (!clinica) return
    const { crearReportePdf, descargar } = await import('@/lib/pdf')
    const filas = (['efectivo', 'tarjeta', 'transferencia'] as MetodoPago[]).map((m) => ({
      Método: ETIQUETA_METODO[m],
      Cobros: String(corte.porMetodo[m].cantidad),
      Total: formatearMoneda(corte.porMetodo[m].total),
    }))
    filas.push({
      Método: 'TOTAL',
      Cobros: String(corte.numeroPagos),
      Total: formatearMoneda(corte.total),
    })
    descargar(
      crearReportePdf(
        clinica,
        'Corte de caja',
        fechaLarga(rango.desde),
        ['Método', 'Cobros', 'Total'],
        filas,
      ),
      `corte-DEMO-${dia}.pdf`,
    )
  }

  return (
    <>
      <PageHeader
        titulo="Caja"
        descripcion="Cobros, recibos y corte del día."
        acciones={
          <Button onClick={() => setCobro({})}>
            <Plus />
            Registrar cobro
          </Button>
        }
      />

      <div className="mb-6 flex flex-col gap-1.5 sm:w-60">
        <Label htmlFor="caja-dia">Día</Label>
        <Input
          id="caja-dia"
          type="date"
          value={dia}
          onChange={(e) => e.target.value && setDia(e.target.value)}
        />
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icono={Wallet}
          valor={formatearMoneda(corte.total)}
          etiqueta="Total cobrado"
          cargando={pagos.isPending}
        />
        <StatCard
          icono={Receipt}
          valor={String(corte.numeroPagos)}
          etiqueta="Cobros del día"
          cargando={pagos.isPending}
        />
        <StatCard
          icono={Banknote}
          valor={formatearMoneda(corte.porMetodo.efectivo.total)}
          etiqueta="En efectivo"
          cargando={pagos.isPending}
        />
        <StatCard
          icono={CreditCard}
          valor={formatearMoneda(
            corte.porMetodo.tarjeta.total + corte.porMetodo.transferencia.total,
          )}
          etiqueta="Tarjeta y transferencia"
          cargando={pagos.isPending}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_1.6fr]">
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Por cobrar</CardTitle>
              <CardDescription>Pacientes que asistieron y aún no pagan.</CardDescription>
            </CardHeader>
            {citas.isPending || pagosDeCitas.isPending ? (
              <Cargando filas={2} />
            ) : porCobrar.length === 0 ? (
              <Vacio icono={Receipt} titulo="Todo cobrado" />
            ) : (
              <ul className="divide-y divide-border">
                {porCobrar.map((c) => {
                  const p = pacientes.get(c.pacienteId)
                  const s = servicios.get(c.servicioId)
                  return (
                    <li key={c.id} className="flex items-center justify-between gap-3 py-3">
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-navy">
                          {p ? `${p.nombre} ${p.apellidos}` : '…'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {hora(c.inicio)} · {s?.nombre} · {medicos.get(c.medicoId)?.nombre}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        onClick={() =>
                          setCobro({
                            pacienteId: c.pacienteId,
                            servicioId: c.servicioId,
                            medicoId: c.medicoId,
                            citaId: c.id,
                          })
                        }
                      >
                        Cobrar {s && formatearMoneda(s.precio)}
                      </Button>
                    </li>
                  )
                })}
              </ul>
            )}
          </Card>

          <Card>
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle>Corte de caja</CardTitle>
              <Button size="sm" variant="secondary" onClick={descargarCorte} disabled={!pagos.data}>
                <FileDown />
                PDF
              </Button>
            </CardHeader>
            <ul className="divide-y divide-border">
              {(['efectivo', 'tarjeta', 'transferencia'] as MetodoPago[]).map((m) => {
                const Icono = ICONO_METODO[m]
                return (
                  <li key={m} className="flex items-center justify-between py-3">
                    <span className="flex items-center gap-3 text-navy">
                      <Icono aria-hidden className="size-5 text-brand" strokeWidth={1.75} />
                      {ETIQUETA_METODO[m]}
                      <span className="text-xs text-muted-foreground">
                        ({corte.porMetodo[m].cantidad})
                      </span>
                    </span>
                    <span className="font-semibold text-navy">
                      {formatearMoneda(corte.porMetodo[m].total)}
                    </span>
                  </li>
                )
              })}
              <li className="flex items-center justify-between pt-3 text-lg font-bold text-navy">
                <span>Total</span>
                <span>{formatearMoneda(corte.total)}</span>
              </li>
            </ul>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Cobros del día</CardTitle>
            <CardDescription className="first-letter:uppercase">
              {fechaLarga(rango.desde)}
            </CardDescription>
          </CardHeader>
          {pagos.isPending ? (
            <Cargando />
          ) : pagos.isError ? (
            <ErrorCarga error={pagos.error} reintentar={() => pagos.refetch()} />
          ) : pagos.data.length === 0 ? (
            <Vacio icono={Receipt} titulo="Sin cobros este día" />
          ) : (
            <TablaPagos pagos={pagos.data} soloHora />
          )}
        </Card>
      </div>

      <CobroFormulario inicial={cobro} alCerrar={() => setCobro(null)} />
    </>
  )
}
