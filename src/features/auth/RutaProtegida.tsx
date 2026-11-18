import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router'

import { puedeVer, type Modulo } from '@/features/auth/permisos'
import { useSesion } from '@/features/auth/sesion'
import { SinPermiso } from '@/features/auth/SinPermiso'

/** Exige sesión (y opcionalmente acceso al módulo) para mostrar el contenido. */
export function RutaProtegida({ modulo, children }: { modulo?: Modulo; children: ReactNode }) {
  const usuario = useSesion((s) => s.usuario)
  const ubicacion = useLocation()
  if (!usuario) return <Navigate to="/login" replace state={{ desde: ubicacion.pathname }} />
  if (modulo && !puedeVer(usuario.rol, modulo)) return <SinPermiso />
  return children
}
