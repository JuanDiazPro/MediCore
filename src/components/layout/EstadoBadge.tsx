import { BellRing } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { ETIQUETA_ESTADO } from '@/lib/estados'
import type { EstadoCita } from '@/types'

export function EstadoBadge({ estado }: { estado: EstadoCita }) {
  return <Badge variant={estado}>{ETIQUETA_ESTADO[estado]}</Badge>
}

export function RecordatorioBadge() {
  return (
    <Badge variant="default" title="Recordatorio enviado (simulado)">
      <BellRing aria-hidden />
      Recordatorio enviado
    </Badge>
  )
}
