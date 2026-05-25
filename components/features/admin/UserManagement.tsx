"use client";

import { useState } from "react";
import { Rol, UsuarioConRol } from "@/types";
import {
  actualizarUsuario,
  borrarUsuario,
  crearUsuario,
} from "@/actions/admin-actions";
import {
  EyeIcon,
  EyeSlashIcon,
  PencilSquareIcon,
  TrashIcon,
  UserPlusIcon,
  XMarkIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";

interface UserManagementProps {
  usuarios: UsuarioConRol[];
  roles: Rol[];
  currentUserRole: string;
}

export default function UserManagement({
  usuarios,
  roles,
  currentUserRole,
}: UserManagementProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UsuarioConRol | null>(null);
  const [deletingUserId, setDeletingUserId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const esAdmin = currentUserRole === "Obispo";

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);

    const result = await crearUsuario(formData);

    if (result.error) {
      setError(result.error);
    } else {
      setIsModalOpen(false);
      (e.target as HTMLFormElement).reset();
    }
  };

  const handleEdit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingUser) return;
    const formData = new FormData(e.currentTarget);
    const result = await actualizarUsuario(editingUser.id_usuario, formData);
    if (result.error) setError(result.error);
    else setEditingUser(null);
  };

  const handleDelete = async () => {
    if (!deletingUserId) return;
    const result = await borrarUsuario(deletingUserId);
    if (result.error) alert(result.error);
    setDeletingUserId(null);
  };

  return (
    <section className="bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col flex-1 min-h-[500px] md:min-h-0">
      <div className="p-4 md:p-6 border-b border-gray-200 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 shrink-0">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            Gestión de Usuarios (RBAC)
          </h2>
          <p className="text-sm text-gray-500">
            Administre los perfiles de acceso.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          disabled={!esAdmin}
          className="bg-blue-800 hover:bg-blue-950 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors disabled:cursor-not-allowed shadow-sm disabled:opacity-50 disabled:bg-gray-300"
        >
          <UserPlusIcon className="w-5 h-5" /> Añadir Usuario
        </button>
      </div>

      <div className="overflow-x-auto">
        {esAdmin ? (
          <>
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-xs uppercase text-gray-500 font-bold tracking-wider">
                  <th className="px-6 py-4">Usuario</th>
                  <th className="px-6 py-4">Rol Asignado</th>
                  <th className="px-6 py-4">Estado</th>
                  <th className="px-6 py-4 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {usuarios.map((user) => (
                  <tr
                    key={user.id_usuario}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#EAF2F8] flex items-center justify-center text-[#0B3B60] font-bold">
                          {user.nombre_usuario.charAt(0)}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {user.nombre_usuario}
                          </div>
                          <div className="text-xs text-gray-500">
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 bg-[#0B3B60] text-white text-[10px] font-bold rounded-full uppercase tracking-tighter">
                        {user.nombre_rol}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 rounded-md text-[10px] font-bold ${user.is_active ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}
                      >
                        {user.is_active ? "ACTIVO" : "INACTIVO"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => setEditingUser(user)}
                          className="p-1.5 text-gray-400 hover:text-blue-600 transition-colors"
                          title="Editar"
                        >
                          <PencilSquareIcon className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => setDeletingUserId(user.id_usuario)}
                          className="p-1.5 text-gray-400 hover:text-red-600 transition-colors"
                          title="Eliminar"
                        >
                          <TrashIcon className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        ) : (
          <span className="text-[15px] ml-7 text-gray-400 italic">
            No tienes los permisos necesarios para ver los los perfiles de los
            usuarios.
          </span>
        )}
      </div>

      {/* Modal Añadir Usuario */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="text-lg font-bold text-gray-900">Nuevo Usuario</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-900 hover:text-gray-600"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                  Nombre Completo
                </label>
                <input
                  name="nombre"
                  type="text"
                  required
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#0B3B60] outline-none text-[#333333]"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                  Correo Electrónico
                </label>
                <input
                  name="email"
                  type="email"
                  required
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#0B3B60] outline-none text-[#333333]"
                />
              </div>
              <div className="relative">
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                  Contraseña Provisoria
                </label>
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#0B3B60] outline-none text-[#333333]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/9 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <EyeSlashIcon className="w-5 h-5" />
                  ) : (
                    <EyeIcon className="w-5 h-5" />
                  )}
                </button>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                  Rol del Sistema
                </label>
                <select
                  name="id_rol"
                  required
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#0B3B60] outline-none bg-white text-[#333333]"
                >
                  {roles.map((rol) => (
                    <option key={rol.id_rol} value={rol.id_rol}>
                      {rol.nombre_rol}
                    </option>
                  ))}
                </select>
              </div>
              {error && (
                <p className="text-red-500 text-xs font-medium">{error}</p>
              )}
              <button
                type="submit"
                className="w-full bg-blue-800 hover:bg-blue-950 text-white py-3 rounded-lg font-bold transition-all mt-4"
              >
                CREAR CUENTA
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Edición */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
            <div className="p-6 border-b flex justify-between items-center">
              <h3 className="text-lg text-[#000000] font-bold">
                Editar Usuario
              </h3>
              <button
                onClick={() => setEditingUser(null)}
                className="text-gray-900 hover:text-gray-600"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleEdit} className="p-6 space-y-4">
              <input
                name="nombre"
                defaultValue={editingUser.nombre_usuario}
                className="w-full p-2 border rounded-lg text-[#333333]"
              />
              <input
                name="email"
                defaultValue={editingUser.email}
                className="w-full p-2 border rounded-lg text-[#333333]"
              />
              <select
                name="id_rol"
                defaultValue={editingUser.id_rol}
                className="w-full p-2 border rounded-lg text-[#333333]"
              >
                {roles.map((rol) => (
                  <option key={rol.id_rol} value={rol.id_rol}>
                    {rol.nombre_rol}
                  </option>
                ))}
              </select>
              <button
                type="submit"
                className="w-full bg-blue-800 hover:bg-blue-950 text-white p-2 rounded-lg font-bold"
              >
                GUARDAR CAMBIOS
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Confirmación de Borrado */}
      {deletingUserId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl w-full max-w-sm p-6 text-center">
            <ExclamationTriangleIcon className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-gray-900">
              ¿Eliminar Usuario?
            </h3>
            <p className="text-sm text-gray-500 mt-2">
              Esta acción es permanente y borrará al usuario de la base de
              datos.
            </p>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setDeletingUserId(null)}
                className="flex-1 px-4 py-2 bg-gray-200 hover:bg-[#d3d3d3] rounded-lg font-medium text-[#333333]"
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-800 text-white rounded-lg font-medium"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
