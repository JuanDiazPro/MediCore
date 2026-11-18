import { useState, type ReactNode } from 'react'
import { Table2, ChartColumn } from 'lucide-react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

/**
 * Colores de gráficas. Validados con el script de la guía de visualización
 * (contraste, separación para daltonismo y separación normal):
 * serie principal #0D9488; segunda serie #7C6FD6.
 */
const COLOR_SERIE = '#0D9488'
const COLOR_SERIE_2 = '#7C6FD6'
const TINTA_SECUNDARIA = '#64748B'
const REJILLA = '#E2E8F0'

const ejeX = {
  tick: { fill: TINTA_SECUNDARIA, fontSize: 12 },
  tickLine: false,
  axisLine: { stroke: REJILLA },
}
const ejeY = { tick: { fill: TINTA_SECUNDARIA, fontSize: 12 }, tickLine: false, axisLine: false }

interface PropsGlobo {
  active?: boolean
  payload?: readonly { dataKey?: unknown; name?: unknown; value?: unknown; color?: string }[]
  label?: unknown
  formato: (v: number) => string
}

function Globo({ active, payload, label, formato }: PropsGlobo) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-xl bg-white px-3 py-2 text-sm shadow-lift">
      <p className="mb-1 font-semibold text-navy first-letter:uppercase">{String(label)}</p>
      {payload.map((p) => (
        <p key={String(p.dataKey)} className="flex items-center gap-2 text-muted-foreground">
          <span aria-hidden className="size-2.5 rounded-sm" style={{ background: p.color }} />
          {String(p.name)}: <strong className="text-navy">{formato(Number(p.value))}</strong>
        </p>
      ))}
    </div>
  )
}

/** Tarjeta de gráfica con alternativa en tabla (accesibilidad). */
export function TarjetaGrafica({
  titulo,
  descripcion,
  tabla,
  children,
  className,
}: {
  titulo: string
  descripcion?: ReactNode
  tabla: { columnas: string[]; filas: (string | number)[][] }
  children: ReactNode
  className?: string
}) {
  const [verTabla, setVerTabla] = useState(false)
  return (
    <Card className={className}>
      <CardHeader className="flex-row items-start justify-between gap-3">
        <div>
          <CardTitle>{titulo}</CardTitle>
          {descripcion && <CardDescription>{descripcion}</CardDescription>}
        </div>
        <Button
          variant="ghost"
          size="icon"
          aria-pressed={verTabla}
          aria-label={verTabla ? 'Ver gráfica' : 'Ver como tabla'}
          title={verTabla ? 'Ver gráfica' : 'Ver como tabla'}
          onClick={() => setVerTabla((v) => !v)}
        >
          {verTabla ? <ChartColumn className="size-4" /> : <Table2 className="size-4" />}
        </Button>
      </CardHeader>
      {verTabla ? (
        <div className="max-h-72 overflow-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-muted-foreground">
                {tabla.columnas.map((c, i) => (
                  <th
                    key={c}
                    scope="col"
                    className={i ? 'pb-2 text-right font-medium' : 'pb-2 font-medium'}
                  >
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {tabla.filas.map((f) => (
                <tr key={String(f[0])}>
                  {f.map((v, i) => (
                    <td
                      key={i}
                      className={
                        i ? 'py-2 text-right text-navy' : 'py-2 text-navy first-letter:uppercase'
                      }
                    >
                      {v}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="h-64 w-full sm:h-72">{children}</div>
      )}
    </Card>
  )
}

export function GraficaBarras({
  datos,
  x,
  y,
  nombre,
  formato,
  formatoEje = formato,
  horizontal,
}: {
  datos: readonly object[]
  x: string
  y: string
  nombre: string
  formato: (v: number) => string
  formatoEje?: (v: number) => string
  horizontal?: boolean
}) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={datos}
        layout={horizontal ? 'vertical' : 'horizontal'}
        margin={{ top: 8, right: 8, left: horizontal ? 8 : -8, bottom: 0 }}
        barCategoryGap="28%"
      >
        <CartesianGrid stroke={REJILLA} vertical={!!horizontal} horizontal={!horizontal} />
        {horizontal ? (
          <>
            <XAxis type="number" {...ejeX} tickFormatter={formatoEje} />
            <YAxis type="category" dataKey={x} {...ejeY} width={130} />
          </>
        ) : (
          <>
            <XAxis dataKey={x} {...ejeX} />
            <YAxis {...ejeY} tickFormatter={formatoEje} width={64} />
          </>
        )}
        <Tooltip
          cursor={{ fill: 'rgb(204 251 241 / 0.4)' }}
          content={(p) => (
            <Globo active={p.active} payload={p.payload} label={p.label} formato={formato} />
          )}
        />
        <Bar
          isAnimationActive={false}
          dataKey={y}
          name={nombre}
          fill={COLOR_SERIE}
          maxBarSize={28}
          radius={horizontal ? [0, 4, 4, 0] : [4, 4, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  )
}

export function GraficaApilada({
  datos,
  x,
  series,
}: {
  datos: readonly object[]
  x: string
  series: [{ clave: string; nombre: string }, { clave: string; nombre: string }]
}) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={datos}
        margin={{ top: 8, right: 8, left: -16, bottom: 0 }}
        barCategoryGap="28%"
      >
        <CartesianGrid stroke={REJILLA} vertical={false} />
        <XAxis dataKey={x} {...ejeX} />
        <YAxis {...ejeY} allowDecimals={false} />
        <Tooltip
          cursor={{ fill: 'rgb(204 251 241 / 0.4)' }}
          content={(p) => (
            <Globo
              active={p.active}
              payload={p.payload}
              label={p.label}
              formato={(v) => String(v)}
            />
          )}
        />
        <Legend
          iconType="square"
          iconSize={10}
          wrapperStyle={{ fontSize: 12, color: TINTA_SECUNDARIA, paddingTop: 8 }}
        />
        <Bar
          isAnimationActive={false}
          dataKey={series[0].clave}
          name={series[0].nombre}
          stackId="a"
          fill={COLOR_SERIE}
          stroke="#fff"
          strokeWidth={2}
          maxBarSize={28}
        />
        <Bar
          isAnimationActive={false}
          dataKey={series[1].clave}
          name={series[1].nombre}
          stackId="a"
          fill={COLOR_SERIE_2}
          stroke="#fff"
          strokeWidth={2}
          maxBarSize={28}
          radius={[4, 4, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  )
}

export function GraficaLinea({
  datos,
  x,
  y,
  nombre,
  formato,
  marca,
}: {
  datos: readonly object[]
  x: string
  y: string
  nombre: string
  formato: (v: number) => string
  /** Línea de referencia vertical (p. ej. "Recordatorios activados"). */
  marca?: { x: string; etiqueta: string }
}) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={datos} margin={{ top: 24, right: 16, left: -8, bottom: 0 }}>
        <CartesianGrid stroke={REJILLA} vertical={false} />
        <XAxis dataKey={x} {...ejeX} />
        <YAxis {...ejeY} tickFormatter={formato} width={56} />
        <Tooltip
          cursor={{ stroke: TINTA_SECUNDARIA, strokeDasharray: '4 4' }}
          content={(p) => (
            <Globo active={p.active} payload={p.payload} label={p.label} formato={formato} />
          )}
        />
        {marca && (
          <ReferenceLine
            x={marca.x}
            stroke="#0F2A44"
            strokeDasharray="4 4"
            label={{
              value: marca.etiqueta,
              position: 'top',
              fill: '#0F2A44',
              fontSize: 11,
              fontWeight: 600,
            }}
          />
        )}
        <Line
          isAnimationActive={false}
          type="monotone"
          dataKey={y}
          name={nombre}
          stroke={COLOR_SERIE}
          strokeWidth={2}
          dot={{ r: 4, fill: COLOR_SERIE, stroke: '#fff', strokeWidth: 2 }}
          activeDot={{ r: 6, stroke: '#fff', strokeWidth: 2 }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
