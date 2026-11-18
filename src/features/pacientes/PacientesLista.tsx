import { useState } from 'react'
import { ChevronLeft, ChevronRight, Phone, Plus, Search, UserRoundX } from 'lucide-react'
import { Link, useNavigate } from 'react-router'

import { Avatar } from '@/components/layout/Avatar'
import { Cargando, ErrorCarga, Vacio } from '@/components/layout/Estados'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Label, Select } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { PERMISOS } from '@/features/auth/permisos'
import { useUsuario } from '@/features/auth/sesion'
import { PacienteFormulario } from '@/features/pacientes/PacienteFormulario'
import { useListaPacientes } from '@/features/pacientes/usePacientes'
import { useDebounce } from '@/hooks/useDebounce'
import { useMedicos } from '@/hooks/useCatalogos'
import { edad, fechaCorta, haceTiempo } from '@/lib/formato'
import type { FiltroContacto } from '@/services'

const POR_PAGINA = 12

export function PacientesLista() {
  const usuario = useUsuario()
  const navegar = useNavigate()
  const esMedico = usuario.rol === 'medico'
  const [texto, setTexto] = useState('')
  const [medicoId, setMedicoId] = useState('')
  const [contacto, setContacto] = useState<FiltroContacto>('todos')
  const [pagina, setPagina] = useState(1)
  const [nuevo, setNuevo] = useState(false)
  const busqueda = useDebounce(texto)
  const { porId: medicos, data: listaMedicos = [] } = useMedicos()

  const filtro = {
    texto: busqueda,
    medicoId: esMedico ? usuario.medicoId : medicoId || undefined,
    ultimoContacto: contacto,
    pagina,
    porPagina: POR_PAGINA,
  }
  const consulta = useListaPacientes(filtro)
  const total = consulta.data?.total ?? 0
  const paginas = Math.max(1, Math.ceil(total / POR_PAGINA))

  const cambiar =
    <T,>(set: (v: T) => void) =>
    (v: T) => {
      set(v)
      setPagina(1)
    }

  return (
    <>
      <PageHeader
        titulo="Pacientes"
        descripcion={esMedico ? 'Tus pacientes' : 'Padrón de pacientes de la clínica'}
        acciones={
          PERMISOS.editarPacientes(usuario.rol) && (
            <Button onClick={() => setNuevo(true)}>
              <Plus />
              Nuevo paciente
            </Button>
          )
        }
      />

      <Card className="gap-6">
        <div className="grid gap-4 md:grid-cols-[1.4fr_1fr_1fr]">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="buscar">Buscar</Label>
            <div className="relative">
              <Search
                aria-hidden
                className="absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted-foreground"
              />
              <Input
                id="buscar"
                type="search"
                placeholder="Nombre o teléfono"
                className="pl-11"
                value={texto}
                onChange={(e) => cambiar(setTexto)(e.target.value)}
              />
            </div>
          </div>
          {!esMedico && (
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="f-medico">Médico tratante</Label>
              <Select
                id="f-medico"
                value={medicoId}
                onChange={(e) => cambiar(setMedicoId)(e.target.value)}
              >
                <option value="">Todos</option>
                {listaMedicos.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.nombre}
                  </option>
                ))}
              </Select>
            </div>
          )}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="f-contacto">Último contacto</Label>
            <Select
              id="f-contacto"
              value={contacto}
              onChange={(e) => cambiar(setContacto)(e.target.value as FiltroContacto)}
            >
              <option value="todos">Cualquier fecha</option>
              <option value="30">Últimos 30 días</option>
              <option value="90">Últimos 90 días</option>
              <option value="mas90">Hace más de 90 días</option>
              <option value="nunca">Sin visitas</option>
            </Select>
          </div>
        </div>

        {consulta.isPending ? (
          <Cargando filas={6} />
        ) : consulta.isError ? (
          <ErrorCarga error={consulta.error} reintentar={() => consulta.refetch()} />
        ) : consulta.data.datos.length === 0 ? (
          <Vacio
            icono={UserRoundX}
            titulo="Sin resultados"
            descripcion="Prueba con otro nombre, teléfono o filtro."
          />
        ) : (
          <>
            {/* Tabla (tableta y computadora) */}
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-muted-foreground">
                    <th scope="col" className="pb-3 font-medium">
                      Paciente
                    </th>
                    <th scope="col" className="pb-3 font-medium">
                      Teléfono
                    </th>
                    <th scope="col" className="pb-3 font-medium">
                      Médico tratante
                    </th>
                    <th scope="col" className="pb-3 font-medium">
                      Último contacto
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {consulta.data.datos.map((p) => {
                    const medico = medicos.get(p.medicoId)
                    return (
                      <tr
                        key={p.id}
                        className="cursor-pointer transition-colors hover:bg-muted/60"
                        onClick={() => navegar(`/pacientes/${p.id}`)}
                      >
                        <td className="py-3 pr-4">
                          <div className="flex items-center gap-3">
                            <Avatar nombre={`${p.nombre} ${p.apellidos}`} />
                            <div className="min-w-0">
                              <Link
                                to={`/pacientes/${p.id}`}
                                className="font-semibold text-navy hover:text-brand-hover"
                                onClick={(e) => e.stopPropagation()}
                              >
                                {p.nombre} {p.apellidos}
                              </Link>
                              <p className="text-xs text-muted-foreground">
                                {edad(p.fechaNacimiento)} años ·{' '}
                                {p.sexo === 'F' ? 'Femenino' : 'Masculino'}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 pr-4 whitespace-nowrap text-navy">{p.telefono}</td>
                        <td className="py-3 pr-4">
                          <span className="inline-flex items-center gap-2 text-navy">
                            <span
                              aria-hidden
                              className="size-2 rounded-full"
                              style={{ background: medico?.color }}
                            />
                            {medico?.nombre ?? '—'}
                          </span>
                        </td>
                        <td className="py-3 whitespace-nowrap text-muted-foreground">
                          {p.ultimoContacto ? (
                            <span title={fechaCorta(p.ultimoContacto)}>
                              {haceTiempo(p.ultimoContacto)}
                            </span>
                          ) : (
                            'Sin visitas'
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* Tarjetas (celular) */}
            <ul className="flex flex-col divide-y divide-border md:hidden">
              {consulta.data.datos.map((p) => (
                <li key={p.id}>
                  <Link to={`/pacientes/${p.id}`} className="flex items-center gap-3 py-3">
                    <Avatar nombre={`${p.nombre} ${p.apellidos}`} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold text-navy">
                        {p.nombre} {p.apellidos}
                      </p>
                      <p className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Phone aria-hidden className="size-3" />
                        {p.telefono}
                      </p>
                    </div>
                    <ChevronRight aria-hidden className="size-4 text-muted-foreground" />
                  </Link>
                </li>
              ))}
            </ul>

            <div className="flex flex-col items-center justify-between gap-3 text-sm sm:flex-row">
              <p className="text-muted-foreground">
                {total} paciente{total === 1 ? '' : 's'} · página {pagina} de {paginas}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={pagina <= 1}
                  onClick={() => setPagina((p) => p - 1)}
                >
                  <ChevronLeft />
                  Anterior
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={pagina >= paginas}
                  onClick={() => setPagina((p) => p + 1)}
                >
                  Siguiente
                  <ChevronRight />
                </Button>
              </div>
            </div>
          </>
        )}
      </Card>

      <PacienteFormulario
        abierto={nuevo}
        alCambiar={setNuevo}
        alGuardar={(p) => navegar(`/pacientes/${p.id}`)}
      />
    </>
  )
}
