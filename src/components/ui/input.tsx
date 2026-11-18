import * as React from 'react'

import { cn } from '@/lib/utils'

function Input({ className, type, ...props }: React.ComponentProps<'input'>) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        'h-11 w-full min-w-0 rounded-xl border border-input bg-white px-4 text-[15px] text-navy transition-colors outline-none placeholder:text-muted-foreground',
        'focus-visible:border-primary focus-visible:ring-4 focus-visible:ring-ring/25',
        'aria-invalid:border-danger aria-invalid:ring-danger/20',
        'disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      {...props}
    />
  )
}

export { Input }
