import { ArrowLeft, SearchX } from 'lucide-react'
import { Link } from 'react-router'

import { IconCircle } from '@/components/layout/IconCircle'
import { Logo } from '@/components/layout/Logo'
import { PageShell } from '@/components/layout/PageShell'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

export function NoEncontrado() {
  return (
    <PageShell>
      <div className="flex flex-1 flex-col items-center justify-center gap-8">
        <Logo />
        <Card className="w-full max-w-md items-center text-center">
          <IconCircle icon={SearchX} className="size-16 [&>svg]:size-8" />
          <div className="space-y-2">
            <p className="text-sm font-semibold text-brand-hover">Error 404</p>
            <h1 className="text-2xl sm:text-3xl">Página no encontrada</h1>
            <p className="text-muted-foreground">La dirección que buscas no existe en el demo.</p>
          </div>
          <Button asChild>
            <Link to="/">
              <ArrowLeft />
              Volver al inicio
            </Link>
          </Button>
        </Card>
      </div>
    </PageShell>
  )
}
