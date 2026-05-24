"use client";

import { useState, useTransition, ChangeEvent } from "react";
import {
  Search,
  Filter,
  Plus,
  MoreVertical,
  Pencil,
  Trash2,
} from "lucide-react";
import { format, isPast, isToday } from "date-fns";
import RegisterLoanModal, { type ArticleOption } from "./RegisterLoanModal";
import { eliminarPrestamo } from "@/app/(dashboard)/prestamos/actions";
import EditLoanModal from "./EditLoanModal";

export type Loan = {
  id: number;
  id_articulo: number;
  articulo_nombre: string;
  articulo_ubicacion: string;
  cantidad_prestada: number;
  destino_externo: string | null;
  responsable: string | null;
  autorizado_por: string | null;
  fecha_salida: Date;
  fecha_retorno_esperada: Date | null;
};

interface LoansTableProps {
  initialData: Loan[];
  articulosDisponibles: ArticleOption[];
  currentUser: { id: number; name: string; role: string };
  currentUserRole: string;
}

interface FilterState {
  estado: string;
  fecha_salida: string;
  fecha_retorno: string;
}

export default function LoansTable({
  initialData,
  articulosDisponibles,
  currentUser,
  currentUserRole,
}: LoansTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [menuOpenId, setMenuOpenId] = useState<number | null>(null);
  const [loanToEdit, setLoanToEdit] = useState<Loan | null>(null);
  const [isPending, startTransition] = useTransition();

  const esAdmin =
    currentUserRole === "Obispo" || currentUserRole === "Secretario";

  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    estado: "",
    fecha_salida: "",
    fecha_retorno: "",
  });

  const getLoanStatus = (returnDate: Date | null) => {
    if (!returnDate)
      return { text: "Indefinido", style: "bg-gray-100 text-gray-700" };
    if (isPast(returnDate) && !isToday(returnDate)) {
      return { text: "Atrasado", style: "bg-red-100 text-red-700" };
    }
    return { text: "En Tránsito", style: "bg-orange-100 text-orange-700" };
  };

  const handleFilterChange = (
    e: ChangeEvent<HTMLSelectElement | HTMLInputElement>,
  ) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const clearFilters = () =>
    setFilters({ estado: "", fecha_salida: "", fecha_retorno: "" });
  const activeFiltersCount = Object.values(filters).filter(
    (value) => value !== "",
  ).length;

  const filteredData = initialData.filter((loan) => {
    const matchesSearch =
      loan.articulo_nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      loan.responsable?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      loan.destino_externo?.toLowerCase().includes(searchTerm.toLowerCase());

    const statusObj = getLoanStatus(loan.fecha_retorno_esperada);
    const matchesEstado =
      filters.estado === "" || statusObj.text === filters.estado;

    const formattedSalida = format(loan.fecha_salida, "yyyy-MM-dd");
    const matchesSalida =
      filters.fecha_salida === "" || formattedSalida === filters.fecha_salida;

    const formattedRetorno = loan.fecha_retorno_esperada
      ? format(loan.fecha_retorno_esperada, "yyyy-MM-dd")
      : "";
    const matchesRetorno =
      filters.fecha_retorno === "" ||
      formattedRetorno === filters.fecha_retorno;

    return matchesSearch && matchesEstado && matchesSalida && matchesRetorno;
  });

  const formatDateUI = (dateInput: Date | string | null): string => {
    if (!dateInput) return "-";
    const d = new Date(dateInput);
    const dateLocalPure = new Date(
      d.getUTCFullYear(),
      d.getUTCMonth(),
      d.getUTCDate(),
    );
    return format(dateLocalPure, "dd 'de' MMM yyyy");
  };

  const handleEliminar = (id: number) => {
    if (
      confirm(
        "¿Está seguro de eliminar este registro? Se mantendrá en el historial de auditoría.",
      )
    ) {
      startTransition(() => {
        eliminarPrestamo(id);
      });
    }
    setMenuOpenId(null);
  };

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Préstamos Activos
          </h2>

          <div className="flex gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Buscar préstamo..."
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#111c2d] outline-none text-sm text-[#333333] bg-white"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="relative">
              <button
                onClick={() => setIsFilterMenuOpen(!isFilterMenuOpen)}
                className={`flex items-center gap-2 px-4 py-2 border rounded-lg transition-colors text-sm text-[#333333] font-medium ${activeFiltersCount > 0 ? "bg-blue-50 border-blue-200 text-blue-700" : "bg-white border-gray-200 hover:bg-gray-50"}`}
              >
                <Filter className="h-4 w-4" /> Filtrar
                {activeFiltersCount > 0 && (
                  <span className="bg-blue-600 text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full ml-1">
                    {activeFiltersCount}
                  </span>
                )}
              </button>

              {/* Popover del Menú de Filtros */}
              {isFilterMenuOpen && (
                <div className="absolute top-full right-0 mt-2 w-72 bg-white border border-gray-200 rounded-lg shadow-xl z-20 p-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-semibold text-gray-800 text-sm">
                      Filtrar Préstamos
                    </h3>
                    {activeFiltersCount > 0 && (
                      <button
                        onClick={clearFilters}
                        className="text-xs text-blue-600 hover:underline"
                      >
                        Limpiar todo
                      </button>
                    )}
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Estado
                      </label>
                      <select
                        name="estado"
                        value={filters.estado}
                        onChange={handleFilterChange}
                        className="w-full text-sm text-[#333333] border rounded-md p-1.5 outline-none focus:border-[#111c2d] bg-white"
                      >
                        <option value="">Cualquier estado</option>
                        <option value="En Tránsito">En Tránsito</option>
                        <option value="Atrasado">Atrasado</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Fecha de Salida
                      </label>
                      <input
                        type="date"
                        name="fecha_salida"
                        value={filters.fecha_salida}
                        onChange={handleFilterChange}
                        className="w-full text-sm text-[#333333] border rounded-md p-1.5 outline-none focus:border-[#111c2d]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Fecha de Retorno (Esperada)
                      </label>
                      <input
                        type="date"
                        name="fecha_retorno"
                        value={filters.fecha_retorno}
                        onChange={handleFilterChange}
                        className="w-full text-sm text-[#333333] border rounded-md p-1.5 outline-none focus:border-[#111c2d]"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={() => setIsModalOpen(true)}
              disabled={!esAdmin}
              className="flex items-center gap-2 px-4 py-2 bg-[#111c2d] text-white rounded-lg hover:bg-slate-800 text-sm font-medium disabled:cursor-not-allowed shadow-sm disabled:opacity-50 disabled:bg-gray-300"
            >
              <Plus className="h-4 w-4" /> Nuevo préstamo
            </button>
          </div>
        </div>

        {/* Tabla de Datos */}
        <div className="overflow-x-auto min-h-[400px]">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100 bg-gray-50/50">
                <th className="px-6 py-4">Artículo</th>
                <th className="px-6 py-4">Cant.</th>
                <th className="px-6 py-4">Destino Externo</th>
                <th className="px-6 py-4">Responsable</th>
                <th className="px-6 py-4">Autorizado Por</th>
                <th className="px-6 py-4">Fecha Salida</th>
                <th className="px-6 py-4">Retorno Esperado</th>
                <th className="px-6 py-4">Estado</th>
                <th className="px-6 py-4 text-center"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredData.length === 0 ? (
                <tr>
                  <td
                    colSpan={9}
                    className="px-6 py-12 text-center text-gray-500"
                  >
                    No se encontraron préstamos activos.
                  </td>
                </tr>
              ) : (
                filteredData.map((loan) => {
                  const status = getLoanStatus(loan.fecha_retorno_esperada);

                  return (
                    <tr
                      key={loan.id}
                      className="hover:bg-gray-50/50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <span className="font-semibold text-gray-900 text-sm">
                            {loan.articulo_nombre}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 font-medium">
                        {loan.cantidad_prestada}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {loan.destino_externo || "-"}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {loan.responsable || "-"}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {loan.autorizado_por || "-"}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {formatDateUI(loan.fecha_salida)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {formatDateUI(loan.fecha_retorno_esperada)}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wide ${status.style}`}
                        >
                          {status.text}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center relative">
                        <button
                          onClick={() =>
                            setMenuOpenId(
                              menuOpenId === loan.id ? null : loan.id,
                            )
                          }
                          className="text-gray-400 hover:text-gray-600 p-1 rounded hover:bg-gray-100 transition-colors"
                        >
                          <MoreVertical className="h-5 w-5" />
                        </button>

                        {menuOpenId === loan.id && (
                          <div className="absolute right-12 top-4 w-32 bg-white border rounded-lg shadow-xl z-20">
                            <button
                              onClick={() => {
                                setLoanToEdit(loan);
                                setMenuOpenId(null);
                              }}
                              disabled={!esAdmin}
                              className="w-full text-left px-4 py-2 text-sm text-[#333333] hover:bg-gray-50 flex items-center gap-2 disabled:cursor-not-allowed shadow-sm disabled:opacity-50 disabled:bg-gray-300"
                            >
                              <Pencil className="h-4 w-4" /> Editar
                            </button>
                            <button
                              onClick={() => handleEliminar(loan.id)}
                              disabled={!esAdmin}
                              className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 disabled:cursor-not-allowed shadow-sm disabled:opacity-50 disabled:bg-gray-300"
                            >
                              <Trash2 className="h-4 w-4" /> Eliminar
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
      <RegisterLoanModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        articulosDisponibles={articulosDisponibles}
        currentUser={currentUser}
      />
      <EditLoanModal
        key={loanToEdit?.id}
        loan={loanToEdit}
        onClose={() => setLoanToEdit(null)}
        articulos={articulosDisponibles}
      />
    </>
  );
}
