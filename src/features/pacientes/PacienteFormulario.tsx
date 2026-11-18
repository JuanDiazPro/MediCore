import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

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
import {
  aFormulario,
  aPaciente,
  esquemaPaciente,
  TIPOS_SANGRE,
  type DatosPaciente,
} from '@/features/pacientes/schemas'
import { useGuardarPaciente } from '@/features/pacientes/usePacientes'
import { useMedicos } from '@/hooks/useCatalogos'
import type { Paciente } from '@/types'

export function PacienteFormulario({
  abierto,
  alCambiar,
  paciente,
  alGuardar,
}: {
  abierto: boolean
  alCambiar: (abierto: boolean) => void
  paciente?: Paciente
  alGuardar?: (p: Paciente) => void
}) {
  const { data: medicos = [] } = useMedicos()
  const guardar = useGuardarPaciente()
  const form = useForm<DatosPaciente>({
    resolver: zodResolver(esquemaPaciente),
    defaultValues: aFormulario(paciente),
  })
  const { errors } = form.formState

  useEffect(() => {
    if (abierto) form.reset(aFormulario(paciente))
  }, [abierto, paciente, form])

  const enviar = form.handleSubmit((d) =>
    guardar.mutate(
      { id: paciente?.id, datos: aPaciente(d, paciente) },
      {
        onSuccess: (p) => {
          toast.exito(
            paciente ? 'Paciente actualizado' : 'Paciente registrado',
            `${p.nombre} ${p.apellidos}`,
          )
          alCambiar(false)
          alGuardar?.(p)
        },
        onError: (e) => toast.error('No se pudo guardar', e.message),
      },
    ),
  )

  return (
    <Dialog open={abierto} onOpenChange={alCambiar}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{paciente ? 'Editar paciente' : 'Nuevo paciente'}</DialogTitle>
          <DialogDescription>Usa solo datos ficticios: este es un demo.</DialogDescription>
        </DialogHeader>
        <form noValidate onSubmit={enviar} className="grid gap-4 sm:grid-cols-2">
          <Campo etiqueta="Nombre(s)" htmlFor="p-nombre" error={errors.nombre?.message}>
            <Input id="p-nombre" aria-invalid={!!errors.nombre} {...form.register('nombre')} />
          </Campo>
          <Campo etiqueta="Apellidos" htmlFor="p-apellidos" error={errors.apellidos?.message}>
            <Input
              id="p-apellidos"
              aria-invalid={!!errors.apellidos}
              {...form.register('apellidos')}
            />
          </Campo>
          <Campo
            etiqueta="Fecha de nacimiento"
            htmlFor="p-nacimiento"
            error={errors.fechaNacimiento?.message}
          >
            <Input
              id="p-nacimiento"
              type="date"
              aria-invalid={!!errors.fechaNacimiento}
              {...form.register('fechaNacimiento')}
            />
          </Campo>
          <Campo etiqueta="Sexo" htmlFor="p-sexo" error={errors.sexo?.message}>
            <Select id="p-sexo" aria-invalid={!!errors.sexo} {...form.register('sexo')}>
              <option value="">Selecciona…</option>
              <option value="F">Femenino</option>
              <option value="M">Masculino</option>
            </Select>
          </Campo>
          <Campo etiqueta="Teléfono" htmlFor="p-telefono" error={errors.telefono?.message}>
            <Input
              id="p-telefono"
              type="tel"
              inputMode="tel"
              placeholder="55 1234 5678"
              aria-invalid={!!errors.telefono}
              {...form.register('telefono')}
            />
          </Campo>
          <Campo etiqueta="Correo (opcional)" htmlFor="p-correo" error={errors.correo?.message}>
            <Input
              id="p-correo"
              type="email"
              placeholder="nombre@demo.medicore"
              aria-invalid={!!errors.correo}
              {...form.register('correo')}
            />
          </Campo>
          <Campo etiqueta="Tipo de sangre" htmlFor="p-sangre">
            <Select id="p-sangre" {...form.register('tipoSangre')}>
              {TIPOS_SANGRE.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </Select>
          </Campo>
          <Campo etiqueta="Médico tratante" htmlFor="p-medico" error={errors.medicoId?.message}>
            <Select id="p-medico" aria-invalid={!!errors.medicoId} {...form.register('medicoId')}>
              <option value="">Selecciona…</option>
              {medicos.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.nombre} · {m.especialidad}
                </option>
              ))}
            </Select>
          </Campo>
          <Campo
            etiqueta="Alergias"
            htmlFor="p-alergias"
            ayuda="Sepáralas con comas. Déjalo vacío si no tiene."
            className="sm:col-span-2"
          >
            <Input id="p-alergias" placeholder="Penicilina, Látex" {...form.register('alergias')} />
          </Campo>
          <DialogFooter className="sm:col-span-2">
            <DialogClose asChild>
              <Button type="button" variant="secondary">
                Cancelar
              </Button>
            </DialogClose>
            <Button type="submit" disabled={guardar.isPending}>
              {guardar.isPending ? 'Guardando…' : 'Guardar paciente'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
