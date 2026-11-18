import { useState } from 'react'
import { Mail, MessageCircle, Smartphone } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Campo, Textarea } from '@/components/ui/form'
import { toast } from '@/components/ui/toast'
import { useEnviarRecordatorio } from '@/features/seguimiento/useSeguimiento'
import { useClinica } from '@/hooks/useCatalogos'
import { ETIQUETA_CANAL } from '@/lib/estados'
import { fechaCorta } from '@/lib/formato'
import { cn } from '@/lib/utils'
import type { CanalMensaje, Paciente, PlanSeguimiento } from '@/types'

const CANALES: { canal: CanalMensaje; icono: typeof Mail }[] = [
  { canal: 'whatsapp', icono: MessageCircle },
  { canal: 'sms', icono: Smartphone },
  { canal: 'correo', icono: Mail },
]

function mensajeSugerido(nombre: string, clinica: string, plan?: PlanSeguimiento) {
  return plan
    ? `Hola ${nombre}, te saludamos de ${clinica}. Tu control "${plan.motivo}" está programado para el ${fechaCorta(plan.proximaFecha)}. ¿Te agendamos una cita? Responde a este mensaje.`
    : `Hola ${nombre}, te saludamos de ${clinica}. Queremos saber cómo sigues. ¿Te agendamos una cita de seguimiento?`
}

function FormularioRecordatorio({
  paciente,
  plan,
  alCerrar,
}: {
  paciente: Paciente
  plan?: PlanSeguimiento
  alCerrar: () => void
}) {
  const { data: clinica } = useClinica()
  const enviar = useEnviarRecordatorio()
  const [canal, setCanal] = useState<CanalMensaje>('whatsapp')
  const [texto, setTexto] = useState(() =>
    mensajeSugerido(paciente.nombre, clinica?.nombre ?? 'Clínica Integral Demo', plan),
  )
  const destino = canal === 'correo' ? paciente.correo || 'sin correo' : paciente.telefono

  const mandar = () =>
    enviar.mutate(
      {
        pacienteId: paciente.id,
        canal,
        texto: texto.trim(),
        tipo: 'seguimiento',
        planId: plan?.id,
      },
      {
        onSuccess: () => {
          toast.mensaje(
            `${ETIQUETA_CANAL[canal]} enviado a ${paciente.nombre} (simulado)`,
            texto.trim().slice(0, 90) + (texto.length > 90 ? '…' : ''),
          )
          alCerrar()
        },
        onError: (e) => toast.error('No se pudo enviar', e.message),
      },
    )

  return (
    <>
      <div role="radiogroup" aria-label="Canal" className="grid grid-cols-3 gap-2">
        {CANALES.map(({ canal: c, icono: Icono }) => (
          <button
            key={c}
            type="button"
            role="radio"
            aria-checked={canal === c}
            onClick={() => setCanal(c)}
            className={cn(
              'flex flex-col items-center gap-1 rounded-2xl border-2 px-3 py-3 text-sm font-semibold transition-colors',
              canal === c
                ? 'border-primary bg-brand-soft/50 text-brand-hover'
                : 'border-border text-muted-foreground hover:border-primary/50',
            )}
          >
            <Icono aria-hidden className="size-5" strokeWidth={1.75} />
            {ETIQUETA_CANAL[c]}
          </button>
        ))}
      </div>
      <p className="text-sm text-muted-foreground">
        Para:{' '}
        <strong className="text-navy">
          {paciente.nombre} {paciente.apellidos}
        </strong>{' '}
        · {destino}
      </p>
      <Campo etiqueta="Mensaje" htmlFor="r-texto">
        <Textarea id="r-texto" value={texto} onChange={(e) => setTexto(e.target.value)} />
      </Campo>
      <div className="rounded-2xl bg-[#e7f8ef] p-4">
        <p className="mb-1 text-xs font-semibold text-green-700">Vista previa</p>
        <p className="max-w-[85%] rounded-2xl rounded-tl-sm bg-white px-4 py-2 text-sm text-navy shadow-soft">
          {texto}
        </p>
      </div>
      <DialogFooter>
        <DialogClose asChild>
          <Button variant="secondary">Cancelar</Button>
        </DialogClose>
        <Button disabled={enviar.isPending || texto.trim().length < 5} onClick={mandar}>
          {enviar.isPending ? 'Enviando…' : 'Enviar'}
        </Button>
      </DialogFooter>
    </>
  )
}

/** Vista previa y envío SIMULADO de un recordatorio por WhatsApp, SMS o correo. */
export function RecordatorioDialogo({
  paciente,
  plan,
  alCerrar,
}: {
  paciente: Paciente | null
  plan?: PlanSeguimiento
  alCerrar: () => void
}) {
  return (
    <Dialog open={!!paciente} onOpenChange={(v) => !v && alCerrar()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Enviar recordatorio</DialogTitle>
          <DialogDescription>
            Envío simulado: no se manda ningún mensaje real; queda registrado en la bandeja.
          </DialogDescription>
        </DialogHeader>
        {paciente && (
          <FormularioRecordatorio
            key={`${paciente.id}-${plan?.id ?? ''}`}
            paciente={paciente}
            plan={plan}
            alCerrar={alCerrar}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}
