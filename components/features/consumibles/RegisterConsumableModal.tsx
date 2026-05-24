"use client";

import { useState, useTransition, FormEvent, ChangeEvent } from "react";
import {
  registrarConsumible,
  type RegisterConsumableInput,
} from "@/app/(dashboard)/consumibles/actions";
import { X } from "lucide-react";

export type SelectOption = {
  id: number;
  nombre: string;
};

interface RegisterConsumableModalProps {
  isOpen: boolean;
  onClose: () => void;
  categorias: SelectOption[];
  ubicaciones: SelectOption[];
}

export default function RegisterConsumableModal({
  isOpen,
  onClose,
  categorias,
  ubicaciones,
}: RegisterConsumableModalProps) {
  const [isPending, startTransition] = useTransition();
  const [errorMsj, setErrorMsj] = useState<string | null>(null);

  const [formData, setFormData] = useState<RegisterConsumableInput>({
    nombre: "",
    cantidad: 0,
    stock_minimo: 10,
    unidad_medida: "uds",
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
      setErrorMsj("El nombre es obligatorio.");
      return;
    }

    startTransition(async () => {
      const result = await registrarConsumible(formData);
      if (result.success) {
        onClose();
        setFormData((prev) => ({ ...prev, nombre: "", cantidad: 0 }));
      } else {
        setErrorMsj(result.message);
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6 relative">
        <button
          onClick={onClose}
          type="button"
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X className="h-5 w-5" />
        </button>

        <h3 className="text-lg font-semibold text-gray-900 mb-6">
          Registrar nuevo consumible
        </h3>

        {errorMsj && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-200">
            {errorMsj}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre del artículo
            </label>
            <input
              name="nombre"
              type="text"
              required
              value={formData.nombre}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#111c2d] outline-none text-sm text-[#333333]"
              placeholder="Ej. Copas de Santa Cena"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Stock Inicial
              </label>
              <input
                name="cantidad"
                type="number"
                min={0}
                required
                value={formData.cantidad}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#111c2d] outline-none text-sm text-[#333333]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Stock Mínimo
              </label>
              <input
                name="stock_minimo"
                type="number"
                min={1}
                required
                value={formData.stock_minimo}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#111c2d] outline-none text-sm text-[#333333]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Unidad
              </label>
              <select
                name="unidad_medida"
                value={formData.unidad_medida}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#111c2d] outline-none text-sm text-[#333333] bg-white"
              >
                <option value="uds">uds</option>
                <option value="paq">paq</option>
                <option value="cajas">cajas</option>
                <option value="viales">viales</option>
                <option value="rollos">rollos</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Categoría
              </label>
              <select
                name="id_categoria"
                value={formData.id_categoria}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#111c2d] outline-none text-sm text-[#333333] bg-white"
              >
                {categorias.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.nombre}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ubicación
              </label>
              <select
                name="id_ubicacion"
                value={formData.id_ubicacion}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#111c2d] outline-none text-sm text-[#333333] bg-white"
              >
                {ubicaciones.map((ubi) => (
                  <option key={ubi.id} value={ubi.id}>
                    {ubi.nombre}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="px-4 py-2 text-sm font-medium text-gray-700 border rounded-lg hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="px-4 py-2 text-sm font-medium text-white bg-[#111c2d] rounded-lg hover:bg-slate-800"
            >
              {isPending ? "Guardando..." : "Crear consumible"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
