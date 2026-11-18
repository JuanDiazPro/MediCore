import { HashRouter } from 'react-router'

import { AppRoutes } from '@/app/AppRoutes'

/** HashRouter evita errores 404 al recargar en GitHub Pages (rutas tipo /#/agenda). */
export function App() {
  return (
    <HashRouter>
      <AppRoutes />
    </HashRouter>
  )
}
