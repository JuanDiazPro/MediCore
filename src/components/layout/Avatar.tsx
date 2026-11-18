import { iniciales } from '@/lib/formato'
import { cn } from '@/lib/utils'

export function Avatar({
  nombre,
  color,
  className,
}: {
  nombre: string
  color?: string
  className?: string
}) {
  return (
    <span
      aria-hidden
      className={cn(
        'grid size-10 shrink-0 place-items-center rounded-full bg-brand-soft text-sm font-bold text-brand-hover',
        className,
      )}
      style={color ? { backgroundColor: `${color}22`, color } : undefined}
    >
      {iniciales(nombre)}
    </span>
  )
}
