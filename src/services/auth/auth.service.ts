import type { Usuario } from '@/types'

export interface AuthService {
  /** Inicio de sesión SIMULADO: solo acepta los usuarios demo con la contraseña pública. */
  iniciarSesion(correo: string, contrasena: string): Promise<Usuario>
  listarUsuariosDemo(): Promise<Usuario[]>
}

export const CONTRASENA_DEMO = 'demo123'
