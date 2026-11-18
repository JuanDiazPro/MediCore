import { CheckCircle2, Info, MessageCircle, X, XCircle } from 'lucide-react'
import { create } from 'zustand'

import { cn } from '@/lib/utils'

type Tipo = 'exito' | 'error' | 'info' | 'mensaje'

interface Aviso {
  id: number
  tipo: Tipo
  titulo: string
  descripcion?: string
}

interface EstadoAvisos {
  avisos: Aviso[]
  quitar: (id: number) => void
}

let siguiente = 1
const useAvisos = create<EstadoAvisos>()((set) => ({
  avisos: [],
  quitar: (id) => set((s) => ({ avisos: s.avisos.filter((a) => a.id !== id) })),
}))

function mostrar(tipo: Tipo, titulo: string, descripcion?: string) {
  const id = siguiente++
  useAvisos.setState((s) => ({
    avisos: [...s.avisos, { id, tipo, titulo, descripcion }].slice(-4),
  }))
  setTimeout(() => useAvisos.getState().quitar(id), tipo === 'error' ? 6000 : 4000)
}

/** Notificaciones tipo toast (sin dependencias extra). */
export const toast = {
  exito: (titulo: string, descripcion?: string) => mostrar('exito', titulo, descripcion),
  error: (titulo: string, descripcion?: string) => mostrar('error', titulo, descripcion),
  info: (titulo: string, descripcion?: string) => mostrar('info', titulo, descripcion),
  /** Simula la llegada de un mensaje (WhatsApp/SMS) al teléfono del paciente. */
  mensaje: (titulo: string, descripcion?: string) => mostrar('mensaje', titulo, descripcion),
}

const ICONO = { exito: CheckCircle2, error: XCircle, info: Info, mensaje: MessageCircle }
const COLOR = {
  exito: 'text-success',
  error: 'text-danger',
  info: 'text-brand',
  mensaje: 'text-green-600',
}

export function Toaster() {
  const { avisos, quitar } = useAvisos()
  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed inset-x-4 bottom-4 z-[100] flex flex-col items-center gap-2 sm:inset-x-auto sm:right-6 sm:bottom-6 sm:items-end"
    >
      {avisos.map((a) => {
        const Icono = ICONO[a.tipo]
        return (
          <div
            key={a.id}
            role={a.tipo === 'error' ? 'alert' : 'status'}
            className="pointer-events-auto flex w-full max-w-sm animate-in items-start gap-3 rounded-2xl bg-white p-4 shadow-lift fade-in slide-in-from-bottom-2"
          >
            <Icono aria-hidden className={cn('mt-0.5 size-5 shrink-0', COLOR[a.tipo])} />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-navy">{a.titulo}</p>
              {a.descripcion && (
                <p className="mt-0.5 text-sm break-words text-muted-foreground">{a.descripcion}</p>
              )}
            </div>
            <button
              type="button"
              onClick={() => quitar(a.id)}
              className="rounded-full p-1 text-muted-foreground hover:bg-muted"
              aria-label="Cerrar aviso"
            >
              <X className="size-4" />
            </button>
          </div>
        )
      })}
    </div>
  )
}
