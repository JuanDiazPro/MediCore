import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Megaphone, Send } from 'lucide-react'
import { z } from 'zod'

import { Vacio } from '@/components/layout/Estados'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Campo, Select, Textarea } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { toast } from '@/components/ui/toast'
import {
  useCampanas,
  useConteoSegmento,
  useCrearCampana,
} from '@/features/seguimiento/useSeguimiento'
import { ETIQUETA_CANAL } from '@/lib/estados'
import { fechaHora, formatearNumero } from '@/lib/formato'
import type { SegmentoCampana } from '@/services'

const SEGMENTOS: Record<SegmentoCampana, string> = {
  todos: 'Todos los pacientes',
  sin_visita_6m: 'Sin visita en 6 meses',
  cronicos: 'Pacientes crónicos (hipertensión, diabetes…)',
  pediatria: 'Pacientes pediátricos',
  mujeres: 'Mujeres',
}

const esquema = z.object({
  nombre: z.string().trim().min(3, 'Ponle nombre a la campaña.'),
  segmento: z.enum(['todos', 'sin_visita_6m', 'cronicos', 'pediatria', 'mujeres']),
  canal: z.enum(['whatsapp', 'sms', 'correo']),
  mensaje: z.string().trim().min(10, 'Escribe el mensaje (mínimo 10 caracteres).').max(300),
})
type Datos = z.infer<typeof esquema>

export function Campanas() {
  const campanas = useCampanas()
  const crear = useCrearCampana()
  const form = useForm<Datos>({
    resolver: zodResolver(esquema),
    defaultValues: {
      nombre: 'Revisión anual',
      segmento: 'sin_visita_6m',
      canal: 'whatsapp',
      mensaje:
        'Hola {nombre}, ya te toca tu revisión anual en Clínica Integral Demo. Agenda tu cita respondiendo este mensaje.',
    },
  })
  const { errors } = form.formState
  const segmento = useWatch({ control: form.control, name: 'segmento' })
  const mensaje = useWatch({ control: form.control, name: 'mensaje' })
  const conteo = useConteoSegmento(segmento)

  const enviar = form.handleSubmit((d) =>
    crear.mutate(d, {
      onSuccess: (c) =>
        toast.mensaje(
          `Campaña "${c.nombre}" enviada (simulada)`,
          `${formatearNumero(c.destinatarios)} mensajes por ${ETIQUETA_CANAL[c.canal]}.`,
        ),
      onError: (e) => toast.error('No se pudo enviar', e.message),
    }),
  )

  return (
    <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
      <Card>
        <CardHeader>
          <CardTitle>Nueva campaña</CardTitle>
          <CardDescription>Mensajes masivos simulados con segmentación básica.</CardDescription>
        </CardHeader>
        <form noValidate onSubmit={enviar} className="flex flex-col gap-4">
          <Campo etiqueta="Nombre" htmlFor="cm-nombre" error={errors.nombre?.message}>
            <Input id="cm-nombre" {...form.register('nombre')} />
          </Campo>
          <div className="grid gap-4 sm:grid-cols-2">
            <Campo
              etiqueta="Segmento"
              htmlFor="cm-segmento"
              ayuda={
                conteo.data !== undefined
                  ? `${formatearNumero(conteo.data)} pacientes recibirán el mensaje`
                  : 'Calculando…'
              }
            >
              <Select id="cm-segmento" {...form.register('segmento')}>
                {Object.entries(SEGMENTOS).map(([v, t]) => (
                  <option key={v} value={v}>
                    {t}
                  </option>
                ))}
              </Select>
            </Campo>
            <Campo etiqueta="Canal" htmlFor="cm-canal">
              <Select id="cm-canal" {...form.register('canal')}>
                <option value="whatsapp">WhatsApp</option>
                <option value="sms">SMS</option>
                <option value="correo">Correo</option>
              </Select>
            </Campo>
          </div>
          <Campo
            etiqueta="Mensaje"
            htmlFor="cm-mensaje"
            error={errors.mensaje?.message}
            ayuda="Usa {nombre} para personalizar."
          >
            <Textarea id="cm-mensaje" {...form.register('mensaje')} />
          </Campo>
          <div className="rounded-2xl bg-[#e7f8ef] p-4">
            <p className="mb-1 text-xs font-semibold text-green-700">Vista previa</p>
            <p className="max-w-[90%] rounded-2xl rounded-tl-sm bg-white px-4 py-2 text-sm text-navy shadow-soft">
              {(mensaje ?? '').replaceAll('{nombre}', 'María')}
            </p>
          </div>
          <Button type="submit" disabled={crear.isPending} className="w-fit">
            <Send />
            {crear.isPending ? 'Enviando…' : 'Enviar campaña'}
          </Button>
        </form>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Campañas enviadas</CardTitle>
        </CardHeader>
        {!campanas.data?.length ? (
          <Vacio
            icono={Megaphone}
            titulo="Aún no hay campañas"
            descripcion="Envía la primera para verla aquí."
          />
        ) : (
          <ul className="divide-y divide-border">
            {campanas.data.map((c) => (
              <li key={c.id} className="py-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-semibold text-navy">{c.nombre}</p>
                  <Badge>{formatearNumero(c.destinatarios)} enviados</Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  {SEGMENTOS[c.segmento as SegmentoCampana]} · {ETIQUETA_CANAL[c.canal]} ·{' '}
                  {fechaHora(c.enviadaEn)}
                </p>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  )
}
