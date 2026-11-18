import { Code2, Database, ExternalLink, ShieldAlert, Users } from 'lucide-react'

import { IconCircle } from '@/components/layout/IconCircle'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/button'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

const REPO_URL = 'https://github.com/JuanDiazPro/MediCore'

const EQUIPO = [
  'Chávez Martínez Adrián Uxue',
  'Márquez Bailón Elías Manuel',
  'Díaz Barroso Juan José',
  'Martínez Vázquez Leonardo',
]

export function Acerca() {
  return (
    <>
      <PageHeader titulo="Acerca de MediCore" descripcion="Prototipo demostrativo de Yocoyasoft." />
      <div className="grid gap-5 lg:grid-cols-2">
        <Card className="border-l-4 border-warning lg:col-span-2">
          <div className="flex gap-4">
            <IconCircle icon={ShieldAlert} className="bg-warning-soft text-amber-700" />
            <div>
              <h2 className="text-lg">Versión demostrativa: datos ficticios</h2>
              <p className="mt-1 text-muted-foreground">
                Todos los pacientes, médicos, citas, expedientes y pagos son inventados. No hay
                servidor ni base de datos real, y no debe usarse para registrar información médica
                verdadera. Recetas, recibos y reportes descargables llevan la marca DEMO.
              </p>
            </div>
          </div>
        </Card>
        <Card>
          <CardHeader>
            <IconCircle icon={Database} />
            <CardTitle>¿Dónde se guardan los cambios?</CardTitle>
            <CardDescription>
              Solo en este navegador (localStorage). Otra persona no los ve. El botón "Reiniciar
              demo" regresa todo a los datos de ejemplo.
            </CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <IconCircle icon={Code2} />
            <CardTitle>Código abierto</CardTitle>
            <CardDescription>
              React, TypeScript y Vite, publicado en GitHub Pages. La capa de servicios permite
              conectar un backend real sin rehacer las pantallas.
            </CardDescription>
          </CardHeader>
          <Button asChild variant="secondary" className="w-fit">
            <a href={REPO_URL} target="_blank" rel="noreferrer">
              Ver repositorio
              <ExternalLink />
            </a>
          </Button>
        </Card>
        <Card className="lg:col-span-2">
          <CardHeader>
            <IconCircle icon={Users} />
            <CardTitle>Equipo</CardTitle>
          </CardHeader>
          <ul className="grid gap-2 text-navy sm:grid-cols-2">
            {EQUIPO.map((n) => (
              <li key={n}>{n}</li>
            ))}
          </ul>
        </Card>
      </div>
    </>
  )
}
