import { useState } from 'react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { toast } from '@/components/ui/toast'
import { useActualizarMedico } from '@/features/configuracion/useConfiguracion'
import { DIAS, validarHorario, type FilaHorario as Fila } from '@/features/configuracion/horario'
import type { HorarioDia, Medico } from '@/types'

function FormularioHorario({ medico, alCerrar }: { medico: Medico; alCerrar: () => void }) {
  const actualizar = useActualizarMedico()
  const [filas, setFilas] = useState<Record<number, Fila>>(() =>
    Object.fromEntries(
      DIAS.map(({ dia }) => {
        const h = medico.horario.find((x) => x.dia === dia)
        return [dia, { activo: !!h, inicio: h?.inicio ?? '09:00', fin: h?.fin ?? '14:00' }]
      }),
    ),
  )
  const error = validarHorario(filas)
  const cambiar = (dia: number, cambios: Partial<Fila>) =>
    setFilas((f) => ({ ...f, [dia]: { ...f[dia], ...cambios } }))

  const guardar = () => {
    const horario: HorarioDia[] = DIAS.filter(({ dia }) => filas[dia].activo).map(({ dia }) => ({
      dia,
      inicio: filas[dia].inicio,
      fin: filas[dia].fin,
    }))
    actualizar.mutate(
      { id: medico.id, cambios: { horario } },
      {
        onSuccess: () => {
          toast.exito('Horario actualizado', medico.nombre)
          alCerrar()
        },
      },
    )
  }

  return (
    <>
      <ul className="flex flex-col gap-2">
        {DIAS.map(({ dia, nombre }) => (
          <li
            key={dia}
            className="grid grid-cols-[1fr_auto_auto] items-center gap-2 sm:grid-cols-[8rem_1fr_1fr]"
          >
            <label className="col-span-3 flex items-center gap-2 font-medium text-navy sm:col-span-1">
              <input
                type="checkbox"
                className="size-4 accent-[#14B8A6]"
                checked={filas[dia].activo}
                onChange={(e) => cambiar(dia, { activo: e.target.checked })}
              />
              {nombre}
            </label>
            <Input
              type="time"
              aria-label={`${nombre}, entrada`}
              disabled={!filas[dia].activo}
              value={filas[dia].inicio}
              onChange={(e) => cambiar(dia, { inicio: e.target.value })}
            />
            <Input
              type="time"
              aria-label={`${nombre}, salida`}
              disabled={!filas[dia].activo}
              value={filas[dia].fin}
              onChange={(e) => cambiar(dia, { fin: e.target.value })}
            />
          </li>
        ))}
      </ul>
      {error && (
        <p role="alert" className="text-sm font-medium text-red-600">
          {error}
        </p>
      )}
      <DialogFooter>
        <DialogClose asChild>
          <Button variant="secondary">Cancelar</Button>
        </DialogClose>
        <Button disabled={!!error || actualizar.isPending} onClick={guardar}>
          Guardar horario
        </Button>
      </DialogFooter>
    </>
  )
}

export function HorarioEditor({
  medico,
  alCerrar,
}: {
  medico: Medico | null
  alCerrar: () => void
}) {
  return (
    <Dialog open={!!medico} onOpenChange={(v) => !v && alCerrar()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Horario de {medico?.nombre}</DialogTitle>
          <DialogDescription>
            La agenda solo permite citas dentro de este horario.
          </DialogDescription>
        </DialogHeader>
        {medico && <FormularioHorario key={medico.id} medico={medico} alCerrar={alCerrar} />}
      </DialogContent>
    </Dialog>
  )
}
