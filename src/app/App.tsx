import { HashRouter } from 'react-router'

import { AppRoutes } from '@/app/AppRoutes'
import { Providers } from '@/app/Providers'

/** HashRouter evita errores 404 al recargar en GitHub Pages (rutas tipo /#/agenda). */
export function App() {
  return (
    <Providers>
      <HashRouter>
        <AppRoutes />
      </HashRouter>
    </Providers>
  )
}
