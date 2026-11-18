import { jsPDF } from 'jspdf'

import { edad, fechaHora, fechaLarga, formatearMoneda } from '@/lib/formato'
import { ETIQUETA_METODO } from '@/lib/estados'
import type { Clinica, Consulta, Medico, Paciente, Pago, Servicio } from '@/types'

const TURQUESA: [number, number, number] = [20, 184, 166]
const NAVY: [number, number, number] = [15, 42, 68]
const GRIS: [number, number, number] = [100, 116, 139]
export const LEYENDA_DEMO = 'DEMO, sin validez'

/** Marca de agua diagonal en todas las páginas (regla 4 de CLAUDE.md). */
function marcaDeAgua(doc: jsPDF) {
  const total = doc.getNumberOfPages()
  for (let i = 1; i <= total; i++) {
    doc.setPage(i)
    const { width, height } = doc.internal.pageSize
    doc.saveGraphicsState()
    doc.setGState(doc.GState({ opacity: 0.12 }))
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(64)
    doc.setTextColor(...NAVY)
    doc.text(LEYENDA_DEMO, width / 2, height / 2, { align: 'center', angle: 35 })
    doc.restoreGraphicsState()
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)
    doc.setTextColor(...GRIS)
    doc.text(
      'Documento generado por el prototipo demostrativo MediCore. Datos ficticios. Sin validez oficial.',
      width / 2,
      height - 10,
      { align: 'center' },
    )
  }
}

function encabezado(doc: jsPDF, clinica: Clinica, titulo: string) {
  const { width } = doc.internal.pageSize
  doc.setFillColor(...NAVY)
  doc.rect(0, 0, width, 28, 'F')
  doc.setFillColor(...TURQUESA)
  doc.rect(0, 28, width, 2, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(18)
  doc.text('MediCore', 15, 13)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.text(clinica.nombre, 15, 20)
  doc.text(`${clinica.direccion} · Tel. ${clinica.telefono}`, 15, 25)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(13)
  doc.text(titulo, width - 15, 16, { align: 'right' })
}

function etiquetaValor(doc: jsPDF, etiqueta: string, valor: string, x: number, y: number) {
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(...GRIS)
  doc.text(etiqueta.toUpperCase(), x, y)
  doc.setFontSize(11)
  doc.setTextColor(...NAVY)
  doc.text(valor, x, y + 5)
}

export interface DatosReceta {
  clinica: Clinica
  medico: Medico
  paciente: Paciente
  consulta: Consulta
}

export function crearRecetaPdf({ clinica, medico, paciente, consulta }: DatosReceta) {
  const doc = new jsPDF({ unit: 'mm', format: 'letter' })
  const { width } = doc.internal.pageSize
  encabezado(doc, clinica, 'Receta médica')

  let y = 42
  etiquetaValor(doc, 'Médico', medico.nombre, 15, y)
  etiquetaValor(doc, 'Especialidad · Cédula', `${medico.especialidad} · ${medico.cedula}`, 110, y)
  y += 14
  etiquetaValor(doc, 'Paciente', `${paciente.nombre} ${paciente.apellidos}`, 15, y)
  etiquetaValor(
    doc,
    'Edad · Fecha',
    `${edad(paciente.fechaNacimiento)} años · ${fechaHora(consulta.fecha)}`,
    110,
    y,
  )
  y += 14
  const alergias = paciente.alergias.length ? paciente.alergias.join(', ') : 'Ninguna conocida'
  etiquetaValor(doc, 'Alergias', alergias, 15, y)
  if (consulta.diagnosticos.length) {
    etiquetaValor(
      doc,
      'Diagnóstico',
      consulta.diagnosticos
        .map((d) => `${d.codigo} ${d.descripcion}`)
        .join('; ')
        .slice(0, 60),
      110,
      y,
    )
  }

  y += 16
  doc.setDrawColor(226, 232, 240)
  doc.line(15, y, width - 15, y)
  y += 10
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(13)
  doc.setTextColor(...NAVY)
  doc.text('Rx', 15, y)
  y += 8

  const medicamentos = consulta.receta?.medicamentos ?? []
  medicamentos.forEach((m, i) => {
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(11)
    doc.setTextColor(...NAVY)
    doc.text(`${i + 1}. ${m.nombre}`, 18, y)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)
    doc.setTextColor(...GRIS)
    doc.text(`${m.dosis}, ${m.frecuencia}, durante ${m.duracion}.`, 23, y + 5.5)
    y += 14
  })

  if (consulta.receta?.indicaciones) {
    y += 4
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(10)
    doc.setTextColor(...NAVY)
    doc.text('Indicaciones', 15, y)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(...GRIS)
    const lineas = doc.splitTextToSize(consulta.receta.indicaciones, width - 30)
    doc.text(lineas, 15, y + 6)
    y += 6 + lineas.length * 5
  }

  y = Math.max(y + 25, 220)
  doc.setDrawColor(...NAVY)
  doc.line(width / 2 - 40, y, width / 2 + 40, y)
  doc.setFontSize(9)
  doc.setTextColor(...NAVY)
  doc.text(`${medico.nombre} · Firma (simulada)`, width / 2, y + 5, { align: 'center' })

  marcaDeAgua(doc)
  return doc
}

export interface DatosRecibo {
  clinica: Clinica
  pago: Pago
  paciente: Paciente
  servicio?: Servicio
  medico?: Medico
}

export function crearReciboPdf({ clinica, pago, paciente, servicio, medico }: DatosRecibo) {
  const doc = new jsPDF({ unit: 'mm', format: 'a5' })
  const { width } = doc.internal.pageSize
  encabezado(doc, clinica, `Recibo ${pago.folio}`)
  let y = 42
  etiquetaValor(doc, 'Fecha', fechaLarga(pago.fecha), 12, y)
  y += 14
  etiquetaValor(doc, 'Paciente', `${paciente.nombre} ${paciente.apellidos}`, 12, y)
  y += 14
  etiquetaValor(doc, 'Concepto', servicio?.nombre ?? 'Servicio', 12, y)
  if (medico) etiquetaValor(doc, 'Médico', medico.nombre, 80, y)
  y += 14
  etiquetaValor(doc, 'Método de pago', ETIQUETA_METODO[pago.metodo], 12, y)
  y += 18
  doc.setFillColor(204, 251, 241)
  doc.roundedRect(12, y, width - 24, 18, 4, 4, 'F')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.setTextColor(...NAVY)
  doc.text('TOTAL', 18, y + 11)
  doc.setFontSize(16)
  doc.text(formatearMoneda(pago.monto), width - 18, y + 12, { align: 'right' })
  y += 28
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(...GRIS)
  doc.text('Este recibo no es un comprobante fiscal (CFDI).', 12, y)
  marcaDeAgua(doc)
  return doc
}

export interface FilaReporte {
  [columna: string]: string
}

export function crearReportePdf(
  clinica: Clinica,
  titulo: string,
  subtitulo: string,
  columnas: string[],
  filas: FilaReporte[],
) {
  const doc = new jsPDF({ unit: 'mm', format: 'letter' })
  const { width, height } = doc.internal.pageSize
  encabezado(doc, clinica, titulo)
  let y = 40
  doc.setFontSize(10)
  doc.setTextColor(...GRIS)
  doc.text(subtitulo, 15, y)
  y += 10
  const ancho = (width - 30) / columnas.length
  const fila = (valores: string[], negrita: boolean) => {
    doc.setFont('helvetica', negrita ? 'bold' : 'normal')
    doc.setFontSize(9)
    doc.setTextColor(...(negrita ? NAVY : GRIS))
    valores.forEach((v, i) =>
      doc.text(v, i === 0 ? 15 : 15 + ancho * (i + 1) - 2, y, {
        align: i === 0 ? 'left' : 'right',
      }),
    )
    y += 4
    doc.setDrawColor(226, 232, 240)
    doc.line(15, y, width - 15, y)
    y += 6
  }
  fila(columnas, true)
  for (const f of filas) {
    if (y > height - 20) {
      doc.addPage()
      y = 20
    }
    fila(
      columnas.map((c) => f[c] ?? ''),
      false,
    )
  }
  marcaDeAgua(doc)
  return doc
}

export function descargar(doc: jsPDF, nombre: string) {
  doc.save(nombre)
}
