export interface Rol {
  id_rol: number;
  nombre_rol: string;
}

export interface UsuarioConRol {
  id_usuario: number;
  nombre_usuario: string;
  email: string;
  id_rol: number;
  nombre_rol: string;
  is_active: boolean | null;
}
