import { Lock } from 'lucide-react'
import { Link } from 'react-router'

import { Vacio } from '@/components/layout/Estados'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

export function SinPermiso() {
  return (
    <Card>
      <Vacio
        icono={Lock}
        titulo="Tu rol no tiene acceso a este módulo"
        descripcion="Cierra sesión y entra con otro usuario demo para explorarlo."
        accion={
          <Button asChild size="sm">
            <Link to="/tablero">Ir al tablero</Link>
          </Button>
        }
      />
    </Card>
  )
}
