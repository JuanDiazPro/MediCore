import {
  ArrowRight,
  CalendarDays,
  ClipboardList,
  ExternalLink,
  HeartPulse,
  type LucideIcon,
  Wallet,
} from 'lucide-react'

import { Link } from 'react-router'

import { IconCircle } from '@/components/layout/IconCircle'
import { Logo } from '@/components/layout/Logo'
import { PageShell } from '@/components/layout/PageShell'
import { Badge, type badgeVariants } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import type { VariantProps } from 'class-variance-authority'

const REPO_URL = 'https://github.com/JuanDiazPro/MediCore'

const modulos: { icon: LucideIcon; titulo: string; texto: string }[] = [
  { icon: CalendarDays, titulo: 'Agenda', texto: 'Citas por médico, sin empalmes.' },
  { icon: ClipboardList, titulo: 'Expediente', texto: 'Historia clínica y notas SOAP.' },
  { icon: HeartPulse, titulo: 'Seguimiento', texto: 'Recordatorios para que regresen.' },
  { icon: Wallet, titulo: 'Caja', texto: 'Cobros y corte del día.' },
]

type Estado = NonNullable<VariantProps<typeof badgeVariants>['variant']>

/** Vista previa ilustrativa del estilo de la agenda. Nombres ficticios. */
const citasEjemplo: { hora: string; paciente: string; estado: Estado; etiqueta: string }[] = [
  { hora: '09:00', paciente: 'Paciente Demo 01', estado: 'confirmada', etiqueta: 'Confirmada' },
  { hora: '10:30', paciente: 'Paciente Demo 02', estado: 'pendiente', etiqueta: 'Pendiente' },
  { hora: '12:00', paciente: 'Paciente Demo 03', estado: 'asistio', etiqueta: 'Asistió' },
  { hora: '13:30', paciente: 'Paciente Demo 04', estado: 'no_asistio', etiqueta: 'No asistió' },
]

export function Bienvenida() {
  return (
    <PageShell>
      <header className="mb-10 flex items-center justify-between gap-4 sm:mb-14">
        <Logo />
        <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
          <a href={REPO_URL} target="_blank" rel="noreferrer">
            Repositorio
            <ExternalLink />
          </a>
        </Button>
      </header>

      <section className="grid items-center gap-10 lg:grid-cols-[1.1fr_1fr] lg:gap-14">
        <div className="space-y-6">
          <Badge>Prototipo demostrativo</Badge>
          <h1 className="text-4xl leading-[1.1] sm:text-5xl">
            La gestión de tu clínica, <span className="text-brand">en un solo lugar.</span>
          </h1>
          <p className="max-w-xl text-base text-muted-foreground sm:text-lg">
            MediCore reúne agenda, expediente clínico, seguimiento de pacientes y caja. Este demo
            usa solo datos ficticios para mostrar cómo funciona.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link to="/login">
                Entrar al demo
                <ArrowRight />
              </Link>
            </Button>
            <Button asChild size="lg" variant="secondary">
              <a href={REPO_URL} target="_blank" rel="noreferrer">
                Ver el proyecto
              </a>
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            Entra como administración, médico o recepción. Contraseña demo: demo123.
          </p>
        </div>

        <Card className="gap-4" aria-label="Vista previa de la agenda">
          <CardHeader className="flex-row items-center justify-between">
            <div>
              <CardTitle>Citas de hoy</CardTitle>
              <CardDescription>Vista previa ilustrativa</CardDescription>
            </div>
            <IconCircle icon={CalendarDays} className="size-10 [&>svg]:size-5" />
          </CardHeader>
          <table className="w-full text-sm">
            <caption className="sr-only">Ejemplo de citas con su estado</caption>
            <thead>
              <tr className="text-left text-xs text-muted-foreground">
                <th scope="col" className="pb-2 font-medium">
                  Hora
                </th>
                <th scope="col" className="pb-2 font-medium">
                  Paciente
                </th>
                <th scope="col" className="pb-2 text-right font-medium">
                  Estado
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {citasEjemplo.map((c) => (
                <tr key={c.hora}>
                  <td className="py-3 pr-4 font-semibold text-navy">{c.hora}</td>
                  <td className="py-3 text-navy">{c.paciente}</td>
                  <td className="py-3 text-right">
                    <Badge variant={c.estado}>{c.etiqueta}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </section>

      <section aria-labelledby="modulos" className="mt-16 sm:mt-20">
        <h2 id="modulos" className="mb-6 text-2xl">
          Qué incluye
        </h2>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {modulos.map((m) => (
            <Card key={m.titulo} className="gap-4 transition-shadow hover:shadow-lift">
              <IconCircle icon={m.icon} />
              <div className="space-y-1">
                <h3 className="text-lg">{m.titulo}</h3>
                <p className="text-sm text-muted-foreground">{m.texto}</p>
              </div>
            </Card>
          ))}
        </div>
      </section>
    </PageShell>
  )
}
