import type { LucideIcon } from 'lucide-react'

import { cn } from '@/lib/utils'

/** Ícono de línea delgada dentro de un círculo turquesa claro (tarjetas de indicadores). */
export function IconCircle({ icon: Icon, className }: { icon: LucideIcon; className?: string }) {
  return (
    <span
      className={cn(
        'grid size-12 shrink-0 place-items-center rounded-full bg-brand-soft text-brand-hover',
        className,
      )}
    >
      <Icon aria-hidden className="size-6" strokeWidth={1.75} />
    </span>
  )
}
