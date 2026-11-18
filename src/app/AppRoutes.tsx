import { lazy, Suspense, type ReactNode } from 'react'
import { Navigate, Route, Routes } from 'react-router'

import { Acerca } from '@/app/pages/Acerca'
import { Bienvenida } from '@/app/pages/Bienvenida'
import { NoEncontrado } from '@/app/pages/NoEncontrado'
import { Proximamente } from '@/app/pages/Proximamente'
import { AppLayout } from '@/components/layout/AppLayout'
import { Cargando } from '@/components/layout/Estados'
import { Login } from '@/features/auth/Login'
import type { Modulo } from '@/features/auth/permisos'
import { RutaProtegida } from '@/features/auth/RutaProtegida'

// Carga diferida por módulo: cada pantalla se descarga solo cuando se visita.
const PacientesLista = lazy(() =>
  import('@/features/pacientes/PacientesLista').then((m) => ({ default: m.PacientesLista })),
)
const Agenda = lazy(() => import('@/features/agenda/Agenda').then((m) => ({ default: m.Agenda })))
const Consulta = lazy(() =>
  import('@/features/consultas/Consulta').then((m) => ({ default: m.Consulta })),
)
const PaginaPaciente = lazy(() =>
  import('@/app/pages/PaginaPaciente').then((m) => ({ default: m.PaginaPaciente })),
)

function Modulo({ modulo, children }: { modulo: Modulo; children: ReactNode }) {
  return (
    <RutaProtegida modulo={modulo}>
      <Suspense fallback={<Cargando filas={6} />}>{children}</Suspense>
    </RutaProtegida>
  )
}

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Bienvenida />} />
      <Route path="/login" element={<Login />} />
      <Route
        element={
          <RutaProtegida>
            <AppLayout />
          </RutaProtegida>
        }
      >
        <Route
          path="/tablero"
          element={
            <Modulo modulo="tablero">
              <Proximamente titulo="Tablero" />
            </Modulo>
          }
        />
        <Route
          path="/agenda"
          element={
            <Modulo modulo="agenda">
              <Agenda />
            </Modulo>
          }
        />
        <Route
          path="/pacientes"
          element={
            <Modulo modulo="pacientes">
              <PacientesLista />
            </Modulo>
          }
        />
        <Route
          path="/pacientes/:id"
          element={
            <Modulo modulo="pacientes">
              <PaginaPaciente />
            </Modulo>
          }
        />
        <Route
          path="/consulta/:citaId"
          element={
            <Modulo modulo="agenda">
              <Consulta />
            </Modulo>
          }
        />
        <Route
          path="/seguimiento"
          element={
            <Modulo modulo="seguimiento">
              <Proximamente titulo="Seguimiento" />
            </Modulo>
          }
        />
        <Route
          path="/caja"
          element={
            <Modulo modulo="caja">
              <Proximamente titulo="Caja" />
            </Modulo>
          }
        />
        <Route
          path="/reportes"
          element={
            <Modulo modulo="reportes">
              <Proximamente titulo="Reportes" />
            </Modulo>
          }
        />
        <Route
          path="/configuracion"
          element={
            <Modulo modulo="configuracion">
              <Proximamente titulo="Configuración" />
            </Modulo>
          }
        />
        <Route path="/acerca" element={<Acerca />} />
        <Route path="/inicio" element={<Navigate to="/tablero" replace />} />
      </Route>
      <Route path="*" element={<NoEncontrado />} />
    </Routes>
  )
}
