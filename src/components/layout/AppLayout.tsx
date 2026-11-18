import { useState } from 'react'
import { LogOut, Menu, RotateCcw } from 'lucide-react'
import { NavLink, Outlet, useNavigate } from 'react-router'

import { DemoBanner } from '@/components/layout/DemoBanner'
import { Logo } from '@/components/layout/Logo'
import { menuDeRol } from '@/components/layout/navegacion'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useSesion, useUsuario } from '@/features/auth/sesion'
import { useReiniciarDemo } from '@/features/auth/useReiniciarDemo'
import { ETIQUETA_ROL } from '@/lib/estados'
import { iniciales } from '@/lib/formato'
import { cn } from '@/lib/utils'

function MenuLateral({ alNavegar }: { alNavegar?: () => void }) {
  const usuario = useUsuario()
  return (
    <nav aria-label="Menú principal" className="flex flex-1 flex-col gap-1">
      {menuDeRol(usuario.rol).map(({ ruta, etiqueta, icono: Icono }) => (
        <NavLink
          key={ruta}
          to={ruta}
          onClick={alNavegar}
          className={({ isActive }) =>
            cn(
              'flex items-center gap-3 rounded-xl px-4 py-3 text-[15px] font-medium text-white/80 transition-colors hover:bg-white/10 hover:text-white focus-visible:ring-4 focus-visible:ring-brand/40 focus-visible:outline-none',
              isActive && 'bg-brand text-white shadow-sm hover:bg-brand',
            )
          }
        >
          <Icono aria-hidden className="size-5" strokeWidth={1.75} />
          {etiqueta}
        </NavLink>
      ))}
    </nav>
  )
}

function ReiniciarDemo({ compacto }: { compacto?: boolean }) {
  const [abierto, setAbierto] = useState(false)
  const reiniciar = useReiniciarDemo()
  return (
    <Dialog open={abierto} onOpenChange={setAbierto}>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setAbierto(true)}
        className={cn(compacto && 'px-3')}
        aria-label="Reiniciar demo"
      >
        <RotateCcw />
        <span className={cn(compacto && 'hidden md:inline')}>Reiniciar demo</span>
      </Button>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>¿Reiniciar el demo?</DialogTitle>
          <DialogDescription>
            Se borrarán los cambios hechos en este navegador (citas, notas, cobros) y se restaurarán
            los datos de ejemplo.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="secondary">Cancelar</Button>
          </DialogClose>
          <Button
            disabled={reiniciar.isPending}
            onClick={() => reiniciar.mutate(undefined, { onSettled: () => setAbierto(false) })}
          >
            {reiniciar.isPending ? 'Reiniciando…' : 'Sí, reiniciar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function AppLayout() {
  const usuario = useUsuario()
  const cerrar = useSesion((s) => s.cerrar)
  const navegar = useNavigate()
  const [menuMovil, setMenuMovil] = useState(false)

  const salir = () => {
    cerrar()
    navegar('/login')
  }

  return (
    <div className="flex min-h-svh flex-col">
      <div className="sticky top-0 z-40">
        <DemoBanner />
      </div>
      <div className="flex flex-1">
        {/* Barra lateral fija (computadora) */}
        <aside className="fixed top-9 bottom-0 left-0 hidden w-64 flex-col gap-8 bg-navy px-4 py-7 lg:flex">
          <div className="px-3">
            <Logo tone="light" />
          </div>
          <MenuLateral />
          <p className="px-3 text-xs text-white/50">Yocoyasoft · Prototipo</p>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col lg:pl-64">
          <header className="sticky top-9 z-30 flex items-center justify-between gap-3 border-b border-border/70 bg-background/90 px-4 py-3 backdrop-blur sm:px-6 lg:px-8">
            <div className="flex items-center gap-3">
              <Dialog open={menuMovil} onOpenChange={setMenuMovil}>
                <Button
                  variant="ghost"
                  size="icon"
                  className="lg:hidden"
                  aria-label="Abrir menú"
                  onClick={() => setMenuMovil(true)}
                >
                  <Menu className="size-5" />
                </Button>
                <DialogContent
                  lado="derecha"
                  className="right-auto left-0 max-w-72 gap-8 bg-navy data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left [&>button:last-child]:text-white/70"
                  aria-describedby={undefined}
                >
                  <DialogTitle className="sr-only">Menú</DialogTitle>
                  <div className="px-3">
                    <Logo tone="light" />
                  </div>
                  <MenuLateral alNavegar={() => setMenuMovil(false)} />
                </DialogContent>
              </Dialog>
              <span className="lg:hidden">
                <Logo className="[&>span:first-child]:size-8" />
              </span>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              <ReiniciarDemo compacto />
              <div className="flex items-center gap-3 rounded-full bg-white py-1 pr-1 pl-1 shadow-soft sm:pr-4">
                <span className="grid size-9 place-items-center rounded-full bg-brand-soft text-sm font-bold text-brand-hover">
                  {iniciales(usuario.nombre)}
                </span>
                <div className="hidden leading-tight sm:block">
                  <p className="max-w-40 truncate text-sm font-semibold text-navy">
                    {usuario.nombre}
                  </p>
                  <p className="text-xs text-muted-foreground">{ETIQUETA_ROL[usuario.rol]}</p>
                </div>
              </div>
              <Badge variant="neutral" className="hidden xl:inline-flex">
                {usuario.correo}
              </Badge>
              <Button variant="ghost" size="icon" onClick={salir} aria-label="Cerrar sesión">
                <LogOut className="size-5" />
              </Button>
            </div>
          </header>

          <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  )
}
