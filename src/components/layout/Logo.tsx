import { Activity } from 'lucide-react'

import { cn } from '@/lib/utils'

type LogoProps = {
  /** `light` para fondos oscuros (barra lateral azul marino). */
  tone?: 'dark' | 'light'
  className?: string
}

export function Logo({ tone = 'dark', className }: LogoProps) {
  return (
    <span className={cn('inline-flex items-center gap-2.5', className)}>
      <span className="grid size-9 place-items-center rounded-xl bg-brand text-white shadow-sm">
        <Activity aria-hidden className="size-5" strokeWidth={2.25} />
      </span>
      <span
        className={cn(
          'text-xl font-extrabold tracking-tight',
          tone === 'light' ? 'text-white' : 'text-navy',
        )}
      >
        Medi<span className="text-brand">Core</span>
      </span>
    </span>
  )
}
