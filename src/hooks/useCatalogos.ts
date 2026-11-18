import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'

import { clinicaService, pacientesService } from '@/services'

/** Claves de caché compartidas para invalidar después de cambios. */
export const CLAVES = {
  clinica: ['clinica'] as const,
  medicos: ['medicos'] as const,
  servicios: ['servicios'] as const,
  pacientes: ['pacientes'] as const,
  citas: ['citas'] as const,
  consultas: ['consultas'] as const,
  planes: ['planes'] as const,
  mensajes: ['mensajes'] as const,
  campanas: ['campanas'] as const,
  pagos: ['pagos'] as const,
  bitacora: ['bitacora'] as const,
}

export function useClinica() {
  return useQuery({ queryKey: CLAVES.clinica, queryFn: () => clinicaService.obtener() })
}

export function useMedicos() {
  const q = useQuery({ queryKey: CLAVES.medicos, queryFn: () => clinicaService.listarMedicos() })
  const porId = useMemo(() => new Map((q.data ?? []).map((m) => [m.id, m])), [q.data])
  return { ...q, porId }
}

export function useServicios() {
  const q = useQuery({
    queryKey: CLAVES.servicios,
    queryFn: () => clinicaService.listarServicios(),
  })
  const porId = useMemo(() => new Map((q.data ?? []).map((s) => [s.id, s])), [q.data])
  return { ...q, porId }
}

/** Todos los pacientes (para selectores y para mostrar nombres en agenda, caja, etc.). */
export function usePacientesIndice() {
  const q = useQuery({
    queryKey: [...CLAVES.pacientes, 'todos'],
    queryFn: () => pacientesService.listarTodos(),
  })
  const porId = useMemo(() => new Map((q.data ?? []).map((p) => [p.id, p])), [q.data])
  return { ...q, porId }
}
