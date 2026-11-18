import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { useSesion } from '@/features/auth/sesion'
import { generarBaseDatos } from '@/mocks/generador'
import { obtenerBD, establecerBD } from '@/services/db'
import { configurarLatencia } from '@/services/latencia'
import { renderApp } from '@/test/utils'

vi.mock('@/lib/pdf', async (original) => ({
  ...(await original<typeof import('@/lib/pdf')>()),
  descargar: vi.fn(),
}))

beforeAll(async () => {
  configurarLatencia(0)
  await import('@/lib/pdf') // precarga jsPDF (en la app se carga bajo demanda)
})

it(
  'recepción cobra una consulta pendiente y el corte se actualiza',
  { timeout: 20000 },
  async () => {
    // Datos generados "hoy" para que existan consultas de hoy por cobrar.
    const bd = generarBaseDatos({ pacientes: 120 })
    establecerBD(bd)
    useSesion.getState().iniciar(bd.usuarios[2])
    const usuario = userEvent.setup()
    renderApp('/caja')

    const botones = await screen.findAllByRole('button', { name: /^cobrar \$/i })
    const pagosAntes = (await obtenerBD()).pagos.length
    await usuario.click(botones[0])
    const dialogo = await screen.findByRole('dialog')
    await usuario.click(within(dialogo).getByText('Tarjeta'))
    await usuario.click(within(dialogo).getByRole('button', { name: /cobrar y descargar/i }))

    await waitFor(async () => expect((await obtenerBD()).pagos.length).toBe(pagosAntes + 1))
    const nuevo = (await obtenerBD()).pagos.at(-1)!
    expect(nuevo.metodo).toBe('tarjeta')
    expect(nuevo.citaId).toBeTruthy()
    const { descargar } = await import('@/lib/pdf')
    await waitFor(
      () =>
        expect(descargar).toHaveBeenCalledWith(expect.anything(), `recibo-DEMO-${nuevo.folio}.pdf`),
      {
        timeout: 8000,
      },
    )
    expect(await screen.findByText(nuevo.folio)).toBeInTheDocument()
  },
)
