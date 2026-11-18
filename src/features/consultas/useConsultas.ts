import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { CLAVES } from '@/hooks/useCatalogos'
import { consultasService, type NuevaConsulta } from '@/services'

export function useConsultasPaciente(pacienteId: string) {
  return useQuery({
    queryKey: [...CLAVES.consultas, 'paciente', pacienteId],
    queryFn: () => consultasService.listarPorPaciente(pacienteId),
  })
}

export function useConsultaDeCita(citaId: string | undefined) {
  return useQuery({
    queryKey: [...CLAVES.consultas, 'cita', citaId],
    queryFn: () => consultasService.obtenerPorCita(citaId!),
    enabled: !!citaId,
  })
}

export function useRegistrarConsulta() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (d: NuevaConsulta) => consultasService.registrar(d),
    onSuccess: () => {
      for (const k of [CLAVES.consultas, CLAVES.citas, CLAVES.pacientes, CLAVES.bitacora]) {
        qc.invalidateQueries({ queryKey: k })
      }
    },
  })
}

export function useBuscarCie10(texto: string) {
  return useQuery({
    queryKey: ['cie10', texto],
    queryFn: () => consultasService.buscarCie10(texto),
    staleTime: Infinity,
  })
}
