import type { ReactNode } from 'react'
import { AlertTriangle, Inbox, type LucideIcon } from 'lucide-react'

import { IconCircle } from '@/components/layout/IconCircle'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export function Skeleton({ className }: { className?: string }) {
  return <div aria-hidden className={cn('animate-pulse rounded-xl bg-slate-200/70', className)} />
}

/** Estado de carga genérico: varias filas grises. */
export function Cargando({ filas = 4, className }: { filas?: number; className?: string }) {
  return (
    <div role="status" aria-label="Cargando" className={cn('flex flex-col gap-3', className)}>
      {Array.from({ length: filas }, (_, i) => (
        <Skeleton key={i} className="h-12 w-full" />
      ))}
      <span className="sr-only">Cargando…</span>
    </div>
  )
}

export function Vacio({
  icono = Inbox,
  titulo,
  descripcion,
  accion,
}: {
  icono?: LucideIcon
  titulo: string
  descripcion?: string
  accion?: ReactNode
}) {
  return (
    <div className="flex flex-col items-center gap-3 px-4 py-10 text-center">
      <IconCircle icon={icono} />
      <p className="font-semibold text-navy">{titulo}</p>
      {descripcion && <p className="max-w-sm text-sm text-muted-foreground">{descripcion}</p>}
      {accion}
    </div>
  )
}

export function ErrorCarga({ error, reintentar }: { error: unknown; reintentar?: () => void }) {
  return (
    <div role="alert" className="flex flex-col items-center gap-3 px-4 py-10 text-center">
      <IconCircle icon={AlertTriangle} className="bg-danger-soft text-red-600" />
      <p className="font-semibold text-navy">No se pudo cargar la información</p>
      <p className="max-w-sm text-sm text-muted-foreground">
        {error instanceof Error ? error.message : 'Ocurrió un error inesperado.'}
      </p>
      {reintentar && (
        <Button variant="secondary" size="sm" onClick={reintentar}>
          Reintentar
        </Button>
      )}
    </div>
  )
}
