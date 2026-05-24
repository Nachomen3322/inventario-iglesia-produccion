"use client";

import {
  useState,
  useRef,
  useTransition,
  useEffect,
  FormEvent,
  ChangeEvent,
} from "react";
import { X, AlertTriangle, MapPin } from "lucide-react";
import {
  editarPrestamo,
  type EditLoanInput,
} from "@/app/(dashboard)/prestamos/actions";
import type { Loan } from "./LoansTable";
import type { ArticleOption } from "./RegisterLoanModal";

interface EditLoanModalProps {
  loan: Loan | null;
  onClose: () => void;
  articulos: ArticleOption[];
}

const formatDateToInputString = (dateInput: Date | string | null): string => {
  if (!dateInput) return "";
  const d = new Date(dateInput);
  const year = d.getUTCFullYear();
  const month = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export default function EditLoanModal({
  loan,
  onClose,
  articulos,
}: EditLoanModalProps) {
  const [isPending, startTransition] = useTransition();
  const [errorMsj, setErrorMsj] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    id_movimiento: 0,
    id_articulo: 0,
    cantidad_prestada: 1,
    responsable_externo: "",
    destino: "",
    fecha_inicio: "",
    fecha_retorno: "",
  });

  const opcionesArticulos = [...articulos];

  if (loan && !opcionesArticulos.some((a) => a.id === loan.id_articulo)) {
    opcionesArticulos.unshift({
      id: loan.id_articulo,
      nombre: loan.articulo_nombre,
      cantidad: loan.cantidad_prestada,
      ubicacion: loan.articulo_ubicacion,
    });
  }

  const initialRender = useRef(true);

  useEffect(() => {
    if (loan && initialRender.current) {
      setFormData({
        id_movimiento: loan.id,
        id_articulo: loan.id_articulo,
        cantidad_prestada: loan.cantidad_prestada,
        responsable_externo: loan.responsable || "",
        destino: loan.destino_externo || "",
        fecha_inicio: formatDateToInputString(loan.fecha_salida),
        fecha_retorno: formatDateToInputString(loan.fecha_retorno_esperada),
      });
      initialRender.current = false;
      setErrorMsj(null);
    }
  }, [loan]);

  if (!loan || !formData) return null;

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value, type } = e.target;

    if (name === "id_articulo") {
      const selectedId = Number(value);
      const articuloSeleccionado = opcionesArticulos.find(
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
      [name]: type === "number" ? Number(value) : value,
    }));
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMsj(null);

    const articuloSeleccionado = opcionesArticulos.find(
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
      const payload: EditLoanInput = {
        id_movimiento: formData.id_movimiento,
        id_articulo: formData.id_articulo,
        cantidad_prestada: formData.cantidad_prestada,
        responsable_externo: formData.responsable_externo,
        destino: formData.destino,
        fecha_inicio: new Date(`${formData.fecha_inicio}T00:00:00`),
        fecha_retorno: new Date(`${formData.fecha_retorno}T00:00:00`),
      };

      const result = await editarPrestamo(payload);
      if (result.success) {
        onClose();
      } else {
        setErrorMsj(result.message || "Error al procesar la actualización.");
      }
    });
  };

  const articuloSeleccionado = opcionesArticulos.find(
    (a) => a.id === formData.id_articulo,
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X className="h-5 w-5" />
        </button>
        <h3 className="text-xl font-bold text-gray-900 mb-6">
          Editar Préstamo #{loan.id}
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
                Artículo prestado
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
              {opcionesArticulos.map((art) => (
                <option key={art.id} value={art.id}>
                  {art.nombre} (Disponibles: {art.cantidad})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Cantidad
              </label>
              <input
                type="number"
                className="w-full mt-1 p-2 border rounded-lg text-sm text-[#333333]"
                name="cantidad_prestada"
                min={1}
                required
                value={formData.cantidad_prestada}
                onChange={handleChange}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Responsable
              </label>
              <input
                type="text"
                className="w-full mt-1 p-2 border rounded-lg text-sm text-[#333333]"
                name="responsable_externo"
                value={formData.responsable_externo}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Fecha Salida
              </label>
              <input
                type="date"
                className="w-full mt-1 p-2 border rounded-lg text-sm text-[#333333]"
                name="fecha_inicio"
                value={formData.fecha_inicio}
                onChange={handleChange}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Retorno Esperado
              </label>
              <input
                type="date"
                className="w-full mt-1 p-2 border rounded-lg text-sm text-[#333333]"
                name="fecha_retorno"
                required
                value={formData.fecha_retorno}
                onChange={handleChange}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Destino
            </label>
            <input
              type="text"
              className="w-full mt-1 p-2 border rounded-lg text-sm text-[#333333]"
              name="destino"
              value={formData.destino}
              onChange={handleChange}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="px-4 py-2 text-sm text-gray-400 hover:bg-gray-200 border rounded-lg"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="px-4 py-2 text-sm bg-[#111c2d] hover:bg-slate-600 text-white rounded-lg"
            >
              {isPending ? "Guardando..." : "Guardar Cambios"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
