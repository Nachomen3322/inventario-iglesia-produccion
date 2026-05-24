"use client";

import {
  useState,
  useEffect,
  useTransition,
  FormEvent,
  ChangeEvent,
} from "react";
import {
  registrarPrestamo,
  type RegisterLoanInput,
} from "@/app/(dashboard)/prestamos/actions";
import { X, AlertTriangle, MapPin } from "lucide-react";
import { format } from "date-fns";

export type ArticleOption = {
  id: number;
  nombre: string;
  cantidad: number;
  ubicacion: string;
};

interface RegisterLoanModalProps {
  isOpen: boolean;
  onClose: () => void;
  articulosDisponibles: ArticleOption[];
  currentUser: { id: number; name: string; role: string };
}

export default function RegisterLoanModal({
  isOpen,
  onClose,
  articulosDisponibles,
  currentUser,
}: RegisterLoanModalProps) {
  const [isPending, startTransition] = useTransition();
  const [errorMsj, setErrorMsj] = useState<string | null>(null);

  const primerArticulo =
    articulosDisponibles.length > 0 ? articulosDisponibles[0] : null;

  const hoyLocal = format(new Date(), "yyyy-MM-dd");

  const [formData, setFormData] = useState({
    id_articulo: primerArticulo ? primerArticulo.id : 0,
    cantidad_prestada: primerArticulo ? primerArticulo.cantidad : 1,
    destino: "",
    responsable_externo: "",
    fecha_inicio: hoyLocal,
    fecha_retorno: "",
  });

  if (!isOpen) return null;

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value, type } = e.target;
    if (name === "id_articulo") {
      const selectedId = Number(value);
      const articuloSeleccionado = articulosDisponibles.find(
        (a) => a.id === selectedId,
      );

      setFormData((prev) => ({
        ...prev,
        id_articulo: selectedId,
        cantidad_prestada: articuloSeleccionado
          ? articuloSeleccionado.cantidad
          : 1,
      }));
      setErrorMsj(null);
      return;
    }
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "number" || name === "id_articulo" ? Number(value) : value,
    }));
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMsj(null);

    if (formData.id_articulo === 0) {
      setErrorMsj("Debe seleccionar un artículo válido.");
      return;
    }

    const articuloSeleccionado = articulosDisponibles.find(
      (a) => a.id === formData.id_articulo,
    );

    if (
      articuloSeleccionado &&
      formData.cantidad_prestada > articuloSeleccionado.cantidad
    ) {
      setErrorMsj(
        `El artículo seleccionado (${articuloSeleccionado.nombre}) tiene registrado ${articuloSeleccionado.cantidad} unidades, por lo que sobrepasa lo seleccionado.`,
      );
      return;
    }

    startTransition(async () => {
      const payload: RegisterLoanInput = {
        ...formData,
        id_articulo: Number(formData.id_articulo),
        fecha_inicio: new Date(formData.fecha_inicio),
        fecha_retorno: new Date(formData.fecha_retorno),
        autorizado_por: `${currentUser.name} (${currentUser.role})`,
        id_usuario: currentUser.id,
      };

      const result = await registrarPrestamo(payload);
      if (result.success) {
        onClose();
      } else {
        setErrorMsj(result.message);
      }
    });
  };

  const articuloSeleccionado = articulosDisponibles.find(
    (a) => a.id === formData.id_articulo,
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        <h3 className="text-xl font-bold text-gray-900 mb-6">
          Registrar Nuevo Préstamo
        </h3>

        {errorMsj && (
          <div className="mb-6 p-4 bg-orange-50 text-orange-800 text-sm rounded-lg border border-orange-200 flex gap-3 items-start animate-in fade-in slide-in-from-top-2">
            <AlertTriangle className="h-5 w-5 shrink-0 text-orange-500 mt-0.5" />
            <p className="font-medium leading-relaxed">{errorMsj}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-sm font-medium text-gray-700">
                Artículo a prestar
              </label>
              {articuloSeleccionado && (
                <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-medium flex items-center gap-1 animate-in fade-in duration-200">
                  <MapPin className="h-3 w-3 text-slate-400" />
                  {articuloSeleccionado.ubicacion}
                </span>
              )}
            </div>

            <select
              name="id_articulo"
              value={formData.id_articulo}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#111c2d] outline-none text-sm text-[#333333] bg-white"
            >
              {articulosDisponibles.map((art) => (
                <option key={art.id} value={art.id}>
                  {art.nombre} (Disp: {art.cantidad})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cantidad
              </label>
              <input
                name="cantidad_prestada"
                type="number"
                min={1}
                required
                value={formData.cantidad_prestada}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#111c2d] outline-none text-sm text-[#333333]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Responsable Externo
              </label>
              <input
                name="responsable_externo"
                type="text"
                required
                placeholder="Nombre completo"
                value={formData.responsable_externo}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#111c2d] outline-none text-sm text-[#333333]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha de Salida
              </label>
              <div className="relative">
                <input
                  name="fecha_inicio"
                  type="date"
                  required
                  value={formData.fecha_inicio}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#111c2d] outline-none text-sm text-[#333333]"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Retorno Esperado
              </label>
              <input
                name="fecha_retorno"
                type="date"
                required
                value={formData.fecha_retorno}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#111c2d] outline-none text-sm text-[#333333]"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Destino Externo
            </label>
            <input
              name="destino"
              type="text"
              required
              placeholder="Ej. Capilla de Estaca, Gimnasio Local..."
              value={formData.destino}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#111c2d] outline-none text-sm text-[#333333]"
            />
          </div>

          <div className="pt-2">
            <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">
              Autorizado Por
            </label>
            <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-[#333333] font-medium">
              {currentUser.name} ({currentUser.role})
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="px-6 py-2 text-sm font-medium text-white bg-[#111c2d] rounded-lg hover:bg-slate-600 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {isPending ? "Procesando..." : "Registrar Préstamo"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
