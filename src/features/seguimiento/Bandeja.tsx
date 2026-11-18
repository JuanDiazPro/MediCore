import { useState } from 'react'
import { Inbox, Mail, MessageCircle, Smartphone } from 'lucide-react'

import { Cargando, ErrorCarga, Vacio } from '@/components/layout/Estados'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select } from '@/components/ui/form'
import { useMensajes } from '@/features/seguimiento/useSeguimiento'
import { usePacientesIndice } from '@/hooks/useCatalogos'
import { ETIQUETA_CANAL } from '@/lib/estados'
import { fechaHora } from '@/lib/formato'
import type { CanalMensaje, Mensaje } from '@/types'

const ICONO = { whatsapp: MessageCircle, sms: Smartphone, correo: Mail }
const TIPO: Record<Mensaje['tipo'], string> = {
  recordatorio_cita: 'Recordatorio de cita',
  seguimiento: 'Seguimiento',
  campana: 'Campaña',
}

/** Historial simulado de mensajes enviados. */
export function Bandeja({ pacienteId }: { pacienteId?: string }) {
  const mensajes = useMensajes(pacienteId)
  const { porId: pacientes } = usePacientesIndice()
  const [canal, setCanal] = useState<CanalMensaje | ''>('')
  const [mostrar, setMostrar] = useState(15)

  if (mensajes.isPending) return <Cargando />
  if (mensajes.isError)
    return <ErrorCarga error={mensajes.error} reintentar={() => mensajes.refetch()} />
  const lista = mensajes.data.filter((m) => !canal || m.canal === canal)

  return (
    <div className="flex flex-col gap-4">
      {!pacienteId && (
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">{lista.length} mensajes enviados</p>
          <div className="w-44">
            <Select
              aria-label="Filtrar por canal"
              value={canal}
              onChange={(e) => setCanal(e.target.value as CanalMensaje | '')}
            >
              <option value="">Todos los canales</option>
              <option value="whatsapp">WhatsApp</option>
              <option value="sms">SMS</option>
              <option value="correo">Correo</option>
            </Select>
          </div>
        </div>
      )}
      {lista.length === 0 ? (
        <Vacio
          icono={Inbox}
          titulo="Sin mensajes"
          descripcion="Los recordatorios enviados aparecen aquí."
        />
      ) : (
        <ul className="divide-y divide-border">
          {lista.slice(0, mostrar).map((m) => {
            const Icono = ICONO[m.canal]
            const p = pacientes.get(m.pacienteId)
            return (
              <li key={m.id} className="flex gap-3 py-3">
                <span className="grid size-10 shrink-0 place-items-center rounded-full bg-brand-soft text-brand-hover">
                  <Icono aria-hidden className="size-5" strokeWidth={1.75} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    {!pacienteId && (
                      <span className="font-semibold text-navy">
                        {p ? `${p.nombre} ${p.apellidos}` : 'Paciente'}
                      </span>
                    )}
                    <Badge variant="neutral">{TIPO[m.tipo]}</Badge>
                    <span className="text-xs text-muted-foreground">
                      {ETIQUETA_CANAL[m.canal]} · {fechaHora(m.enviadoEn)} · {m.enviadoPor}
                    </span>
                  </div>
                  <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{m.texto}</p>
                </div>
              </li>
            )
          })}
        </ul>
      )}
      {lista.length > mostrar && (
        <Button
          variant="secondary"
          size="sm"
          className="self-center"
          onClick={() => setMostrar((n) => n + 15)}
        >
          Ver más
        </Button>
      )}
    </div>
  )
}
