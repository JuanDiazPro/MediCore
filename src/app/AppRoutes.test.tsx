import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { useSesion } from '@/features/auth/sesion'
import { generarBaseDatos } from '@/mocks/generador'
import { establecerBD } from '@/services/db'
import { configurarLatencia } from '@/services/latencia'
import { renderApp } from '@/test/utils'

const DEMO = 'Versión demostrativa: datos ficticios'

beforeAll(() => {
  configurarLatencia(0)
  establecerBD(generarBaseDatos({ hoy: new Date(2026, 10, 17), pacientes: 30 }))
})
beforeEach(() => useSesion.setState({ usuario: null }))

describe('rutas', () => {
  it('muestra la bienvenida con la franja de demo', () => {
    renderApp('/')
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/gestión de tu clínica/i)
    expect(screen.getByText(DEMO)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /entrar al demo/i })).toHaveAttribute('href', '/login')
  })

  it('muestra "no encontrado" en rutas desconocidas, también con la franja de demo', () => {
    renderApp('/ruta-que-no-existe')
    expect(screen.getByRole('heading', { name: /página no encontrada/i })).toBeInTheDocument()
    expect(screen.getByText(DEMO)).toBeInTheDocument()
  })

  it('las rutas internas piden iniciar sesión', () => {
    renderApp('/agenda')
    expect(screen.getByRole('heading', { name: /iniciar sesión/i })).toBeInTheDocument()
  })

  it('el acceso rápido entra con el rol y el menú cambia según el rol', async () => {
    const usuario = userEvent.setup()
    renderApp('/login')
    await usuario.click(screen.getByRole('button', { name: /recepción/i }))
    const menu = await screen.findAllByRole('navigation', { name: /menú principal/i })
    const enlaces = within(menu[0])
      .getAllByRole('link')
      .map((a) => a.textContent)
    expect(enlaces).toContain('Caja')
    expect(enlaces).not.toContain('Reportes')
    expect(screen.getByText(DEMO)).toBeInTheDocument()
  })

  it('un rol sin permiso ve el aviso correspondiente', async () => {
    const bd = generarBaseDatos({ hoy: new Date(2026, 10, 17), pacientes: 30 })
    useSesion.getState().iniciar(bd.usuarios[1])
    renderApp('/caja')
    expect(await screen.findByText(/no tiene acceso/i)).toBeInTheDocument()
  })
})
