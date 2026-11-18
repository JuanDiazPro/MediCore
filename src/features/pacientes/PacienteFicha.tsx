import { useState, type ReactNode } from 'react'
import {
  ArrowLeft,
  CalendarClock,
  CalendarPlus,
  Droplet,
  FileText,
  HeartPulse,
  Mail,
  Pencil,
  Phone,
  ShieldAlert,
  Stethoscope,
  UserRound,
  Wallet,
} from 'lucide-react'
import { Link, useParams, useSearchParams } from 'react-router'

import { Avatar } from '@/components/layout/Avatar'
import { Cargando, ErrorCarga, Vacio } from '@/components/layout/Estados'
import { EstadoBadge } from '@/components/layout/EstadoBadge'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useCitas } from '@/features/agenda/useCitas'
import { PERMISOS } from '@/features/auth/permisos'
import { useUsuario } from '@/features/auth/sesion'
import { SinPermiso } from '@/features/auth/SinPermiso'
import { PacienteFormulario } from '@/features/pacientes/PacienteFormulario'
import { usePaciente } from '@/features/pacientes/usePacientes'
import { useMedicos, useServicios } from '@/hooks/useCatalogos'
import { edad, fechaCorta, fechaHora } from '@/lib/formato'
import { Proximamente } from '@/app/pages/Proximamente'

function Dato({
  icono: Icono,
  etiqueta,
  children,
}: {
  icono: typeof Phone
  etiqueta: string
  children: ReactNode
}) {
  return (
    <div className="flex items-start gap-3">
      <Icono aria-hidden className="mt-0.5 size-4 shrink-0 text-brand" strokeWidth={1.75} />
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{etiqueta}</p>
        <p className="break-words text-navy">{children}</p>
      </div>
    </div>
  )
}

function ProximasCitas({ pacienteId }: { pacienteId: string }) {
  const [desde] = useState(() => new Date().toISOString())
  const citas = useCitas({ pacienteId, desde, estados: ['pendiente', 'confirmada'] })
  const { porId: medicos } = useMedicos()
  const { porId: servicios } = useServicios()
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle>Próximas citas</CardTitle>
        <Button asChild size="sm" variant="secondary">
          <Link to={`/agenda?paciente=${pacienteId}`}>
            <CalendarPlus />
            Agendar
          </Link>
        </Button>
      </CardHeader>
      {citas.isPending ? (
        <Cargando filas={2} />
      ) : citas.isError ? (
        <ErrorCarga error={citas.error} reintentar={() => citas.refetch()} />
      ) : citas.data.length === 0 ? (
        <Vacio icono={CalendarClock} titulo="Sin citas próximas" />
      ) : (
        <ul className="divide-y divide-border">
          {citas.data.map((c) => (
            <li key={c.id} className="flex flex-wrap items-center justify-between gap-2 py-3">
              <div>
                <p className="font-semibold text-navy">{fechaHora(c.inicio)}</p>
                <p className="text-sm text-muted-foreground">
                  {servicios.get(c.servicioId)?.nombre} · {medicos.get(c.medicoId)?.nombre}
                </p>
              </div>
              <EstadoBadge estado={c.estado} />
            </li>
          ))}
        </ul>
      )}
    </Card>
  )
}

export function PacienteFicha({
  expediente,
  pagos,
  seguimiento,
}: {
  expediente?: (pacienteId: string) => ReactNode
  pagos?: (pacienteId: string) => ReactNode
  seguimiento?: (pacienteId: string) => ReactNode
}) {
  const { id } = useParams()
  const [params, setParams] = useSearchParams()
  const pestana = params.get('tab') ?? 'datos'
  const usuario = useUsuario()
  const consulta = usePaciente(id)
  const { porId: medicos } = useMedicos()
  const [editar, setEditar] = useState(false)

  if (consulta.isPending) return <Cargando filas={6} />
  if (consulta.isError)
    return <ErrorCarga error={consulta.error} reintentar={() => consulta.refetch()} />
  const p = consulta.data
  if (usuario.rol === 'medico' && p.medicoId !== usuario.medicoId) return <SinPermiso />
  const medico = medicos.get(p.medicoId)
  const nombre = `${p.nombre} ${p.apellidos}`

  return (
    <>
      <Button asChild variant="ghost" size="sm" className="mb-4 -ml-3">
        <Link to="/pacientes">
          <ArrowLeft />
          Pacientes
        </Link>
      </Button>

      <Card className="mb-6 sm:flex-row sm:items-center">
        <Avatar nombre={nombre} className="size-16 text-xl" />
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl sm:text-3xl">{nombre}</h1>
          <p className="text-muted-foreground">
            {edad(p.fechaNacimiento)} años · {p.sexo === 'F' ? 'Femenino' : 'Masculino'} · Paciente
            desde {fechaCorta(p.creadoEn)}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Badge variant="neutral">
              <Droplet aria-hidden />
              {p.tipoSangre}
            </Badge>
            {p.alergias.length === 0 ? (
              <Badge variant="neutral">Sin alergias conocidas</Badge>
            ) : (
              p.alergias.map((a) => (
                <Badge key={a} variant="no_asistio">
                  Alergia: {a}
                </Badge>
              ))
            )}
          </div>
        </div>
        {PERMISOS.editarPacientes(usuario.rol) && (
          <Button variant="secondary" onClick={() => setEditar(true)}>
            <Pencil />
            Editar
          </Button>
        )}
      </Card>

      <Tabs
        value={pestana}
        onValueChange={(v) => setParams(v === 'datos' ? {} : { tab: v }, { replace: true })}
      >
        <TabsList>
          <TabsTrigger value="datos">
            <UserRound />
            Datos generales
          </TabsTrigger>
          <TabsTrigger value="expediente">
            <FileText />
            Expediente
          </TabsTrigger>
          <TabsTrigger value="pagos">
            <Wallet />
            Pagos
          </TabsTrigger>
          <TabsTrigger value="seguimiento">
            <HeartPulse />
            Seguimiento
          </TabsTrigger>
        </TabsList>

        <TabsContent value="datos" className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Contacto y datos clínicos</CardTitle>
            </CardHeader>
            <div className="grid gap-4 sm:grid-cols-2">
              <Dato icono={Phone} etiqueta="Teléfono">
                {p.telefono}
              </Dato>
              <Dato icono={Mail} etiqueta="Correo">
                {p.correo || '—'}
              </Dato>
              <Dato icono={CalendarClock} etiqueta="Fecha de nacimiento">
                {fechaCorta(p.fechaNacimiento)}
              </Dato>
              <Dato icono={Stethoscope} etiqueta="Médico tratante">
                {medico ? `${medico.nombre} (${medico.especialidad})` : '—'}
              </Dato>
              <Dato icono={Droplet} etiqueta="Tipo de sangre">
                {p.tipoSangre}
              </Dato>
              <Dato icono={ShieldAlert} etiqueta="Alergias">
                {p.alergias.join(', ') || 'Ninguna conocida'}
              </Dato>
            </div>
          </Card>
          <ProximasCitas pacienteId={p.id} />
        </TabsContent>
        <TabsContent value="expediente">
          {expediente ? expediente(p.id) : <Proximamente />}
        </TabsContent>
        <TabsContent value="pagos">{pagos ? pagos(p.id) : <Proximamente />}</TabsContent>
        <TabsContent value="seguimiento">
          {seguimiento ? seguimiento(p.id) : <Proximamente />}
        </TabsContent>
      </Tabs>

      <PacienteFormulario abierto={editar} alCambiar={setEditar} paciente={p} />
    </>
  )
}
