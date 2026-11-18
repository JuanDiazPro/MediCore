import { Hammer } from 'lucide-react'

import { Vacio } from '@/components/layout/Estados'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card } from '@/components/ui/card'

export function Proximamente({ titulo }: { titulo?: string }) {
  return (
    <>
      {titulo && <PageHeader titulo={titulo} />}
      <Card>
        <Vacio
          icono={Hammer}
          titulo="Próximamente"
          descripcion="Este módulo se construye en una etapa posterior del prototipo."
        />
      </Card>
    </>
  )
}
