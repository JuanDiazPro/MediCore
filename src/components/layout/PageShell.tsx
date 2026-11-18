import type { ReactNode } from 'react'

import { DemoBanner } from '@/components/layout/DemoBanner'

/** Contenedor de página pública: franja de demo + contenido centrado. */
export function PageShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-svh flex-col">
      <DemoBanner />
      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        {children}
      </main>
      <footer className="px-4 pb-8 text-center text-xs text-muted-foreground">
        MediCore es un prototipo de Yocoyasoft. No procesa información médica real.
      </footer>
    </div>
  )
}
