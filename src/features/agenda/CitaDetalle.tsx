import { useState } from 'react'
import {
  BellRing,
  CalendarClock,
  CheckCircle2,
  FileText,
  Stethoscope,
  UserCheck,
  UserX,
  XCircle,
} from 'lucide-react'
import { Link } from 'react-router'

import { Avatar } from '@/components/layout/Avatar'
import { EstadoBadge, RecordatorioBadge } from '@/components/layout/EstadoBadge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog'
import { toast } from '@/components/ui/toast'
import { CitaFormulario } from '@/features/agenda/CitaFormulario'
import { useCambiarEstadoCita, useCita, useRecordatorioCita } from '@/features/agenda/useCitas'
import { PERMISOS } from '@/features/auth/permisos'
import { useUsuario } from '@/features/auth/sesion'
import { useMedicos, usePacientesIndice, useServicios } from '@/hooks/useCatalogos'
import { puedeCambiarEstado } from '@/lib/agenda'
import { ETIQUETA_ESTADO } from '@/lib/estados'
import { fechaLarga, formatearMoneda, hora } from '@/lib/formato'
import type { EstadoCita } from '@/types'

/** Panel lateral con el detalle de la cita y acciones rápidas. */
export function CitaDetalle({ citaId, alCerrar }: { citaId: string | null; alCerrar: () => void }) {
  const usuario = useUsuario()
  const { data: cita } = useCita(citaId ?? undefined)
  const { porId: pacientes } = usePacientesIndice()
  const { porId: medicos } = useMedicos()
  const { porId: servicios } = useServicios()
  const cambiar = useCambiarEstadoCita()
  const recordar = useRecordatorioCita()
  const [reprogramar, setReprogramar] = useState(false)

  const paciente = cita && pacientes.get(cita.pacienteId)
  const medico = cita && medicos.get(cita.medicoId)
  const servicio = cita && servicios.get(cita.servicioId)

  const aEstado = (estado: EstadoCita) =>
    cita &&
    cambiar.mutate(
      { id: cita.id, estado },
      {
        onSuccess: () => toast.exito(`Cita marcada como "${ETIQUETA_ESTADO[estado]}"`),
        onError: (e) => toast.error('No se pudo cambiar el estado', e.message),
      },
    )

  const puede = (e: EstadoCita) => !!cita && cita.estado !== e && puedeCambiarEstado(cita.estado, e)
  const activa = cita && (cita.estado === 'pendiente' || cita.estado === 'confirmada')

  return (
    <>
      <Dialog open={!!citaId && !reprogramar} onOpenChange={(v) => !v && alCerrar()}>
        <DialogContent lado="derecha" aria-describedby="detalle-cita-desc">
          <DialogTitle>Detalle de la cita</DialogTitle>
          <DialogDescription id="detalle-cita-desc" className="-mt-3">
            Acciones rápidas para recepción y médicos.
          </DialogDescription>
          {!cita || !paciente ? (
            <p className="text-muted-foreground">Cargando…</p>
          ) : (
            <>
              <div className="flex items-center gap-3 rounded-2xl bg-muted p-4">
                <Avatar nombre={`${paciente.nombre} ${paciente.apellidos}`} className="bg-white" />
                <div className="min-w-0">
                  <Link
                    to={`/pacientes/${paciente.id}`}
                    className="font-semibold text-navy hover:text-brand-hover"
                  >
                    {paciente.nombre} {paciente.apellidos}
                  </Link>
                  <p className="text-sm text-muted-foreground">{paciente.telefono}</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <EstadoBadge estado={cita.estado} />
                {cita.recordatorioEnviado && <RecordatorioBadge />}
              </div>

              <dl className="grid gap-3 text-sm">
                <div className="flex items-start gap-3">
                  <CalendarClock aria-hidden className="mt-0.5 size-4 text-brand" />
                  <div>
                    <dt className="sr-only">Fecha</dt>
                    <dd className="font-semibold text-navy first-letter:uppercase">
                      {fechaLarga(cita.inicio)}
                    </dd>
                    <dd className="text-muted-foreground">
                      {hora(cita.inicio)} a {hora(cita.fin)}
                    </dd>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Stethoscope aria-hidden className="mt-0.5 size-4 text-brand" />
                  <div>
                    <dt className="sr-only">Médico y servicio</dt>
                    <dd className="flex items-center gap-2 font-semibold text-navy">
                      <span
                        aria-hidden
                        className="size-2 rounded-full"
                        style={{ background: medico?.color }}
                      />
                      {medico?.nombre}
                    </dd>
                    <dd className="text-muted-foreground">
                      {servicio?.nombre} · {servicio && formatearMoneda(servicio.precio)}
                    </dd>
                  </div>
                </div>
                {cita.notas && (
                  <p className="rounded-xl bg-muted px-4 py-3 text-navy">{cita.notas}</p>
                )}
              </dl>

              <div className="grid gap-2 sm:grid-cols-2">
                {puede('confirmada') && (
                  <Button onClick={() => aEstado('confirmada')} disabled={cambiar.isPending}>
                    <CheckCircle2 />
                    Confirmar
                  </Button>
                )}
                {puede('asistio') && (
                  <Button
                    variant="secondary"
                    onClick={() => aEstado('asistio')}
                    disabled={cambiar.isPending}
                  >
                    <UserCheck />
                    Asistió
                  </Button>
                )}
                {puede('no_asistio') && (
                  <Button
                    variant="secondary"
                    onClick={() => aEstado('no_asistio')}
                    disabled={cambiar.isPending}
                  >
                    <UserX />
                    No asistió
                  </Button>
                )}
                {activa && (
                  <Button variant="secondary" onClick={() => setReprogramar(true)}>
                    <CalendarClock />
                    Reprogramar
                  </Button>
                )}
                {activa && !cita.recordatorioEnviado && (
                  <Button
                    variant="secondary"
                    disabled={recordar.isPending}
                    onClick={() =>
                      recordar.mutate(cita.id, {
                        onSuccess: () =>
                          toast.mensaje(
                            `WhatsApp enviado a ${paciente.nombre} (simulado)`,
                            `Le recordamos su cita el ${fechaLarga(cita.inicio)} a las ${hora(cita.inicio)}.`,
                          ),
                      })
                    }
                  >
                    <BellRing />
                    Enviar recordatorio
                  </Button>
                )}
                {cita.estado === 'cancelada' ? (
                  <Button variant="secondary" onClick={() => aEstado('pendiente')}>
                    Reactivar
                  </Button>
                ) : (
                  puede('cancelada') && (
                    <Button
                      variant="ghost"
                      className="text-red-600"
                      onClick={() => aEstado('cancelada')}
                    >
                      <XCircle />
                      Cancelar cita
                    </Button>
                  )
                )}
              </div>

              <div className="mt-auto flex flex-col gap-2 border-t border-border pt-5">
                {PERMISOS.atenderConsulta(usuario.rol) && activa && (
                  <Button asChild size="lg">
                    <Link to={`/consulta/${cita.id}`}>
                      <Stethoscope />
                      Atender consulta
                    </Link>
                  </Button>
                )}
                <Button asChild variant="secondary">
                  <Link to={`/pacientes/${paciente.id}?tab=expediente`}>
                    <FileText />
                    Ir al expediente
                  </Link>
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
      {cita && (
        <CitaFormulario
          abierto={reprogramar}
          alCambiar={(v) => {
            setReprogramar(v)
          }}
          cita={cita}
        />
      )}
    </>
  )
}
