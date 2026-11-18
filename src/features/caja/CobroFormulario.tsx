import { useEffect } from 'react'
import { Controller, useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Banknote, CreditCard, Download, Landmark } from 'lucide-react'
import { z } from 'zod'

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
import { Campo, Select } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { toast } from '@/components/ui/toast'
import { useDescargarRecibo } from '@/features/caja/useDescargarRecibo'
import { useRegistrarPago } from '@/features/caja/usePagos'
import { useMedicos, useServicios } from '@/hooks/useCatalogos'
import { ETIQUETA_METODO } from '@/lib/estados'
import { formatearMoneda } from '@/lib/formato'
import { cn } from '@/lib/utils'
import type { MetodoPago } from '@/types'

const esquema = z.object({
  pacienteId: z.string().min(1, 'Selecciona un paciente.'),
  servicioId: z.string().min(1, 'Selecciona el servicio.'),
  medicoId: z.string().min(1, 'Selecciona el médico.'),
  monto: z.coerce
    .number<string>({ error: 'Monto no válido.' })
    .positive('Debe ser mayor a cero.')
    .max(100000),
  metodo: z.enum(['efectivo', 'tarjeta', 'transferencia']),
})
type Entrada = z.input<typeof esquema>
type Datos = z.output<typeof esquema>

export interface CobroInicial {
  pacienteId?: string
  servicioId?: string
  medicoId?: string
  citaId?: string
}

const METODOS: { metodo: MetodoPago; icono: typeof Banknote }[] = [
  { metodo: 'efectivo', icono: Banknote },
  { metodo: 'tarjeta', icono: CreditCard },
  { metodo: 'transferencia', icono: Landmark },
]

export function CobroFormulario({
  inicial,
  alCerrar,
}: {
  inicial: CobroInicial | null
  alCerrar: () => void
}) {
  const { data: servicios = [], porId: serviciosPorId } = useServicios()
  const { data: medicos = [] } = useMedicos()
  const registrar = useRegistrarPago()
  const descargarRecibo = useDescargarRecibo()
  const form = useForm<Entrada, unknown, Datos>({ resolver: zodResolver(esquema) })
  const { errors } = form.formState
  const servicioId = useWatch({ control: form.control, name: 'servicioId' })
  const metodo = useWatch({ control: form.control, name: 'metodo' })

  useEffect(() => {
    if (!inicial) return
    form.reset({
      pacienteId: inicial.pacienteId ?? '',
      servicioId: inicial.servicioId ?? '',
      medicoId: inicial.medicoId ?? '',
      monto: inicial.servicioId ? String(serviciosPorId.get(inicial.servicioId)?.precio ?? '') : '',
      metodo: 'efectivo',
    })
  }, [inicial, form, serviciosPorId])

  const enviar = form.handleSubmit((d) =>
    registrar.mutate(
      { ...d, citaId: inicial?.citaId },
      {
        onSuccess: (pago) => {
          toast.exito(`Cobro ${pago.folio} registrado`, formatearMoneda(pago.monto))
          alCerrar()
          void descargarRecibo(pago)
        },
        onError: (e) => form.setError('root', { message: e.message }),
      },
    ),
  )

  return (
    <Dialog open={!!inicial} onOpenChange={(v) => !v && alCerrar()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Registrar cobro</DialogTitle>
          <DialogDescription>
            Al guardar se descarga el recibo simulado con marca DEMO.
          </DialogDescription>
        </DialogHeader>
        <form noValidate onSubmit={enviar} className="flex flex-col gap-4">
          <Campo etiqueta="Paciente" htmlFor="co-paciente" error={errors.pacienteId?.message}>
            <Controller
              control={form.control}
              name="pacienteId"
              render={({ field }) => (
                <PacienteSelector
                  id="co-paciente"
                  valor={field.value ?? ''}
                  alCambiar={field.onChange}
                  invalido={!!errors.pacienteId}
                />
              )}
            />
          </Campo>
          <div className="grid gap-4 sm:grid-cols-2">
            <Campo etiqueta="Servicio" htmlFor="co-servicio" error={errors.servicioId?.message}>
              <Select
                id="co-servicio"
                aria-invalid={!!errors.servicioId}
                {...form.register('servicioId', {
                  onChange: (e) => {
                    const precio = serviciosPorId.get(e.target.value)?.precio
                    if (precio) form.setValue('monto', String(precio))
                  },
                })}
              >
                <option value="">Selecciona…</option>
                {servicios.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.nombre}
                  </option>
                ))}
              </Select>
            </Campo>
            <Campo etiqueta="Médico" htmlFor="co-medico" error={errors.medicoId?.message}>
              <Select
                id="co-medico"
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
          </div>
          <Campo
            etiqueta="Monto (MXN)"
            htmlFor="co-monto"
            error={errors.monto?.message}
            ayuda={
              servicioId && serviciosPorId.get(servicioId)
                ? `Precio de lista: ${formatearMoneda(serviciosPorId.get(servicioId)!.precio)}`
                : undefined
            }
          >
            <Input
              id="co-monto"
              type="number"
              inputMode="decimal"
              step="0.01"
              aria-invalid={!!errors.monto}
              {...form.register('monto')}
            />
          </Campo>
          <fieldset>
            <legend className="mb-1.5 text-sm font-semibold text-navy">Método de pago</legend>
            <div className="grid grid-cols-3 gap-2">
              {METODOS.map(({ metodo: m, icono: Icono }) => (
                <label
                  key={m}
                  className={cn(
                    'flex cursor-pointer flex-col items-center gap-1 rounded-2xl border-2 px-2 py-3 text-sm font-semibold transition-colors has-[:focus-visible]:ring-4 has-[:focus-visible]:ring-ring/30',
                    metodo === m
                      ? 'border-primary bg-brand-soft/50 text-brand-hover'
                      : 'border-border text-muted-foreground hover:border-primary/50',
                  )}
                >
                  <input type="radio" value={m} className="sr-only" {...form.register('metodo')} />
                  <Icono aria-hidden className="size-5" strokeWidth={1.75} />
                  {ETIQUETA_METODO[m]}
                </label>
              ))}
            </div>
          </fieldset>
          {errors.root && (
            <p role="alert" className="rounded-xl bg-danger-soft px-4 py-3 text-sm text-red-700">
              {errors.root.message}
            </p>
          )}
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="secondary">
                Cancelar
              </Button>
            </DialogClose>
            <Button type="submit" disabled={registrar.isPending}>
              <Download />
              {registrar.isPending ? 'Guardando…' : 'Cobrar y descargar recibo'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
