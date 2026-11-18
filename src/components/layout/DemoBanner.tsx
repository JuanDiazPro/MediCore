import { FlaskConical } from 'lucide-react'

/** Franja obligatoria en todas las pantallas (regla 4 de CLAUDE.md). */
export function DemoBanner() {
  return (
    <div
      role="note"
      className="flex h-9 items-center justify-center gap-2 bg-navy px-4 text-center text-xs font-medium text-white sm:text-sm"
    >
      <FlaskConical aria-hidden className="size-4 shrink-0 text-brand" strokeWidth={1.75} />
      <span>Versión demostrativa: datos ficticios</span>
    </div>
  )
}
