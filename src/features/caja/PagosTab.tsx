import { Receipt } from 'lucide-react'

import { Cargando, ErrorCarga, Vacio } from '@/components/layout/Estados'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { TablaPagos } from '@/features/caja/TablaPagos'
import { usePagos } from '@/features/caja/usePagos'
import { formatearMoneda } from '@/lib/formato'

/** Pestaña "Pagos" de la ficha del paciente. */
export function PagosTab({ pacienteId }: { pacienteId: string }) {
  const pagos = usePagos({ pacienteId })
  const total = (pagos.data ?? []).reduce((s, p) => s + p.monto, 0)
  return (
    <Card>
      <CardHeader>
        <CardTitle>Historial de pagos</CardTitle>
        {pagos.data && (
          <CardDescription>
            {pagos.data.length} pagos · {formatearMoneda(total)} en total
          </CardDescription>
        )}
      </CardHeader>
      {pagos.isPending ? (
        <Cargando />
      ) : pagos.isError ? (
        <ErrorCarga error={pagos.error} reintentar={() => pagos.refetch()} />
      ) : pagos.data.length === 0 ? (
        <Vacio icono={Receipt} titulo="Sin pagos registrados" />
      ) : (
        <TablaPagos pagos={pagos.data} mostrarPaciente={false} />
      )}
    </Card>
  )
}
