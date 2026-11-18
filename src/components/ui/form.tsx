import * as React from 'react'
import * as LabelPrimitive from '@radix-ui/react-label'
import { ChevronDown } from 'lucide-react'

import { cn } from '@/lib/utils'

function Label({ className, ...props }: React.ComponentProps<typeof LabelPrimitive.Root>) {
  return (
    <LabelPrimitive.Root className={cn('text-sm font-semibold text-navy', className)} {...props} />
  )
}

const campoBase =
  'w-full min-w-0 rounded-xl border border-input bg-white px-4 text-[15px] text-navy transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-primary focus-visible:ring-4 focus-visible:ring-ring/25 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-danger aria-invalid:ring-danger/20'

function Select({ className, children, ...props }: React.ComponentProps<'select'>) {
  return (
    <div className="relative">
      <select
        className={cn(campoBase, 'h-11 cursor-pointer appearance-none pr-10', className)}
        {...props}
      >
        {children}
      </select>
      <ChevronDown
        aria-hidden
        className="pointer-events-none absolute top-1/2 right-3.5 size-4 -translate-y-1/2 text-muted-foreground"
      />
    </div>
  )
}

function Textarea({ className, ...props }: React.ComponentProps<'textarea'>) {
  return (
    <textarea className={cn(campoBase, 'min-h-24 py-3 leading-relaxed', className)} {...props} />
  )
}

/** Agrupa etiqueta + control + mensaje de error. */
function Campo({
  etiqueta,
  htmlFor,
  error,
  ayuda,
  className,
  children,
}: {
  etiqueta: string
  htmlFor: string
  error?: string
  ayuda?: string
  className?: string
  children: React.ReactNode
}) {
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <Label htmlFor={htmlFor}>{etiqueta}</Label>
      {children}
      {error ? (
        <p role="alert" className="text-xs font-medium text-red-600">
          {error}
        </p>
      ) : (
        ayuda && <p className="text-xs text-muted-foreground">{ayuda}</p>
      )}
    </div>
  )
}

export { Label, Select, Textarea, Campo }
