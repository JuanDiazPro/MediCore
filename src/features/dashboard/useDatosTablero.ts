import { useMemo } from 'react'
import { subMonths } from 'date-fns'

import { useCitas } from '@/features/agenda/useCitas'
import { usePagos } from '@/features/caja/usePagos'
import { useClinica, useMedicos } from '@/hooks/useCatalogos'
import { serieMensual } from '@/lib/metricas'

/** Carga citas y pagos de los últimos 6 meses (opcionalmente de un médico) y arma la serie mensual. */
export function useDatosTablero(medicoId?: string) {
  const desde = useMemo(() => subMonths(new Date(), 6), [])
  const citas = useCitas({ medicoId })
  const pagos = usePagos({ medicoId })
  const clinica = useClinica()
  const medicos = useMedicos()

  const serie = useMemo(
    () => (citas.data && pagos.data ? serieMensual(citas.data, pagos.data, desde, new Date()) : []),
    [citas.data, pagos.data, desde],
  )

  return {
    citas: citas.data ?? [],
    pagos: pagos.data ?? [],
    clinica: clinica.data,
    medicos: medicos.data ?? [],
    medicosPorId: medicos.porId,
    serie,
    cargando: citas.isPending || pagos.isPending || clinica.isPending || medicos.isPending,
    error: citas.error ?? pagos.error ?? clinica.error ?? medicos.error,
    reintentar: () => {
      void citas.refetch()
      void pagos.refetch()
    },
  }
}
