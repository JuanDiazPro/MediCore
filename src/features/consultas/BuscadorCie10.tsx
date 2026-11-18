import { useState } from 'react'
import { Plus, Search, X } from 'lucide-react'

import { Input } from '@/components/ui/input'
import { useBuscarCie10 } from '@/features/consultas/useConsultas'
import { useDebounce } from '@/hooks/useDebounce'
import type { Diagnostico } from '@/types'

export function BuscadorCie10({
  valor,
  alCambiar,
  invalido,
}: {
  valor: Diagnostico[]
  alCambiar: (d: Diagnostico[]) => void
  invalido?: boolean
}) {
  const [texto, setTexto] = useState('')
  const busqueda = useDebounce(texto, 200)
  const { data = [] } = useBuscarCie10(busqueda)
  const elegidos = new Set(valor.map((d) => d.codigo))

  return (
    <div className="flex flex-col gap-3">
      {valor.length > 0 && (
        <ul className="flex flex-wrap gap-2">
          {valor.map((d) => (
            <li
              key={d.codigo}
              className="inline-flex items-center gap-2 rounded-full bg-brand-soft py-1.5 pr-1.5 pl-3 text-sm text-navy"
            >
              <strong className="text-brand-hover">{d.codigo}</strong>
              <span className="max-w-60 truncate">{d.descripcion}</span>
              <button
                type="button"
                onClick={() => alCambiar(valor.filter((x) => x.codigo !== d.codigo))}
                className="rounded-full p-0.5 hover:bg-white"
                aria-label={`Quitar ${d.codigo}`}
              >
                <X className="size-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
      <div className="relative">
        <Search aria-hidden className="absolute top-3.5 left-4 size-4 text-muted-foreground" />
        <Input
          id="cie10"
          aria-invalid={invalido}
          placeholder="Busca por código o descripción (p. ej. I10 o faringitis)"
          className="pl-11"
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
        />
      </div>
      <ul aria-label="Resultados CIE-10" className="grid gap-1 sm:grid-cols-2">
        {data
          .filter((c) => !elegidos.has(c.codigo))
          .slice(0, 6)
          .map((c) => (
            <li key={c.codigo}>
              <button
                type="button"
                onClick={() => {
                  alCambiar([...valor, c])
                  setTexto('')
                }}
                className="flex w-full items-start gap-2 rounded-xl px-3 py-2 text-left text-sm hover:bg-brand-soft/60 focus-visible:bg-brand-soft/60 focus-visible:outline-none"
              >
                <Plus aria-hidden className="mt-0.5 size-4 shrink-0 text-brand" />
                <span>
                  <strong className="text-navy">{c.codigo}</strong>{' '}
                  <span className="text-muted-foreground">{c.descripcion}</span>
                </span>
              </button>
            </li>
          ))}
      </ul>
      <p className="text-xs text-muted-foreground">Catálogo CIE-10 de ejemplo (subconjunto).</p>
    </div>
  )
}
