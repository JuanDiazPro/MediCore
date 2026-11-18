import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { ArrowRight, Building2, LogIn, Stethoscope, UserRound } from 'lucide-react'
import { Navigate, useLocation, useNavigate } from 'react-router'
import { z } from 'zod'

import { Logo } from '@/components/layout/Logo'
import { PageShell } from '@/components/layout/PageShell'
import { Button } from '@/components/ui/button'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Campo } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { useSesion } from '@/features/auth/sesion'
import { authService } from '@/services'
import { CONTRASENA_DEMO } from '@/services/auth/auth.service'
import type { Rol } from '@/types'

const esquema = z.object({
  correo: z.email('Escribe un correo válido.'),
  contrasena: z.string().min(1, 'Escribe la contraseña.'),
})
type Datos = z.infer<typeof esquema>

const ACCESOS: {
  rol: Rol
  correo: string
  titulo: string
  texto: string
  icono: typeof UserRound
}[] = [
  {
    rol: 'admin',
    correo: 'admin@demo.medicore',
    titulo: 'Administración',
    texto: 'Tablero, reportes, caja y configuración.',
    icono: Building2,
  },
  {
    rol: 'medico',
    correo: 'medico@demo.medicore',
    titulo: 'Médico',
    texto: 'Su agenda, expedientes y consultas.',
    icono: Stethoscope,
  },
  {
    rol: 'recepcion',
    correo: 'recepcion@demo.medicore',
    titulo: 'Recepción',
    texto: 'Agenda de todos, pacientes, cobros y recordatorios.',
    icono: UserRound,
  },
]

export function Login() {
  const { usuario, iniciar } = useSesion()
  const navegar = useNavigate()
  const ubicacion = useLocation()
  const [rolCargando, setRolCargando] = useState<Rol | null>(null)
  const destino = (ubicacion.state as { desde?: string } | null)?.desde ?? '/tablero'

  const form = useForm<Datos>({
    resolver: zodResolver(esquema),
    defaultValues: { correo: '', contrasena: '' },
  })

  const entrar = useMutation({
    mutationFn: (d: Datos) => authService.iniciarSesion(d.correo, d.contrasena),
    onSuccess: (u) => {
      iniciar(u)
      navegar(destino, { replace: true })
    },
    onSettled: () => setRolCargando(null),
  })

  if (usuario) return <Navigate to={destino} replace />

  const accesoRapido = (rol: Rol, correo: string) => {
    setRolCargando(rol)
    form.setValue('correo', correo)
    form.setValue('contrasena', CONTRASENA_DEMO)
    entrar.mutate({ correo, contrasena: CONTRASENA_DEMO })
  }

  return (
    <PageShell>
      <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col justify-center gap-8">
        <div className="flex justify-center">
          <Logo />
        </div>
        <div className="grid gap-6 lg:grid-cols-[1fr_1.15fr]">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Iniciar sesión</CardTitle>
              <CardDescription>
                Acceso simulado. Usa un correo demo y la contraseña pública{' '}
                <strong className="text-navy">demo123</strong>.
              </CardDescription>
            </CardHeader>
            <form
              noValidate
              className="flex flex-col gap-4"
              onSubmit={form.handleSubmit((d) => entrar.mutate(d))}
            >
              <Campo
                etiqueta="Correo"
                htmlFor="correo"
                error={form.formState.errors.correo?.message}
              >
                <Input
                  id="correo"
                  type="email"
                  autoComplete="username"
                  placeholder="admin@demo.medicore"
                  aria-invalid={!!form.formState.errors.correo}
                  {...form.register('correo')}
                />
              </Campo>
              <Campo
                etiqueta="Contraseña"
                htmlFor="contrasena"
                error={form.formState.errors.contrasena?.message}
              >
                <Input
                  id="contrasena"
                  type="password"
                  autoComplete="current-password"
                  placeholder="demo123"
                  aria-invalid={!!form.formState.errors.contrasena}
                  {...form.register('contrasena')}
                />
              </Campo>
              {entrar.isError && (
                <p
                  role="alert"
                  className="rounded-xl bg-danger-soft px-4 py-3 text-sm text-red-700"
                >
                  {entrar.error.message}
                </p>
              )}
              <Button type="submit" size="lg" disabled={entrar.isPending}>
                <LogIn />
                {entrar.isPending && !rolCargando ? 'Entrando…' : 'Entrar'}
              </Button>
            </form>
          </Card>

          <div className="flex flex-col gap-4">
            <div>
              <h2 className="text-xl">Acceso rápido por rol</h2>
              <p className="text-sm text-muted-foreground">
                Cada rol ve un menú distinto. Puedes cambiar de rol cuando quieras.
              </p>
            </div>
            {ACCESOS.map(({ rol, correo, titulo, texto, icono: Icono }) => (
              <button
                key={rol}
                type="button"
                disabled={entrar.isPending}
                onClick={() => accesoRapido(rol, correo)}
                className="group flex items-center gap-4 rounded-2xl bg-white p-5 text-left shadow-soft transition-shadow hover:shadow-lift focus-visible:ring-4 focus-visible:ring-ring/30 focus-visible:outline-none disabled:opacity-60"
              >
                <span className="grid size-12 shrink-0 place-items-center rounded-full bg-brand-soft text-brand-hover">
                  <Icono aria-hidden className="size-6" strokeWidth={1.75} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-bold text-navy">{titulo}</span>
                  <span className="block text-sm text-muted-foreground">{texto}</span>
                  <span className="block truncate text-xs text-brand-hover">{correo}</span>
                </span>
                <ArrowRight
                  aria-hidden
                  className="size-5 text-brand transition-transform group-hover:translate-x-1"
                />
                {rolCargando === rol && <span className="sr-only">Entrando…</span>}
              </button>
            ))}
          </div>
        </div>
      </div>
    </PageShell>
  )
}
