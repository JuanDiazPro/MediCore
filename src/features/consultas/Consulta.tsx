import { useState } from 'react'
import { Controller, useFieldArray, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Activity,
  ArrowLeft,
  CheckCircle2,
  ClipboardList,
  Download,
  FileText,
  HeartPulse,
  Pill,
  Plus,
  ShieldAlert,
  Stethoscope,
  Trash2,
} from 'lucide-react'
import { Link, useParams } from 'react-router'

import { Avatar } from '@/components/layout/Avatar'
import { Cargando, ErrorCarga, Vacio } from '@/components/layout/Estados'
import { IconCircle } from '@/components/layout/IconCircle'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Campo, Textarea } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { toast } from '@/components/ui/toast'
import { useCita } from '@/features/agenda/useCitas'
import { PERMISOS } from '@/features/auth/permisos'
import { useUsuario } from '@/features/auth/sesion'
import { SinPermiso } from '@/features/auth/SinPermiso'
import { BuscadorCie10 } from '@/features/consultas/BuscadorCie10'
import {
  esquemaConsulta,
  type DatosConsulta,
  type DatosConsultaEntrada,
} from '@/features/consultas/schemas'
import { useConsultaDeCita, useRegistrarConsulta } from '@/features/consultas/useConsultas'
import { useDescargarReceta } from '@/features/consultas/useDescargarReceta'
import { usePaciente } from '@/features/pacientes/usePacientes'
import { PlanFormulario } from '@/features/seguimiento/PlanFormulario'
import { useMedicos, useServicios } from '@/hooks/useCatalogos'
import { edad, fechaLarga, hora } from '@/lib/formato'
import type { Consulta as TConsulta } from '@/types'

const SIGNOS: {
  campo: keyof DatosConsulta['signos']
  etiqueta: string
  unidad: string
  paso?: string
}[] = [
  { campo: 'presionSistolica', etiqueta: 'Presión sistólica', unidad: 'mmHg' },
  { campo: 'presionDiastolica', etiqueta: 'Presión diastólica', unidad: 'mmHg' },
  { campo: 'frecuenciaCardiaca', etiqueta: 'Frecuencia cardiaca', unidad: 'lpm' },
  { campo: 'temperatura', etiqueta: 'Temperatura', unidad: '°C', paso: '0.1' },
  { campo: 'pesoKg', etiqueta: 'Peso', unidad: 'kg', paso: '0.1' },
  { campo: 'tallaCm', etiqueta: 'Talla', unidad: 'cm' },
]

function Seccion({
  icono,
  titulo,
  descripcion,
  children,
}: {
  icono: typeof Activity
  titulo: string
  descripcion?: string
  children: React.ReactNode
}) {
  return (
    <Card>
      <CardHeader className="flex-row items-center gap-4">
        <IconCircle icon={icono} className="size-11" />
        <div>
          <CardTitle>{titulo}</CardTitle>
          {descripcion && <CardDescription>{descripcion}</CardDescription>}
        </div>
      </CardHeader>
      {children}
    </Card>
  )
}

export function Consulta() {
  const { citaId } = useParams()
  const usuario = useUsuario()
  const cita = useCita(citaId)
  const previa = useConsultaDeCita(citaId)
  const paciente = usePaciente(cita.data?.pacienteId)
  const { porId: medicos } = useMedicos()
  const { porId: servicios } = useServicios()
  const registrar = useRegistrarConsulta()
  const descargarReceta = useDescargarReceta()
  const [cerrada, setCerrada] = useState<TConsulta | null>(null)
  const [plan, setPlan] = useState(false)

  const form = useForm<DatosConsultaEntrada, unknown, DatosConsulta>({
    resolver: zodResolver(esquemaConsulta),
    defaultValues: {
      signos: {},
      subjetivo: '',
      objetivo: '',
      analisis: '',
      plan: '',
      diagnosticos: [],
      medicamentos: [],
      indicaciones: '',
    },
  })
  const { errors } = form.formState
  const meds = useFieldArray({ control: form.control, name: 'medicamentos' })

  if (!PERMISOS.atenderConsulta(usuario.rol)) return <SinPermiso />
  if (cita.isPending || (cita.data && paciente.isPending)) return <Cargando filas={8} />
  if (cita.isError) return <ErrorCarga error={cita.error} />
  if (paciente.isError) return <ErrorCarga error={paciente.error} />
  const p = paciente.data!
  const c = cita.data
  if (usuario.rol === 'medico' && c.medicoId !== usuario.medicoId) return <SinPermiso />
  const medico = medicos.get(c.medicoId)
  const consultaHecha = cerrada ?? previa.data

  if (consultaHecha) {
    return (
      <Card className="mx-auto max-w-2xl items-center text-center">
        <IconCircle
          icon={CheckCircle2}
          className="size-16 bg-success-soft text-green-600 [&>svg]:size-8"
        />
        <div>
          <h1 className="text-2xl">Consulta cerrada</h1>
          <p className="text-muted-foreground">
            {p.nombre} {p.apellidos} · la cita quedó como "Asistió".
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-2">
          {consultaHecha.diagnosticos.map((d) => (
            <Badge key={d.codigo}>
              {d.codigo} {d.descripcion}
            </Badge>
          ))}
        </div>
        <div className="flex w-full flex-col gap-3 sm:flex-row sm:justify-center">
          {consultaHecha.receta && (
            <Button onClick={() => descargarReceta(consultaHecha, p)}>
              <Download />
              Descargar receta PDF
            </Button>
          )}
          <Button variant="secondary" onClick={() => setPlan(true)}>
            <HeartPulse />
            Crear plan de seguimiento
          </Button>
          <Button asChild variant="ghost">
            <Link to={`/pacientes/${p.id}?tab=expediente`}>
              <FileText />
              Ver expediente
            </Link>
          </Button>
        </div>
        <PlanFormulario
          abierto={plan}
          alCambiar={setPlan}
          pacienteId={p.id}
          medicoId={c.medicoId}
          motivoSugerido={
            consultaHecha.diagnosticos[0]
              ? `Control: ${consultaHecha.diagnosticos[0].descripcion}`
              : undefined
          }
        />
      </Card>
    )
  }

  if (c.estado === 'cancelada') {
    return (
      <Card>
        <Vacio
          icono={Stethoscope}
          titulo="Esta cita está cancelada"
          descripcion="Reactívala desde la agenda para atenderla."
        />
      </Card>
    )
  }

  const enviar = form.handleSubmit(
    (d) =>
      registrar.mutate(
        {
          citaId: c.id,
          subjetivo: d.subjetivo,
          objetivo: d.objetivo,
          analisis: d.analisis,
          plan: d.plan,
          signos: d.signos,
          diagnosticos: d.diagnosticos,
          receta: d.medicamentos.length
            ? { medicamentos: d.medicamentos, indicaciones: d.indicaciones }
            : undefined,
        },
        {
          onSuccess: (consulta) => {
            setCerrada(consulta)
            toast.exito('Consulta registrada', 'La cita pasó a "Asistió".')
            window.scrollTo({ top: 0, behavior: 'smooth' })
          },
          onError: (e) => toast.error('No se pudo cerrar la consulta', e.message),
        },
      ),
    () => toast.error('Revisa los campos marcados'),
  )

  return (
    <form noValidate onSubmit={enviar} className="flex flex-col gap-6">
      <Button asChild variant="ghost" size="sm" className="-mb-2 -ml-3 w-fit">
        <Link to="/agenda">
          <ArrowLeft />
          Agenda
        </Link>
      </Button>

      <Card className="sm:flex-row sm:items-center">
        <Avatar nombre={`${p.nombre} ${p.apellidos}`} className="size-14 text-lg" />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-brand-hover">Consulta en curso</p>
          <h1 className="text-2xl">
            {p.nombre} {p.apellidos}
          </h1>
          <p className="text-muted-foreground first-letter:uppercase">
            {edad(p.fechaNacimiento)} años · {fechaLarga(c.inicio)}, {hora(c.inicio)} ·{' '}
            {servicios.get(c.servicioId)?.nombre} · {medico?.nombre}
          </p>
        </div>
        {p.alergias.length > 0 && (
          <div className="flex items-center gap-2 rounded-xl bg-danger-soft px-4 py-3 text-sm font-semibold text-red-700">
            <ShieldAlert aria-hidden className="size-5" />
            Alergias: {p.alergias.join(', ')}
          </div>
        )}
      </Card>

      <Seccion
        icono={Activity}
        titulo="Signos vitales"
        descripcion="Opcionales; se validan rangos."
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {SIGNOS.map((s) => (
            <Campo
              key={s.campo}
              etiqueta={`${s.etiqueta} (${s.unidad})`}
              htmlFor={`s-${s.campo}`}
              error={errors.signos?.[s.campo]?.message}
            >
              <Input
                id={`s-${s.campo}`}
                type="number"
                inputMode="decimal"
                step={s.paso ?? '1'}
                aria-invalid={!!errors.signos?.[s.campo]}
                {...form.register(`signos.${s.campo}`)}
              />
            </Campo>
          ))}
        </div>
      </Seccion>

      <Seccion icono={ClipboardList} titulo="Nota de evolución (SOAP)">
        <div className="grid gap-4 md:grid-cols-2">
          <Campo etiqueta="S · Subjetivo" htmlFor="soap-s" error={errors.subjetivo?.message}>
            <Textarea
              id="soap-s"
              placeholder="Lo que refiere el paciente…"
              aria-invalid={!!errors.subjetivo}
              {...form.register('subjetivo')}
            />
          </Campo>
          <Campo etiqueta="O · Objetivo" htmlFor="soap-o" error={errors.objetivo?.message}>
            <Textarea
              id="soap-o"
              placeholder="Exploración física y hallazgos…"
              aria-invalid={!!errors.objetivo}
              {...form.register('objetivo')}
            />
          </Campo>
          <Campo etiqueta="A · Análisis" htmlFor="soap-a" error={errors.analisis?.message}>
            <Textarea
              id="soap-a"
              placeholder="Impresión diagnóstica…"
              aria-invalid={!!errors.analisis}
              {...form.register('analisis')}
            />
          </Campo>
          <Campo etiqueta="P · Plan" htmlFor="soap-p" error={errors.plan?.message}>
            <Textarea
              id="soap-p"
              placeholder="Tratamiento, estudios, próxima cita…"
              aria-invalid={!!errors.plan}
              {...form.register('plan')}
            />
          </Campo>
        </div>
      </Seccion>

      <Seccion icono={Stethoscope} titulo="Diagnósticos (CIE-10)">
        <Controller
          control={form.control}
          name="diagnosticos"
          render={({ field }) => (
            <BuscadorCie10
              valor={field.value}
              alCambiar={field.onChange}
              invalido={!!errors.diagnosticos}
            />
          )}
        />
        {errors.diagnosticos && (
          <p role="alert" className="text-xs font-medium text-red-600">
            {errors.diagnosticos.message}
          </p>
        )}
      </Seccion>

      <Seccion
        icono={Pill}
        titulo="Receta"
        descripcion="Opcional. Se genera en PDF con marca DEMO."
      >
        {meds.fields.length === 0 && (
          <p className="text-sm text-muted-foreground">Sin medicamentos.</p>
        )}
        <div className="flex flex-col gap-4">
          {meds.fields.map((f, i) => (
            <div
              key={f.id}
              className="grid items-start gap-3 rounded-2xl bg-muted/70 p-4 sm:grid-cols-[2fr_1fr_1fr_1fr_auto]"
            >
              {(['nombre', 'dosis', 'frecuencia', 'duracion'] as const).map((campo) => (
                <Campo
                  key={campo}
                  etiqueta={
                    {
                      nombre: 'Medicamento',
                      dosis: 'Dosis',
                      frecuencia: 'Frecuencia',
                      duracion: 'Duración',
                    }[campo]
                  }
                  htmlFor={`m-${i}-${campo}`}
                  error={errors.medicamentos?.[i]?.[campo]?.message}
                >
                  <Input
                    id={`m-${i}-${campo}`}
                    aria-invalid={!!errors.medicamentos?.[i]?.[campo]}
                    {...form.register(`medicamentos.${i}.${campo}`)}
                  />
                </Campo>
              ))}
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="self-end text-red-600"
                onClick={() => meds.remove(i)}
                aria-label={`Quitar medicamento ${i + 1}`}
              >
                <Trash2 className="size-5" />
              </Button>
            </div>
          ))}
        </div>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          className="w-fit"
          onClick={() => meds.append({ nombre: '', dosis: '', frecuencia: '', duracion: '' })}
        >
          <Plus />
          Agregar medicamento
        </Button>
        {meds.fields.length > 0 && (
          <Campo etiqueta="Indicaciones" htmlFor="indicaciones">
            <Textarea
              id="indicaciones"
              className="min-h-16"
              placeholder="Tomar con alimentos, reposo, datos de alarma…"
              {...form.register('indicaciones')}
            />
          </Campo>
        )}
      </Seccion>

      <div className="sticky bottom-4 z-10 flex justify-end">
        <Button type="submit" size="lg" disabled={registrar.isPending} className="shadow-lift">
          <CheckCircle2 />
          {registrar.isPending ? 'Guardando…' : 'Cerrar consulta'}
        </Button>
      </div>
    </form>
  )
}
