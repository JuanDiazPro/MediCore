import { obtenerBD } from '@/services/db'
import { ErrorServicio, simularLatencia } from '@/services/latencia'

import { CONTRASENA_DEMO, type AuthService } from './auth.service'

export const authService: AuthService = {
  async iniciarSesion(correo, contrasena) {
    await simularLatencia()
    const bd = await obtenerBD()
    const usuario = bd.usuarios.find((u) => u.correo === correo.trim().toLowerCase())
    if (!usuario || contrasena !== CONTRASENA_DEMO) {
      throw new ErrorServicio('Correo o contraseña incorrectos. Usa un usuario demo y "demo123".')
    }
    return { ...usuario }
  },
  async listarUsuariosDemo() {
    const bd = await obtenerBD()
    return bd.usuarios.map((u) => ({ ...u }))
  },
}
