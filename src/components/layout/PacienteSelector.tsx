import { useId, useMemo, useState } from 'react'
import { Check, Search, X } from 'lucide-react'

import { Input } from '@/components/ui/input'
import { usePacientesIndice } from '@/hooks/useCatalogos'
import { cn } from '@/lib/utils'

const normalizar = (s: string) => s.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase()

/** Buscador de pacientes con lista de coincidencias (accesible con teclado). */
export function PacienteSelector({
  id,
  valor,
  alCambiar,
  invalido,
  medicoId,
}: {
  id: string
  valor: string
  alCambiar: (pacienteId: string) => void
  invalido?: boolean
  /** Si se indica, solo muestra pacientes de ese médico. */
  medicoId?: string
}) {
  const { data = [], porId, isPending } = usePacientesIndice()
  const [texto, setTexto] = useState('')
  const [abierto, setAbierto] = useState(false)
  const listaId = useId()
  const seleccionado = porId.get(valor)

  const opciones = useMemo(() => {
    const t = normalizar(texto.trim())
    const digitos = t.replace(/\D/g, '')
    return data
      .filter((p) => !medicoId || p.medicoId === medicoId)
      .filter(
        (p) =>
          !t ||
          normalizar(`${p.nombre} ${p.apellidos}`).includes(t) ||
          (digitos.length >= 3 && p.telefono.replace(/\D/g, '').includes(digitos)),
      )
      .slice(0, 8)
  }, [data, texto, medicoId])

  if (seleccionado) {
    return (
      <div className="flex h-11 items-center justify-between gap-2 rounded-xl border border-primary bg-brand-soft/40 px-4">
        <span className="truncate font-medium text-navy">
          {seleccionado.nombre} {seleccionado.apellidos}
        </span>
        <button
          type="button"
          className="rounded-full p-1 text-muted-foreground hover:bg-white hover:text-navy"
          onClick={() => {
            alCambiar('')
            setTexto('')
          }}
          aria-label="Quitar paciente"
        >
          <X className="size-4" />
        </button>
      </div>
    )
  }

  return (
    <div className="relative">
      <Search aria-hidden className="absolute top-3.5 left-4 size-4 text-muted-foreground" />
      <Input
        id={id}
        role="combobox"
        aria-expanded={abierto}
        aria-controls={listaId}
        aria-autocomplete="list"
        aria-invalid={invalido}
        autoComplete="off"
        placeholder={isPending ? 'Cargando pacientes…' : 'Buscar por nombre o teléfono'}
        className="pl-11"
        value={texto}
        onChange={(e) => {
          setTexto(e.target.value)
          setAbierto(true)
        }}
        onFocus={() => setAbierto(true)}
        onBlur={() => setTimeout(() => setAbierto(false), 150)}
      />
      {abierto && opciones.length > 0 && (
        <ul
          id={listaId}
          role="listbox"
          className="absolute z-10 mt-2 max-h-64 w-full overflow-y-auto rounded-xl bg-white p-1 shadow-lift"
        >
          {opciones.map((p) => (
            <li key={p.id} role="option" aria-selected={p.id === valor}>
              <button
                type="button"
                className={cn(
                  'flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-left text-sm hover:bg-brand-soft/60 focus-visible:bg-brand-soft/60 focus-visible:outline-none',
                )}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  alCambiar(p.id)
                  setAbierto(false)
                }}
              >
                <span>
                  <span className="block font-medium text-navy">
                    {p.nombre} {p.apellidos}
                  </span>
                  <span className="text-xs text-muted-foreground">{p.telefono}</span>
                </span>
                {p.id === valor && <Check className="size-4 text-brand" />}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
