import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { CLAVES } from '@/hooks/useCatalogos'
import { pagosService, type FiltroPagos, type NuevoPago } from '@/services'

export function usePagos(filtro: FiltroPagos = {}, habilitado = true) {
  return useQuery({
    queryKey: [...CLAVES.pagos, filtro],
    queryFn: () => pagosService.listar(filtro),
    enabled: habilitado,
  })
}

export function useRegistrarPago() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (d: NuevoPago) => pagosService.registrar(d),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: CLAVES.pagos })
      qc.invalidateQueries({ queryKey: CLAVES.bitacora })
    },
  })
}
