import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { addMonths, format } from 'date-fns'
import { z } from 'zod'

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
import { Campo, Select } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { toast } from '@/components/ui/toast'
import { useGuardarPlan } from '@/features/seguimiento/useSeguimiento'
import { useMedicos } from '@/hooks/useCatalogos'
import { MOTIVOS_SEGUIMIENTO } from '@/mocks/catalogos'
import type { PlanSeguimiento } from '@/types'

const esquema = z.object({
  motivo: z.string().trim().min(3, 'Escribe el motivo del seguimiento.').max(80),
  proximaFecha: z.string().min(1, 'Indica la fecha del próximo control.'),
  medicoId: z.string().min(1, 'Selecciona el médico.'),
})
type Datos = z.infer<typeof esquema>

export function PlanFormulario({
  abierto,
  alCambiar,
  pacienteId,
  medicoId,
  plan,
  motivoSugerido,
}: {
  abierto: boolean
  alCambiar: (v: boolean) => void
  pacienteId: string
  medicoId?: string
  plan?: PlanSeguimiento
  motivoSugerido?: string
}) {
  const { data: medicos = [] } = useMedicos()
  const guardar = useGuardarPlan()
  const form = useForm<Datos>({ resolver: zodResolver(esquema) })
  const { errors } = form.formState

  useEffect(() => {
    if (!abierto) return
    form.reset({
      motivo: plan?.motivo ?? motivoSugerido ?? '',
      proximaFecha: plan
        ? plan.proximaFecha.slice(0, 10)
        : format(addMonths(new Date(), 1), 'yyyy-MM-dd'),
      medicoId: plan?.medicoId ?? medicoId ?? '',
    })
  }, [abierto, plan, medicoId, motivoSugerido, form])

  const enviar = form.handleSubmit((d) =>
    guardar.mutate(
      {
        id: plan?.id,
        datos: {
          pacienteId,
          medicoId: d.medicoId,
          motivo: d.motivo.trim(),
          proximaFecha: new Date(`${d.proximaFecha}T09:00:00`).toISOString(),
        },
      },
      {
        onSuccess: () => {
          toast.exito(plan ? 'Plan actualizado' : 'Plan de seguimiento creado')
          alCambiar(false)
        },
        onError: (e) => toast.error('No se pudo guardar', e.message),
      },
    ),
  )

  return (
    <Dialog open={abierto} onOpenChange={alCambiar}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {plan ? 'Editar plan de seguimiento' : 'Nuevo plan de seguimiento'}
          </DialogTitle>
          <DialogDescription>
            MediCore avisará cuando el control esté por vencer para que el paciente regrese.
          </DialogDescription>
        </DialogHeader>
        <form noValidate onSubmit={enviar} className="flex flex-col gap-4">
          <Campo etiqueta="Motivo" htmlFor="pl-motivo" error={errors.motivo?.message}>
            <Input
              id="pl-motivo"
              list="pl-motivos"
              aria-invalid={!!errors.motivo}
              {...form.register('motivo')}
            />
            <datalist id="pl-motivos">
              {MOTIVOS_SEGUIMIENTO.map((m) => (
                <option key={m} value={m} />
              ))}
            </datalist>
          </Campo>
          <div className="grid gap-4 sm:grid-cols-2">
            <Campo
              etiqueta="Próximo control"
              htmlFor="pl-fecha"
              error={errors.proximaFecha?.message}
            >
              <Input id="pl-fecha" type="date" {...form.register('proximaFecha')} />
            </Campo>
            <Campo etiqueta="Médico" htmlFor="pl-medico" error={errors.medicoId?.message}>
              <Select id="pl-medico" {...form.register('medicoId')}>
                <option value="">Selecciona…</option>
                {medicos.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.nombre}
                  </option>
                ))}
              </Select>
            </Campo>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="secondary">
                Cancelar
              </Button>
            </DialogClose>
            <Button type="submit" disabled={guardar.isPending}>
              {guardar.isPending ? 'Guardando…' : 'Guardar plan'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
