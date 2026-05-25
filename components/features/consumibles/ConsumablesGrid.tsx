"use client";

import { useState, useTransition, ChangeEvent } from "react";
import {
  Search,
  Filter,
  Plus,
  Minus,
  Check,
  Pencil,
  Trash2,
} from "lucide-react";
import {
  actualizarStock,
  darDeBajaConsumible,
} from "@/app/(dashboard)/consumibles/actions";
import RegisterConsumableModal, {
  type SelectOption,
} from "./RegisterConsumableModal";
import EditConsumableModal from "./EditConsumableModal";

export type Consumable = {
  id: number;
  nombre: string;
  cantidad: number;
  stock_minimo: number;
  unidad_medida: string | null;
  categoria: string;
  id_categoria: number;
  ubicacion: string;
  id_ubicacion: number;
};

interface ConsumablesGridProps {
  initialData: Consumable[];
  categorias: SelectOption[];
  ubicaciones: SelectOption[];
  currentUserRole: string;
}

interface FilterState {
  categoria: string;
  ubicacion: string;
  estado_stock: string;
}

export default function ConsumablesGrid({
  initialData,
  categorias,
  ubicaciones,
  currentUserRole,
}: ConsumablesGridProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isPending, startTransition] = useTransition();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [consumableToEdit, setConsumableToEdit] = useState<Consumable | null>(
    null,
  );
  const [draftStocks, setDraftStocks] = useState<Record<number, number>>({});
  const esAdmin =
    currentUserRole === "Obispo" || currentUserRole === "Secretario";

  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    categoria: "",
    ubicacion: "",
    estado_stock: "",
  });

  const handleLocalStockChange = (
    id: number,
    currentBaseStock: number,
    change: number,
  ) => {
    setDraftStocks((prev) => {
      const currentDraft = prev[id] !== undefined ? prev[id] : currentBaseStock;
      const newStock = currentDraft + change;

      if (newStock < 0) return prev;

      if (newStock === currentBaseStock) {
        const newState = { ...prev };
        delete newState[id];
        return newState;
      }

      return { ...prev, [id]: newStock };
    });
  };

  const handleCommitStock = (id: number) => {
    const newStock = draftStocks[id];
    if (newStock === undefined) return;

    startTransition(async () => {
      const result = await actualizarStock(id, newStock);
      if (result.success) {
        setDraftStocks((prev) => {
          const newState = { ...prev };
          delete newState[id];
          return newState;
        });
      }
    });
  };

  const handleDelete = (id: number) => {
    if (confirm("¿Estás seguro de eliminar este consumible?")) {
      startTransition(() => {
        darDeBajaConsumible(id);
      });
    }
  };

  const handleFilterChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const clearFilters = () =>
    setFilters({ categoria: "", ubicacion: "", estado_stock: "" });
  const activeFiltersCount = Object.values(filters).filter(
    (value) => value !== "",
  ).length;

  const filteredData = initialData.filter((item) => {
    const matchesSearch = item.nombre
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesCat =
      filters.categoria === "" || item.categoria === filters.categoria;
    const matchesUbi =
      filters.ubicacion === "" || item.ubicacion === filters.ubicacion;

    let itemStatus = "Optimo";
    if (item.cantidad === 0) itemStatus = "Agotado";
    else if (item.cantidad <= item.stock_minimo) itemStatus = "Stock Bajo";

    const matchesStock =
      filters.estado_stock === "" || itemStatus === filters.estado_stock;

    return matchesSearch && matchesCat && matchesUbi && matchesStock;
  });

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col flex-1 min-h-[500px] md:min-h-0">
        {/* Toolbar */}
        <div className="p-4 md:p-6 border-b border-gray-200 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 shrink-0">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-semibold text-gray-800">
              Inventario de Consumibles
            </h2>
            <span className="bg-gray-100 text-gray-500 text-xs px-2 py-1 rounded-full">
              {filteredData.length} items
            </span>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#333333] h-4 w-4" />
              <input
                type="text"
                placeholder="Buscar artículo..."
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#111c2d] outline-none text-sm text-[#333333]"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Menú de Filtros */}
            <div className="relative w-full sm:w-auto">
              <button
                onClick={() => setIsFilterMenuOpen(!isFilterMenuOpen)}
                className={`flex items-center gap-2 px-4 py-2 border rounded-lg transition-colors text-sm text-[#333333] font-medium ${activeFiltersCount > 0 ? "bg-blue-50 border-blue-200 text-blue-700" : "bg-white hover:bg-gray-50"}`}
              >
                <Filter className="h-4 w-4" /> Filtrar
                {activeFiltersCount > 0 && (
                  <span className="bg-blue-600 text-[#333333] text-[10px] w-4 h-4 flex items-center justify-center rounded-full ml-1">
                    {activeFiltersCount}
                  </span>
                )}
              </button>

              {isFilterMenuOpen && (
                <div className="absolute top-full right-0 mt-2 w-[calc(100vw-2rem)] sm:w-72 max-w-sm bg-white border rounded-lg shadow-xl z-20 p-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-semibold text-gray-800 text-sm">
                      Filtrar consumibles
                    </h3>
                    {activeFiltersCount > 0 && (
                      <button
                        onClick={clearFilters}
                        className="text-xs text-blue-600 hover:underline"
                      >
                        Limpiar
                      </button>
                    )}
                  </div>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Categoría
                      </label>
                      <select
                        name="categoria"
                        value={filters.categoria}
                        onChange={handleFilterChange}
                        className="w-full text-sm text-[#333333] border rounded-md p-1.5 outline-none"
                      >
                        <option value="">Todas</option>
                        {categorias.map((c) => (
                          <option key={c.id} value={c.nombre}>
                            {c.nombre}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Ubicación
                      </label>
                      <select
                        name="ubicacion"
                        value={filters.ubicacion}
                        onChange={handleFilterChange}
                        className="w-full text-sm text-[#333333] border rounded-md p-1.5 outline-none"
                      >
                        <option value="">Todas</option>
                        {ubicaciones.map((u) => (
                          <option key={u.id} value={u.nombre}>
                            {u.nombre}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Estado de Stock
                      </label>
                      <select
                        name="estado_stock"
                        value={filters.estado_stock}
                        onChange={handleFilterChange}
                        className="w-full text-sm text-[#333333] border rounded-md p-1.5 outline-none"
                      >
                        <option value="">Cualquier estado</option>
                        <option value="Optimo">Óptimo</option>
                        <option value="Stock Bajo">Stock Bajo</option>
                        <option value="Agotado">Agotado</option>
                      </select>
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
              <Plus className="h-4 w-4" /> Nuevo artículo
            </button>
          </div>
        </div>

        {/* Grid de Tarjetas */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredData.map((item) => {
            const hasPendingChanges = draftStocks[item.id] !== undefined;
            const displayQty = hasPendingChanges
              ? draftStocks[item.id]
              : item.cantidad;
            let statusText = "Óptimo";
            let statusColor = "bg-green-100 text-green-700";
            let progressColor = "bg-green-600";

            if (displayQty === 0) {
              statusText = "Agotado";
              statusColor = "bg-red-100 text-red-700";
              progressColor = "bg-gray-200";
            } else if (item.cantidad <= item.stock_minimo) {
              statusText = "Stock Bajo";
              statusColor = "bg-orange-100 text-orange-700";
              progressColor = "bg-orange-500";
            }

            const maxExpected = item.stock_minimo * 3 || 100;
            const progressWidth =
              displayQty === 0
                ? 0
                : Math.min(100, (displayQty / maxExpected) * 100);

            return (
              <div
                key={item.id}
                className={`bg-white p-5 rounded-xl border border-gray-100 shadow-sm transition-opacity ${isPending ? "opacity-70" : "opacity-100"}`}
              >
                {/* Cabecera de la tarjeta (Sin imagen) */}
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {item.nombre}
                    </h3>
                    <p className="text-sm text-gray-500 mt-0.5">
                      {item.ubicacion}
                    </p>
                  </div>
                  <span
                    className={`px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wide ${statusColor}`}
                  >
                    {statusText}
                  </span>
                </div>

                {/* Información de Stock y Barra */}
                <div className="mb-6">
                  <div className="flex justify-between items-end mb-2">
                    <span className="font-bold text-gray-900">
                      {displayQty}{" "}
                      <span className="text-sm font-normal text-gray-500">
                        {item.unidad_medida}
                      </span>
                    </span>
                    <span className="text-xs text-gray-400">
                      Mínimo: {item.stock_minimo}
                    </span>
                  </div>
                  {/* Barra de Progreso */}
                  <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${progressColor}`}
                      style={{ width: `${progressWidth}%` }}
                    />
                  </div>
                </div>

                {/* Controles de Incremento/Decremento */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() =>
                        handleLocalStockChange(item.id, item.cantidad, -1)
                      }
                      disabled={isPending || displayQty === 0 || !esAdmin}
                      className="w-8 h-8 flex items-center justify-center rounded border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm disabled:bg-gray-300"
                    >
                      <Minus className="h-4 w-4" />
                    </button>

                    <span className="w-8 text-center font-medium text-gray-900 text-sm">
                      {displayQty}
                    </span>

                    <button
                      onClick={() =>
                        handleLocalStockChange(item.id, item.cantidad, 1)
                      }
                      disabled={isPending || !esAdmin}
                      className="w-8 h-8 flex items-center justify-center rounded border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm disabled:bg-gray-300"
                    >
                      <Plus className="h-4 w-4" />
                    </button>

                    {/* Botón de Check (Guardar) que aparece solo si hay cambios en el borrador */}
                    {hasPendingChanges && (
                      <button
                        onClick={() => handleCommitStock(item.id)}
                        disabled={isPending || !esAdmin}
                        title="Guardar cambios de stock"
                        className="w-8 h-8 flex items-center justify-center rounded bg-green-100 text-green-700 hover:bg-green-200 transition-colors disabled:cursor-not-allowed shadow-sm disabled:opacity-50 disabled:bg-gray-300"
                      >
                        <Check className="h-4 w-4" />
                      </button>
                    )}
                  </div>

                  {/* Acciones Reemplazadas: Editar y Eliminar */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setConsumableToEdit(item)}
                      disabled={!esAdmin}
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors disabled:cursor-not-allowed shadow-sm disabled:opacity-50 disabled:bg-gray-300"
                      title="Editar"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      disabled={!esAdmin}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors disabled:cursor-not-allowed shadow-sm disabled:opacity-50 disabled:bg-gray-300"
                      title="Eliminar"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredData.length === 0 && (
          <div className="text-center py-12 text-gray-500 bg-white rounded-xl border border-gray-100">
            No se encontraron artículos que coincidan con la búsqueda.
          </div>
        )}
      </div>
      <RegisterConsumableModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        categorias={categorias}
        ubicaciones={ubicaciones}
      />
      <EditConsumableModal
        key={consumableToEdit?.id}
        consumableToEdit={consumableToEdit}
        onClose={() => setConsumableToEdit(null)}
        categorias={categorias}
        ubicaciones={ubicaciones}
      />
    </>
  );
}
