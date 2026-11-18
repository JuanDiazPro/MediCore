import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { useSesion } from '@/features/auth/sesion'
import { esquemaPaciente, formatearTelefono } from '@/features/pacientes/schemas'
import { generarBaseDatos } from '@/mocks/generador'
import { establecerBD } from '@/services/db'
import { configurarLatencia } from '@/services/latencia'
import { renderApp } from '@/test/utils'

const bd = generarBaseDatos({ hoy: new Date(2026, 10, 17), pacientes: 30 })

beforeAll(() => configurarLatencia(0))
beforeEach(() => {
  establecerBD(structuredClone(bd))
  useSesion.getState().iniciar(bd.usuarios[0])
})

describe('esquema del paciente', () => {
  const valido = {
    nombre: 'Ana',
    apellidos: 'Demo Prueba',
    fechaNacimiento: '1990-05-10',
    sexo: 'F' as const,
    telefono: '55 1234 5678',
    correo: '',
    tipoSangre: 'O+' as const,
    medicoId: 'med-01',
    alergias: '',
  }

  it('acepta datos válidos', () => {
    expect(esquemaPaciente.safeParse(valido).success).toBe(true)
  })

  it('valida teléfono, correo y fecha de nacimiento', () => {
    const r = esquemaPaciente.safeParse({
      ...valido,
      telefono: '123',
      correo: 'no-es-correo',
      fechaNacimiento: '2999-01-01',
    })
    expect(r.success).toBe(false)
    const campos = r.error!.issues.map((i) => i.path[0])
    expect(campos).toEqual(expect.arrayContaining(['telefono', 'correo', 'fechaNacimiento']))
  })

  it('normaliza el teléfono', () => {
    expect(formatearTelefono('5512345678')).toBe('55 1234 5678')
  })
})

describe('pantalla de pacientes', () => {
  it('busca por nombre', async () => {
    const usuario = userEvent.setup()
    renderApp('/pacientes')
    const objetivo = [...bd.pacientes].sort((a, b) =>
      a.apellidos.localeCompare(b.apellidos, 'es'),
    )[5]
    await screen.findAllByText(/página 1 de/i)
    await usuario.type(screen.getByLabelText('Buscar'), objetivo.apellidos)
    await waitFor(() =>
      expect(
        screen.getAllByText(`${objetivo.nombre} ${objetivo.apellidos}`).length,
      ).toBeGreaterThan(0),
    )
    expect(await screen.findByText(/página 1 de 1$/)).toBeInTheDocument()
  })

  it('el formulario muestra errores y registra un paciente nuevo', async () => {
    const usuario = userEvent.setup()
    renderApp('/pacientes')
    await usuario.click(await screen.findByRole('button', { name: /nuevo paciente/i }))
    const dialogo = await screen.findByRole('dialog')
    await usuario.click(within(dialogo).getByRole('button', { name: /guardar paciente/i }))
    expect(await within(dialogo).findByText('Escribe el nombre.')).toBeInTheDocument()

    await usuario.type(within(dialogo).getByLabelText('Nombre(s)'), 'Lucía')
    await usuario.type(within(dialogo).getByLabelText('Apellidos'), 'Prueba Demo')
    await usuario.type(within(dialogo).getByLabelText('Fecha de nacimiento'), '1988-03-14')
    await usuario.selectOptions(within(dialogo).getByLabelText('Sexo'), 'F')
    await usuario.type(within(dialogo).getByLabelText('Teléfono'), '5511112222')
    await usuario.selectOptions(within(dialogo).getByLabelText('Médico tratante'), 'med-01')
    await usuario.click(within(dialogo).getByRole('button', { name: /guardar paciente/i }))

    expect(await screen.findByRole('heading', { name: 'Lucía Prueba Demo' })).toBeInTheDocument()
    expect(screen.getByText('55 1111 2222')).toBeInTheDocument()
  })

  it('el médico solo ve a sus pacientes', async () => {
    useSesion.getState().iniciar(bd.usuarios[1])
    renderApp('/pacientes')
    const propios = bd.pacientes.filter((p) => p.medicoId === 'med-01').length
    expect(await screen.findByText(new RegExp(`^${propios} paciente`))).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /nuevo paciente/i })).not.toBeInTheDocument()
  })
})
