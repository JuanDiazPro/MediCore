import { useMutation, useQueryClient } from '@tanstack/react-query'

import { toast } from '@/components/ui/toast'
import { clinicaService } from '@/services'

export function useReiniciarDemo() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => clinicaService.reiniciarDemo(),
    onSuccess: async () => {
      await qc.resetQueries()
      toast.exito('Demo reiniciado', 'Se restauraron los datos de ejemplo.')
    },
    onError: () => toast.error('No se pudo reiniciar el demo'),
  })
}
