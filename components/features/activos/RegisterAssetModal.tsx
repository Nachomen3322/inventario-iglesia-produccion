"use client";

import { useState, useTransition, FormEvent, ChangeEvent } from "react";
import {
  registrarActivo,
  type RegisterAssetInput,
} from "@/app/(dashboard)/activos/actions";
import { X } from "lucide-react";

export type SelectOption = {
  id: number;
  nombre: string;
};

interface RegisterAssetModalProps {
  isOpen: boolean;
  onClose: () => void;
  categorias: SelectOption[];
  ubicaciones: SelectOption[];
}

export default function RegisterAssetModal({
  isOpen,
  onClose,
  categorias,
  ubicaciones,
}: RegisterAssetModalProps) {
  const [isPending, startTransition] = useTransition();
  const [errorMsj, setErrorMsj] = useState<string | null>(null);
  const [formData, setFormData] = useState<RegisterAssetInput>({
    nombre: "",
    cantidad: 0,
    estado_fisico: "Nuevo", // Valor por defecto sugerido [cite: 30]
    id_categoria: categorias.length > 0 ? categorias[0].id : 0,
    id_ubicacion: ubicaciones.length > 0 ? ubicaciones[0].id : 0,
  });

  if (!isOpen) return null;

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "number" || name === "id_categoria" || name === "id_ubicacion"
          ? Number(value)
          : value,
    }));
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMsj(null);

    if (!formData.nombre.trim()) {
      setErrorMsj("El nombre del artículo es obligatorio.");
      return;
    }

    startTransition(async () => {
      const result = await registrarActivo(formData);
      if (result.success) {
        onClose();
      } else {
        setErrorMsj(result.message);
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 relative flex flex-col max-h-[90vh]">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          type="button"
          aria-label="Cerrar modal"
        >
          <X className="h-5 w-5" />
        </button>

        <h3 className="text-lg font-semibold text-gray-900 mb-6">
          Registrar nuevo activo
        </h3>

        {errorMsj && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-200">
            {errorMsj}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="space-y-4 overflow-y-auto custom-scrollbar pr-2 flex-1"
        >
          <div>
            <label
              htmlFor="nombre"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Nombre del artículo
            </label>
            <input
              id="nombre"
              name="nombre"
              type="text"
              required
              value={formData.nombre}
              onChange={handleChange}
              className="w-full px-3 py-2 border text-[#333333] border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-800 outline-none text-sm"
              placeholder="Ej. Estante, Silla,..."
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="cantidad"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Cantidad
              </label>
              <input
                id="cantidad"
                name="cantidad"
                type="number"
                min={0}
                required
                value={formData.cantidad}
                onChange={handleChange}
                className="w-full px-3 py-2 border text-[#333333] border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-800 outline-none text-sm"
              />
            </div>
            <div>
              <label
                htmlFor="estado_fisico"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Estado físico
              </label>
              <select
                id="estado_fisico"
                name="estado_fisico"
                value={formData.estado_fisico}
                onChange={handleChange}
                className="w-full px-3 py-2 border text-[#333333] border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-800 outline-none text-sm bg-white"
              >
                <option value="Nuevo">Nuevo</option>
                <option value="Bueno">Bueno</option>
                <option value="Dañado">Dañado</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="id_categoria"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Categoría
              </label>
              <select
                id="id_categoria"
                name="id_categoria"
                value={formData.id_categoria}
                onChange={handleChange}
                className="w-full px-3 py-2 border text-[#333333] border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-800 outline-none text-sm bg-white"
              >
                {categorias.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="id_ubicacion"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Ubicación Interna
              </label>
              <select
                id="id_ubicacion"
                name="id_ubicacion"
                value={formData.id_ubicacion}
                onChange={handleChange}
                className="w-full px-3 py-2 border text-[#333333] border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-800 outline-none text-sm bg-white"
              >
                {ubicaciones.map((ubi) => (
                  <option key={ubi.id} value={ubi.id}>
                    {ubi.nombre}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-6 flex flex-col-reverse sm:flex-row justify-end gap-3 pt-4 border-t border-gray-100 shrink-0">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="px-4 py-2 text-sm font-medium text-white bg-slate-800 rounded-lg hover:bg-slate-700 disabled:opacity-50 flex items-center gap-2"
            >
              {isPending ? "Guardando..." : "Registrar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
