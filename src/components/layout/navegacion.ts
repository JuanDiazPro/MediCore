import {
  CalendarDays,
  ChartColumn,
  HeartPulse,
  Info,
  LayoutDashboard,
  type LucideIcon,
  Settings,
  Users,
  Wallet,
} from 'lucide-react'

import { MODULOS_POR_ROL, type Modulo } from '@/features/auth/permisos'
import type { Rol } from '@/types'

export interface ItemMenu {
  modulo: Modulo
  ruta: string
  etiqueta: string
  icono: LucideIcon
}

export const MENU: ItemMenu[] = [
  { modulo: 'tablero', ruta: '/tablero', etiqueta: 'Tablero', icono: LayoutDashboard },
  { modulo: 'agenda', ruta: '/agenda', etiqueta: 'Agenda', icono: CalendarDays },
  { modulo: 'pacientes', ruta: '/pacientes', etiqueta: 'Pacientes', icono: Users },
  { modulo: 'seguimiento', ruta: '/seguimiento', etiqueta: 'Seguimiento', icono: HeartPulse },
  { modulo: 'caja', ruta: '/caja', etiqueta: 'Caja', icono: Wallet },
  { modulo: 'reportes', ruta: '/reportes', etiqueta: 'Reportes', icono: ChartColumn },
  { modulo: 'configuracion', ruta: '/configuracion', etiqueta: 'Configuración', icono: Settings },
  { modulo: 'acerca', ruta: '/acerca', etiqueta: 'Acerca de', icono: Info },
]

export const menuDeRol = (rol: Rol) =>
  MENU.filter((item) => MODULOS_POR_ROL[rol].includes(item.modulo))
