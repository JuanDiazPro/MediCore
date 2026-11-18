import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

/** Píldora para estados (p. ej. estados de cita). */
const badgeVariants = cva(
  'inline-flex w-fit shrink-0 items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold whitespace-nowrap [&>svg]:size-3.5',
  {
    variants: {
      variant: {
        default: 'bg-brand-soft text-brand-hover',
        confirmada: 'bg-success-soft text-green-700',
        asistio: 'bg-success-soft text-green-700',
        pendiente: 'bg-warning-soft text-amber-700',
        no_asistio: 'bg-danger-soft text-red-700',
        cancelada: 'bg-danger-soft text-red-700',
        neutral: 'bg-muted text-muted-foreground',
      },
    },
    defaultVariants: { variant: 'default' },
  },
)

const dotColor: Record<string, string> = {
  confirmada: 'bg-success',
  asistio: 'bg-success',
  pendiente: 'bg-warning',
  no_asistio: 'bg-danger',
  cancelada: 'bg-danger',
}

function Badge({
  className,
  variant,
  children,
  ...props
}: React.ComponentProps<'span'> & VariantProps<typeof badgeVariants>) {
  const dot = variant ? dotColor[variant] : undefined
  return (
    <span data-slot="badge" className={cn(badgeVariants({ variant }), className)} {...props}>
      {dot && <span aria-hidden className={cn('size-1.5 rounded-full', dot)} />}
      {children}
    </span>
  )
}

export { Badge, badgeVariants }
