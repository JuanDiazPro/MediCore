import { Route, Routes } from 'react-router'

import { Bienvenida } from '@/app/pages/Bienvenida'
import { NoEncontrado } from '@/app/pages/NoEncontrado'

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Bienvenida />} />
      <Route path="*" element={<NoEncontrado />} />
    </Routes>
  )
}
