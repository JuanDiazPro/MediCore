import type { LucideIcon } from 'lucide-react'

import { IconCircle } from '@/components/layout/IconCircle'
import { Skeleton } from '@/components/layout/Estados'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'

/** Tarjeta de indicador: ícono en círculo turquesa claro, número grande y etiqueta pequeña. */
export function StatCard({
  icono,
  valor,
  etiqueta,
  detalle,
  tono = 'neutro',
  cargando,
}: {
  icono: LucideIcon
  valor: string
  etiqueta: string
  detalle?: string
  tono?: 'neutro' | 'bueno' | 'malo'
  cargando?: boolean
}) {
  return (
    <Card className="flex-row items-center gap-4 p-5 sm:p-6">
      <IconCircle icon={icono} />
      <div className="min-w-0">
        {cargando ? (
          <Skeleton className="mb-1 h-8 w-20" />
        ) : (
          <p className="text-2xl leading-tight font-bold text-navy sm:text-[28px]">{valor}</p>
        )}
        <p className="text-sm text-muted-foreground">{etiqueta}</p>
        {detalle && !cargando && (
          <p
            className={cn(
              'mt-0.5 text-xs font-semibold',
              tono === 'bueno' && 'text-green-600',
              tono === 'malo' && 'text-red-600',
              tono === 'neutro' && 'text-muted-foreground',
            )}
          >
            {detalle}
          </p>
        )}
      </div>
    </Card>
  )
}
