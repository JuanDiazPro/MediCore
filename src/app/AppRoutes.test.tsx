import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'

import { AppRoutes } from '@/app/AppRoutes'

function renderEn(ruta: string) {
  return render(
    <MemoryRouter initialEntries={[ruta]}>
      <AppRoutes />
    </MemoryRouter>,
  )
}

describe('AppRoutes', () => {
  it('muestra la bienvenida con la franja de demo', () => {
    renderEn('/')
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/gestión de tu clínica/i)
    expect(screen.getByText('Versión demostrativa: datos ficticios')).toBeInTheDocument()
  })

  it('muestra "no encontrado" en rutas desconocidas, también con la franja de demo', () => {
    renderEn('/ruta-que-no-existe')
    expect(screen.getByRole('heading', { name: /página no encontrada/i })).toBeInTheDocument()
    expect(screen.getByText('Versión demostrativa: datos ficticios')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /volver al inicio/i })).toHaveAttribute('href', '/')
  })
})
