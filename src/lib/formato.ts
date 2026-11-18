import { differenceInYears, format, formatDistanceToNowStrict, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'

const moneda = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' })
const numero = new Intl.NumberFormat('es-MX')
const porcentaje = new Intl.NumberFormat('es-MX', { style: 'percent', maximumFractionDigits: 1 })

export const formatearMoneda = (monto: number) => moneda.format(monto)
export const formatearNumero = (n: number) => numero.format(n)
export const formatearPorcentaje = (fraccion: number) => porcentaje.format(fraccion)

const aFecha = (f: string | Date) => (typeof f === 'string' ? parseISO(f) : f)

/** "17 nov 2026" */
export const fechaCorta = (f: string | Date) => format(aFecha(f), 'd MMM yyyy', { locale: es })
/** "lunes, 17 de noviembre de 2026" */
export const fechaLarga = (f: string | Date) =>
  format(aFecha(f), "EEEE, d 'de' MMMM 'de' yyyy", { locale: es })
/** "09:30" */
export const hora = (f: string | Date) => format(aFecha(f), 'HH:mm')
/** "17 nov 2026, 09:30" */
export const fechaHora = (f: string | Date) =>
  format(aFecha(f), 'd MMM yyyy, HH:mm', { locale: es })
/** "hace 3 días" */
export const haceTiempo = (f: string | Date) =>
  formatDistanceToNowStrict(aFecha(f), { locale: es, addSuffix: true })

export const edad = (fechaNacimiento: string) =>
  differenceInYears(new Date(), parseISO(fechaNacimiento))

export const nombreCompleto = (p: { nombre: string; apellidos: string }) =>
  `${p.nombre} ${p.apellidos}`

export const iniciales = (nombre: string) =>
  nombre
    .replace(/^(Dr|Dra)\.\s*/, '')
    .split(/\s+/)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase() ?? '')
    .join('')
