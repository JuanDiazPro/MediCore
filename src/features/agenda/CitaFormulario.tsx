import { useEffect } from 'react'
import { Controller, useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { format } from 'date-fns'

import { PacienteSelector } from '@/components/layout/PacienteSelector'
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
import { Campo, Select, Textarea } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { toast } from '@/components/ui/toast'
import { combinarFechaHora, esquemaCita, type DatosCita } from '@/features/agenda/schemas'
import { useCrearCita, useMoverCita } from '@/features/agenda/useCitas'
import { useMedicos, useServicios } from '@/hooks/useCatalogos'
import { fechaHora } from '@/lib/formato'
import type { Cita } from '@/types'

export interface ValoresIniciales {
  pacienteId?: string
  medicoId?: string
  inicio?: Date
}

/** Crea una cita nueva o reprograma una existente (si se pasa `cita`). */
export function CitaFormulario({
  abierto,
  alCambiar,
  iniciales,
  cita,
}: {
  abierto: boolean
  alCambiar: (v: boolean) => void
  iniciales?: ValoresIniciales
  cita?: Cita
}) {
  const { data: medicos = [], porId: medicosPorId } = useMedicos()
  const { data: servicios = [] } = useServicios()
  const crear = useCrearCita()
  const mover = useMoverCita()
  const reprogramar = !!cita

  const form = useForm<DatosCita>({ resolver: zodResolver(esquemaCita) })
  const { errors } = form.formState
  const medicoId = useWatch({ control: form.control, name: 'medicoId' })

  useEffect(() => {
    if (!abierto) return
    const inicio = cita ? new Date(cita.inicio) : iniciales?.inicio
    form.reset({
      pacienteId: cita?.pacienteId ?? iniciales?.pacienteId ?? '',
      medicoId: cita?.medicoId ?? iniciales?.medicoId ?? '',
      servicioId: cita?.servicioId ?? '',
      fecha: inicio ? format(inicio, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'),
      hora: inicio ? format(inicio, 'HH:mm') : '09:00',
      notas: cita?.notas ?? '',
    })
  }, [abierto, cita, iniciales, form])

  const medico = medicosPorId.get(medicoId)
  const enviar = form.handleSubmit((d) => {
    const inicio = combinarFechaHora(d.fecha, d.hora).toISOString()
    const opciones = {
      onSuccess: (c: Cita) => {
        toast.exito(reprogramar ? 'Cita reprogramada' : 'Cita agendada', fechaHora(c.inicio))
        alCambiar(false)
      },
      onError: (e: Error) => form.setError('root', { message: e.message }),
    }
    if (cita) mover.mutate({ id: cita.id, inicio }, opciones)
    else
      crear.mutate(
        {
          pacienteId: d.pacienteId,
          medicoId: d.medicoId,
          servicioId: d.servicioId,
          inicio,
          notas: d.notas,
        },
        opciones,
      )
  })
  const pendiente = crear.isPending || mover.isPending

  return (
    <Dialog open={abierto} onOpenChange={alCambiar}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>{reprogramar ? 'Reprogramar cita' : 'Nueva cita'}</DialogTitle>
          <DialogDescription>
            Se valida que no se empalme y que esté dentro del horario del médico.
          </DialogDescription>
        </DialogHeader>
        <form noValidate onSubmit={enviar} className="grid gap-4 sm:grid-cols-2">
          <Campo
            etiqueta="Paciente"
            htmlFor="c-paciente"
            error={errors.pacienteId?.message}
            className="sm:col-span-2"
          >
            {reprogramar ? (
              <Input id="c-paciente" disabled value="Paciente de la cita" readOnly />
            ) : (
              <Controller
                control={form.control}
                name="pacienteId"
                render={({ field }) => (
                  <PacienteSelector
                    id="c-paciente"
                    valor={field.value}
                    alCambiar={field.onChange}
                    invalido={!!errors.pacienteId}
                  />
                )}
              />
            )}
          </Campo>
          <Campo etiqueta="Médico" htmlFor="c-medico" error={errors.medicoId?.message}>
            <Select
              id="c-medico"
              disabled={reprogramar}
              aria-invalid={!!errors.medicoId}
              {...form.register('medicoId')}
            >
              <option value="">Selecciona…</option>
              {medicos.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.nombre}
                </option>
              ))}
            </Select>
          </Campo>
          <Campo etiqueta="Servicio" htmlFor="c-servicio" error={errors.servicioId?.message}>
            <Select
              id="c-servicio"
              disabled={reprogramar}
              aria-invalid={!!errors.servicioId}
              {...form.register('servicioId')}
            >
              <option value="">Selecciona…</option>
              {servicios
                .filter((s) => s.activo)
                .map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.nombre} ({s.duracionMin} min)
                  </option>
                ))}
            </Select>
          </Campo>
          <Campo etiqueta="Fecha" htmlFor="c-fecha" error={errors.fecha?.message}>
            <Input id="c-fecha" type="date" {...form.register('fecha')} />
          </Campo>
          <Campo
            etiqueta="Hora"
            htmlFor="c-hora"
            error={errors.hora?.message}
            ayuda={
              medico
                ? `Horario: ${medico.horario.map((h) => `${'DLMMJVS'[h.dia]} ${h.inicio}-${h.fin}`).join(' · ')}`
                : undefined
            }
          >
            <Input id="c-hora" type="time" step={900} {...form.register('hora')} />
          </Campo>
          {!reprogramar && (
            <Campo etiqueta="Notas (opcional)" htmlFor="c-notas" className="sm:col-span-2">
              <Textarea id="c-notas" className="min-h-16" {...form.register('notas')} />
            </Campo>
          )}
          {errors.root && (
            <p
              role="alert"
              className="rounded-xl bg-danger-soft px-4 py-3 text-sm text-red-700 sm:col-span-2"
            >
              {errors.root.message}
            </p>
          )}
          <DialogFooter className="sm:col-span-2">
            <DialogClose asChild>
              <Button type="button" variant="secondary">
                Cancelar
              </Button>
            </DialogClose>
            <Button type="submit" disabled={pendiente}>
              {pendiente ? 'Guardando…' : reprogramar ? 'Reprogramar' : 'Agendar cita'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
