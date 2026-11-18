import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

import { establecerUsuarioActual } from '@/services'
import type { Usuario } from '@/types'

interface EstadoSesion {
  usuario: Usuario | null
  iniciar: (usuario: Usuario) => void
  cerrar: () => void
}

/** Almacenamiento que no truena si el navegador bloquea localStorage. */
const almacenSeguro = createJSONStorage(() => {
  try {
    localStorage.setItem('medicore:prueba', '1')
    localStorage.removeItem('medicore:prueba')
    return localStorage
  } catch {
    const memoria = new Map<string, string>()
    return {
      getItem: (k: string) => memoria.get(k) ?? null,
      setItem: (k: string, v: string) => void memoria.set(k, v),
      removeItem: (k: string) => void memoria.delete(k),
    }
  }
})

export const useSesion = create<EstadoSesion>()(
  persist(
    (set) => ({
      usuario: null,
      iniciar: (usuario) => {
        establecerUsuarioActual(usuario.nombre)
        set({ usuario })
      },
      cerrar: () => {
        establecerUsuarioActual('Sistema')
        set({ usuario: null })
      },
    }),
    {
      name: 'medicore:sesion',
      storage: almacenSeguro,
      onRehydrateStorage: () => (estado) => {
        if (estado?.usuario) establecerUsuarioActual(estado.usuario.nombre)
      },
    },
  ),
)

/** Usuario en sesión (las rutas protegidas garantizan que exista). */
export function useUsuario(): Usuario {
  const usuario = useSesion((s) => s.usuario)
  if (!usuario) throw new Error('No hay sesión activa')
  return usuario
}
