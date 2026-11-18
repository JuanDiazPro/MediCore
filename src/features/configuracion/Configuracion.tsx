import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Building2, Clock, Pencil, Plus, Save, Stethoscope, Tags } from 'lucide-react'
import { z } from 'zod'

import { Cargando, ErrorCarga } from '@/components/layout/Estados'
import { PageHeader } from '@/components/layout/PageHeader'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Campo } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from '@/components/ui/toast'
import { DIAS } from '@/features/configuracion/horario'
import { HorarioEditor } from '@/features/configuracion/HorarioEditor'
import { useActualizarClinica, useGuardarServicio } from '@/features/configuracion/useConfiguracion'
import { useClinica, useMedicos, useServicios } from '@/hooks/useCatalogos'
import { formatearMoneda } from '@/lib/formato'
import type { Medico, Servicio } from '@/types'

const esquemaClinica = z.object({
  nombre: z.string().trim().min(3, 'Escribe el nombre de la clínica.'),
  direccion: z.string().trim().min(5, 'Escribe la dirección.'),
  telefono: z
    .string()
    .trim()
    .regex(/^[\d\s-]{10,14}$/, 'Teléfono de 10 dígitos.'),
  correo: z.email('Correo no válido.'),
})
type DatosClinica = z.infer<typeof esquemaClinica>

function DatosClinica() {
  const clinica = useClinica()
  const actualizar = useActualizarClinica()
  const form = useForm<DatosClinica>({ resolver: zodResolver(esquemaClinica) })
  const { errors, isDirty } = form.formState

  useEffect(() => {
    if (clinica.data) form.reset(clinica.data)
  }, [clinica.data, form])

  if (clinica.isPending) return <Cargando />
  if (clinica.isError) return <ErrorCarga error={clinica.error} />

  return (
    <Card>
      <CardHeader>
        <CardTitle>Datos de la clínica</CardTitle>
        <CardDescription>Aparecen en recetas, recibos y mensajes.</CardDescription>
      </CardHeader>
      <form
        noValidate
        className="grid gap-4 sm:grid-cols-2"
        onSubmit={form.handleSubmit((d) =>
          actualizar.mutate(d, {
            onSuccess: (c) => {
              toast.exito('Datos guardados')
              form.reset(c)
            },
          }),
        )}
      >
        <Campo etiqueta="Nombre" htmlFor="cl-nombre" error={errors.nombre?.message}>
          <Input id="cl-nombre" aria-invalid={!!errors.nombre} {...form.register('nombre')} />
        </Campo>
        <Campo etiqueta="Teléfono" htmlFor="cl-tel" error={errors.telefono?.message}>
          <Input id="cl-tel" aria-invalid={!!errors.telefono} {...form.register('telefono')} />
        </Campo>
        <Campo
          etiqueta="Dirección"
          htmlFor="cl-dir"
          error={errors.direccion?.message}
          className="sm:col-span-2"
        >
          <Input id="cl-dir" aria-invalid={!!errors.direccion} {...form.register('direccion')} />
        </Campo>
        <Campo etiqueta="Correo" htmlFor="cl-correo" error={errors.correo?.message}>
          <Input
            id="cl-correo"
            type="email"
            aria-invalid={!!errors.correo}
            {...form.register('correo')}
          />
        </Campo>
        <div className="flex items-end">
          <Button type="submit" disabled={!isDirty || actualizar.isPending}>
            <Save />
            Guardar cambios
          </Button>
        </div>
      </form>
    </Card>
  )
}

function Medicos() {
  const medicos = useMedicos()
  const [editar, setEditar] = useState<Medico | null>(null)
  if (medicos.isPending) return <Cargando />
  if (medicos.isError) return <ErrorCarga error={medicos.error} />
  return (
    <Card>
      <CardHeader>
        <CardTitle>Médicos y horarios</CardTitle>
        <CardDescription>
          Cédulas ficticias. El color identifica al médico en la agenda.
        </CardDescription>
      </CardHeader>
      <ul className="divide-y divide-border">
        {medicos.data.map((m) => (
          <li
            key={m.id}
            className="flex flex-col gap-3 py-4 md:flex-row md:items-center md:justify-between"
          >
            <div className="flex items-center gap-3">
              <span
                aria-hidden
                className="size-4 shrink-0 rounded-full"
                style={{ background: m.color }}
              />
              <div>
                <p className="font-semibold text-navy">{m.nombre}</p>
                <p className="text-sm text-muted-foreground">
                  {m.especialidad} · {m.cedula}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {DIAS.filter(({ dia }) => m.horario.some((h) => h.dia === dia)).map(
                ({ dia, nombre }) => {
                  const h = m.horario.find((x) => x.dia === dia)!
                  return (
                    <Badge key={dia} variant="neutral" title={`${nombre} ${h.inicio} a ${h.fin}`}>
                      {nombre.slice(0, 3)} {h.inicio}-{h.fin}
                    </Badge>
                  )
                },
              )}
              <Button size="sm" variant="secondary" onClick={() => setEditar(m)}>
                <Clock />
                Horario
              </Button>
            </div>
          </li>
        ))}
      </ul>
      <HorarioEditor medico={editar} alCerrar={() => setEditar(null)} />
    </Card>
  )
}

const esquemaServicio = z.object({
  nombre: z.string().trim().min(3, 'Escribe el nombre.'),
  duracionMin: z.coerce
    .number<string>()
    .int()
    .min(10, 'Mínimo 10 min.')
    .max(240, 'Máximo 240 min.'),
  precio: z.coerce.number<string>().min(0, 'No puede ser negativo.').max(100000),
  activo: z.boolean(),
})

function ServicioDialogo({
  servicio,
  alCerrar,
}: {
  servicio: Servicio | 'nuevo' | null
  alCerrar: () => void
}) {
  const guardar = useGuardarServicio()
  const form = useForm<z.input<typeof esquemaServicio>, unknown, z.output<typeof esquemaServicio>>({
    resolver: zodResolver(esquemaServicio),
  })
  const { errors } = form.formState
  const existente = servicio && servicio !== 'nuevo' ? servicio : undefined

  useEffect(() => {
    if (!servicio) return
    form.reset({
      nombre: existente?.nombre ?? '',
      duracionMin: String(existente?.duracionMin ?? 30),
      precio: String(existente?.precio ?? 500),
      activo: existente?.activo ?? true,
    })
  }, [servicio, existente, form])

  return (
    <Dialog open={!!servicio} onOpenChange={(v) => !v && alCerrar()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{existente ? 'Editar servicio' : 'Nuevo servicio'}</DialogTitle>
        </DialogHeader>
        <form
          noValidate
          className="grid gap-4 sm:grid-cols-2"
          onSubmit={form.handleSubmit((d) =>
            guardar.mutate(
              { id: existente?.id, datos: d },
              {
                onSuccess: () => {
                  toast.exito('Servicio guardado', d.nombre)
                  alCerrar()
                },
              },
            ),
          )}
        >
          <Campo
            etiqueta="Nombre"
            htmlFor="sv-nombre"
            error={errors.nombre?.message}
            className="sm:col-span-2"
          >
            <Input id="sv-nombre" aria-invalid={!!errors.nombre} {...form.register('nombre')} />
          </Campo>
          <Campo etiqueta="Duración (min)" htmlFor="sv-dur" error={errors.duracionMin?.message}>
            <Input
              id="sv-dur"
              type="number"
              step={5}
              aria-invalid={!!errors.duracionMin}
              {...form.register('duracionMin')}
            />
          </Campo>
          <Campo etiqueta="Precio (MXN)" htmlFor="sv-precio" error={errors.precio?.message}>
            <Input
              id="sv-precio"
              type="number"
              step={50}
              aria-invalid={!!errors.precio}
              {...form.register('precio')}
            />
          </Campo>
          <label className="flex items-center gap-2 font-medium text-navy sm:col-span-2">
            <input
              type="checkbox"
              className="size-4 accent-[#14B8A6]"
              {...form.register('activo')}
            />
            Disponible para agendar
          </label>
          <DialogFooter className="sm:col-span-2">
            <DialogClose asChild>
              <Button type="button" variant="secondary">
                Cancelar
              </Button>
            </DialogClose>
            <Button type="submit" disabled={guardar.isPending}>
              Guardar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function Servicios() {
  const servicios = useServicios()
  const [editar, setEditar] = useState<Servicio | 'nuevo' | null>(null)
  if (servicios.isPending) return <Cargando />
  if (servicios.isError) return <ErrorCarga error={servicios.error} />
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between gap-3">
        <div>
          <CardTitle>Servicios y precios</CardTitle>
          <CardDescription>La duración define el largo de la cita en la agenda.</CardDescription>
        </div>
        <Button size="sm" onClick={() => setEditar('nuevo')}>
          <Plus />
          Nuevo
        </Button>
      </CardHeader>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[480px] text-sm">
          <thead>
            <tr className="text-left text-xs text-muted-foreground">
              <th scope="col" className="pb-3 font-medium">
                Servicio
              </th>
              <th scope="col" className="pb-3 font-medium">
                Duración
              </th>
              <th scope="col" className="pb-3 text-right font-medium">
                Precio
              </th>
              <th scope="col" className="pb-3 font-medium">
                <span className="sr-only">Acciones</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {servicios.data.map((s) => (
              <tr key={s.id}>
                <td className="py-3 pr-3 text-navy">
                  {s.nombre} {!s.activo && <Badge variant="neutral">Inactivo</Badge>}
                </td>
                <td className="py-3 pr-3 text-muted-foreground">{s.duracionMin} min</td>
                <td className="py-3 pr-3 text-right font-semibold text-navy">
                  {formatearMoneda(s.precio)}
                </td>
                <td className="py-3 text-right">
                  <Button
                    size="icon"
                    variant="ghost"
                    aria-label={`Editar ${s.nombre}`}
                    onClick={() => setEditar(s)}
                  >
                    <Pencil className="size-4" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <ServicioDialogo servicio={editar} alCerrar={() => setEditar(null)} />
    </Card>
  )
}

export function Configuracion() {
  return (
    <>
      <PageHeader
        titulo="Configuración"
        descripcion="Datos de la clínica, médicos, horarios y servicios."
      />
      <Tabs defaultValue="clinica">
        <TabsList>
          <TabsTrigger value="clinica">
            <Building2 />
            Clínica
          </TabsTrigger>
          <TabsTrigger value="medicos">
            <Stethoscope />
            Médicos y horarios
          </TabsTrigger>
          <TabsTrigger value="servicios">
            <Tags />
            Servicios y precios
          </TabsTrigger>
        </TabsList>
        <TabsContent value="clinica">
          <DatosClinica />
        </TabsContent>
        <TabsContent value="medicos">
          <Medicos />
        </TabsContent>
        <TabsContent value="servicios">
          <Servicios />
        </TabsContent>
      </Tabs>
    </>
  )
}
