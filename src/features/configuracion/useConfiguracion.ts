import { useMutation, useQueryClient } from '@tanstack/react-query'

import { CLAVES } from '@/hooks/useCatalogos'
import { clinicaService } from '@/services'
import type { Clinica, Medico, Servicio } from '@/types'

export function useActualizarClinica() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (cambios: Partial<Omit<Clinica, 'id'>>) => clinicaService.actualizar(cambios),
    onSuccess: () => qc.invalidateQueries({ queryKey: CLAVES.clinica }),
  })
}

export function useActualizarMedico() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, cambios }: { id: string; cambios: Partial<Omit<Medico, 'id'>> }) =>
      clinicaService.actualizarMedico(id, cambios),
    onSuccess: () => qc.invalidateQueries({ queryKey: CLAVES.medicos }),
  })
}

export function useGuardarServicio() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, datos }: { id?: string; datos: Omit<Servicio, 'id'> }) =>
      id ? clinicaService.actualizarServicio(id, datos) : clinicaService.crearServicio(datos),
    onSuccess: () => qc.invalidateQueries({ queryKey: CLAVES.servicios }),
  })
}
