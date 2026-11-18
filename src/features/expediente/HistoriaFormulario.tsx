import { useEffect } from 'react'
import { useForm } from 'react-hook-form'

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
import { Input } from '@/components/ui/input'
import { toast } from '@/components/ui/toast'
import { useGuardarPaciente } from '@/features/pacientes/usePacientes'
import type { HistoriaClinica, Paciente } from '@/types'

type Datos = HistoriaClinica & { alergias: string }

export function HistoriaFormulario({
  abierto,
  alCambiar,
  paciente,
}: {
  abierto: boolean
  alCambiar: (v: boolean) => void
  paciente: Paciente
}) {
  const guardar = useGuardarPaciente()
  const form = useForm<Datos>()

  useEffect(() => {
    if (abierto) form.reset({ ...paciente.historia, alergias: paciente.alergias.join(', ') })
  }, [abierto, paciente, form])

  const enviar = form.handleSubmit(({ alergias, ...historia }) =>
    guardar.mutate(
      {
        id: paciente.id,
        datos: {
          historia,
          alergias: alergias
            .split(',')
            .map((a) => a.trim())
            .filter(Boolean),
        },
      },
      {
        onSuccess: () => {
          toast.exito('Historia clínica actualizada')
          alCambiar(false)
        },
        onError: (e) => toast.error('No se pudo guardar', e.message),
      },
    ),
  )

  return (
    <Dialog open={abierto} onOpenChange={alCambiar}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Historia clínica</DialogTitle>
          <DialogDescription>Antecedentes del paciente (estructura de ejemplo).</DialogDescription>
        </DialogHeader>
        <form onSubmit={enviar} className="flex flex-col gap-4">
          <Campo etiqueta="Antecedentes heredofamiliares" htmlFor="h-hf">
            <Textarea id="h-hf" className="min-h-20" {...form.register('heredofamiliares')} />
          </Campo>
          <Campo etiqueta="Personales patológicos" htmlFor="h-pp">
            <Textarea id="h-pp" className="min-h-20" {...form.register('personalesPatologicos')} />
          </Campo>
          <Campo etiqueta="Personales no patológicos" htmlFor="h-pnp">
            <Textarea
              id="h-pnp"
              className="min-h-20"
              {...form.register('personalesNoPatologicos')}
            />
          </Campo>
          <Campo etiqueta="Alergias" htmlFor="h-alergias" ayuda="Sepáralas con comas.">
            <Input id="h-alergias" {...form.register('alergias')} />
          </Campo>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="secondary">
                Cancelar
              </Button>
            </DialogClose>
            <Button type="submit" disabled={guardar.isPending}>
              {guardar.isPending ? 'Guardando…' : 'Guardar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
