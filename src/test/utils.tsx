import { render } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { QueryClientProvider } from '@tanstack/react-query'

import { AppRoutes } from '@/app/AppRoutes'
import { crearQueryClient } from '@/app/queryClient'
import { Toaster } from '@/components/ui/toast'

/** Renderiza la app completa en una ruta, con proveedores reales. */
export function renderApp(ruta: string) {
  const client = crearQueryClient()
  client.setDefaultOptions({ queries: { retry: false, staleTime: Infinity } })
  return render(
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={[ruta]}>
        <AppRoutes />
      </MemoryRouter>
      <Toaster />
    </QueryClientProvider>,
  )
}
