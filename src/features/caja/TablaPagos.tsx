import { FileDown } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useDescargarRecibo } from '@/features/caja/useDescargarRecibo'
import { usePacientesIndice, useServicios } from '@/hooks/useCatalogos'
import { ETIQUETA_METODO } from '@/lib/estados'
import { fechaHora, formatearMoneda, hora } from '@/lib/formato'
import type { Pago } from '@/types'

export function TablaPagos({
  pagos,
  mostrarPaciente = true,
  soloHora = false,
}: {
  pagos: Pago[]
  mostrarPaciente?: boolean
  /** En vistas de un solo día basta la hora. */
  soloHora?: boolean
}) {
  const { porId: pacientes } = usePacientesIndice()
  const { porId: servicios } = useServicios()
  const recibo = useDescargarRecibo()

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[560px] text-sm">
        <thead>
          <tr className="text-left text-xs text-muted-foreground">
            <th scope="col" className="pb-3 font-medium">
              Folio
            </th>
            <th scope="col" className="pb-3 font-medium">
              {soloHora ? 'Hora' : 'Fecha'}
            </th>
            {mostrarPaciente && (
              <th scope="col" className="pb-3 font-medium">
                Paciente
              </th>
            )}
            <th scope="col" className="pb-3 font-medium">
              Concepto
            </th>
            <th scope="col" className="pb-3 font-medium">
              Método
            </th>
            <th scope="col" className="pb-3 text-right font-medium">
              Monto
            </th>
            <th scope="col" className="pb-3">
              <span className="sr-only">Recibo</span>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {pagos.map((p) => {
            const paciente = pacientes.get(p.pacienteId)
            return (
              <tr key={p.id}>
                <td className="py-3 pr-3 font-semibold whitespace-nowrap text-navy">{p.folio}</td>
                <td className="py-3 pr-3 whitespace-nowrap text-muted-foreground">
                  {soloHora ? hora(p.fecha) : fechaHora(p.fecha)}
                </td>
                {mostrarPaciente && (
                  <td className="py-3 pr-3 text-navy">
                    {paciente ? `${paciente.nombre} ${paciente.apellidos}` : '…'}
                  </td>
                )}
                <td className="py-3 pr-3 text-navy">{servicios.get(p.servicioId)?.nombre}</td>
                <td className="py-3 pr-3">
                  <Badge variant="neutral">{ETIQUETA_METODO[p.metodo]}</Badge>
                </td>
                <td className="py-3 pr-3 text-right font-semibold whitespace-nowrap text-navy">
                  {formatearMoneda(p.monto)}
                </td>
                <td className="py-3 text-right">
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={`Descargar recibo ${p.folio}`}
                    onClick={() => recibo(p)}
                  >
                    <FileDown className="size-4" />
                  </Button>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
