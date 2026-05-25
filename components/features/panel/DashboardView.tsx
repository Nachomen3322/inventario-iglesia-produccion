"use client";

import { useState, ChangeEvent } from "react";
import {
  Package,
  ArrowRightLeft,
  Wrench,
  CheckCircle2,
  AlertCircle,
  Search,
  Filter,
  Eye,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";
import type { SelectOption } from "../activos/RegisterAssetModal";
import type { Asset } from "../activos/AssetsTable";
import AssetDetailsModal from "../activos/AssetDetailsModal";

interface FilterState {
  categoria: string;
  ubicacion: string;
  estado: string;
}

export type RecentAsset = {
  id: number;
  nombre: string;
  cantidad: number;
  estado_fisico: string | null;
  estado_disponibilidad: string | null;
  categoria: string;
  id_categoria: number;
  ubicacion: string;
  id_ubicacion: number;
  cantidad_prestada: number | null;
};

interface DashboardViewProps {
  kpis: {
    totalActivos: number;
    articulosPrestados: number;
    necesitanReparacion: number;
    nivelConsumibles: string;
    consumiblesStatusColor: string;
  };
  recentAssets: RecentAsset[];
}

export default function DashboardView({
  kpis,
  recentAssets,
  categorias,
  ubicaciones,
}: DashboardViewProps & {
  categorias: SelectOption[];
  ubicaciones: SelectOption[];
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    categoria: "",
    ubicacion: "",
    estado: "",
  });

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);

  const filteredAssets = recentAssets.filter((asset) => {
    const matchesSearch =
      asset.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.id.toString().includes(searchTerm);

    const matchesCat =
      filters.categoria === "" || asset.categoria === filters.categoria;
    const matchesUbi =
      filters.ubicacion === "" || asset.ubicacion === filters.ubicacion;
    const matchesEstado =
      filters.estado === "" || asset.estado_disponibilidad === filters.estado;

    return matchesSearch && matchesCat && matchesUbi && matchesEstado;
  });

  const activeFiltersCount = Object.values(filters).filter(
    (v) => v !== "",
  ).length;

  const handleFilterChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setFilters({ categoria: "", ubicacion: "", estado: "" });
    setCurrentPage(1);
  };

  const totalPages = Math.max(
    1,
    Math.ceil(filteredAssets.length / itemsPerPage),
  );
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedAssets = filteredAssets.slice(
    startIndex,
    startIndex + itemsPerPage,
  );

  const nextPage = () =>
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  const prevPage = () => setCurrentPage((prev) => Math.max(prev - 1, 1));

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const getStatusColor = (status: string | null) => {
    switch (status?.toLowerCase()) {
      case "disponible":
        return "bg-green-100 text-green-700";
      case "prestado":
        return "bg-orange-100 text-orange-700";
      case "agotado":
      case "dado a baja":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <>
      <div className="flex flex-col h-full space-y-4 md:space-y-6">
        {/* SECCIÓN 1: Tarjetas KPI */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 shrink-0">
          <div className="bg-white p-5 md:p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-between">
            <div className="flex justify-between items-start mb-2 md:mb-4">
              <span className="text-sm font-medium text-gray-500">
                Total de activos
              </span>
              <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                <Package className="h-4 w-4 md:h-5 md:w-5" />
              </div>
            </div>
            <div className="text-2xl md:text-3xl font-bold text-gray-900">
              {kpis.totalActivos}
            </div>
            <div className="text-xs text-green-600 mt-2 font-medium">
              Activos en el sistema
            </div>
          </div>

          <div className="bg-white p-5 md:p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-between">
            <div className="flex justify-between items-start mb-2 md:mb-4">
              <span className="text-sm font-medium text-gray-500">
                Artículos prestados
              </span>
              <div className="p-2 bg-orange-50 text-orange-600 rounded-lg">
                <ArrowRightLeft className="h-4 w-4 md:h-5 md:w-5" />
              </div>
            </div>
            <div className="text-2xl md:text-3xl font-bold text-gray-900">
              {kpis.articulosPrestados}
            </div>
            <div className="text-xs text-gray-500 mt-1 md:mt-2">
              Préstamos activos actualmente
            </div>
          </div>

          <div className="bg-white p-5 md:p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-between">
            <div className="flex justify-between items-start mb-2 md:mb-4">
              <span className="text-sm font-medium text-gray-500">
                Necesitan reparación
              </span>
              <div className="p-2 bg-red-50 text-red-600 rounded-lg">
                <Wrench className="h-4 w-4 md:h-5 md:w-5" />
              </div>
            </div>
            <div className="text-2xl md:text-3xl font-bold text-gray-900">
              {kpis.necesitanReparacion}
            </div>
            <div className="text-xs text-red-500 mt-1 md:mt-2 font-medium">
              Se requiere acción (Dañados)
            </div>
          </div>

          <div className="bg-white p-5 md:p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-between">
            <div className="flex justify-between items-start mb-2 md:mb-4">
              <span className="text-sm font-medium text-gray-500">
                Nivel de consumibles
              </span>
              <div
                className={`p-2 rounded-lg ${kpis.nivelConsumibles === "Óptimo" ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"}`}
              >
                {kpis.nivelConsumibles === "Óptimo" ? (
                  <CheckCircle2 className="h-4 w-4 md:h-5 md:w-5" />
                ) : (
                  <AlertCircle className="h-4 w-4 md:h-5 md:w-5" />
                )}
              </div>
            </div>
            <div
              className={`text-lg md:text-xl font-bold mt-1  ${kpis.consumiblesStatusColor}`}
            >
              {kpis.nivelConsumibles}
            </div>
            <div className="text-xs text-gray-500 mt-1 md:mt-2">
              Estado global del stock
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col flex-1 min-h-[500px] md:min-h-0 mt-6 md:mt-0">
          <div className="p-4 md:p-5 border-b border-gray-200 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 shrink-0">
            <h2 className="text-base md:text-lg font-semibold text-gray-900">
              Actividad reciente de activos
            </h2>
            <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Buscar activo..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#111c2d] outline-none text-sm text-[#333333]"
                  value={searchTerm}
                  onChange={handleSearch}
                />
              </div>
              <div className="relative w-full sm:w-auto">
                <button
                  onClick={() => setIsFilterMenuOpen(!isFilterMenuOpen)}
                  className={`flex items-center gap-2 px-4 py-2 border rounded-lg transition-colors text-sm text-[#333333] font-medium
                  ${activeFiltersCount > 0 ? "bg-blue-50 border-blue-200 text-blue-700" : "bg-white hover:bg-gray-50"}`}
                >
                  <Filter className="h-4 w-4" />
                  Filtros
                  {activeFiltersCount > 0 && (
                    <span className="bg-blue-600 text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full ml-1">
                      {activeFiltersCount}
                    </span>
                  )}
                </button>

                {isFilterMenuOpen && (
                  <div className="absolute top-full right-0 mt-2 w-[calc(100vw-4rem)] sm:w-72 max-w-sm bg-white border border-gray-200 rounded-lg shadow-xl z-20 p-4">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="font-semibold text-gray-800 text-sm">
                        Filtrar actividad
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
                          Estado de Disponibilidad
                        </label>
                        <select
                          name="estado"
                          value={filters.estado}
                          onChange={handleFilterChange}
                          className="w-full text-sm text-[#333333] border rounded-md p-1.5 outline-none"
                        >
                          <option value="">Cualquier estado</option>
                          <option value="Disponible">Disponible</option>
                          <option value="Prestado">Prestado</option>
                          <option value="En Mantenimiento">
                            En Mantenimiento
                          </option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Tabla - Ocupa el espacio disponible pero no desborda */}
          <div className="flex-1 overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100 bg-gray-50/50">
                  <th className="px-6 py-4 whitespace-nowrap">
                    Detalles del Activo
                  </th>
                  <th className="px-6 py-4 whitespace-nowrap">Categoría</th>
                  <th className="px-6 py-4 whitespace-nowrap">Ubicación</th>
                  <th className="px-6 py-4 whitespace-nowrap">Estado</th>
                  <th className="px-6 py-4 whitespace-nowrap text-center">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paginatedAssets.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-12 text-center text-gray-500"
                    >
                      No hay activos para mostrar.
                    </td>
                  </tr>
                ) : (
                  paginatedAssets.map((asset) => (
                    <tr
                      key={asset.id}
                      className="hover:bg-gray-50/50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="font-semibold text-gray-900 text-sm">
                            {asset.nombre}
                          </div>
                          <div className="text-xs text-gray-400 font-mono mt-0.5">
                            #AF-{asset.id}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {asset.categoria}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {asset.ubicacion}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wide ${getStatusColor(asset.estado_disponibilidad)}`}
                        >
                          {asset.estado_disponibilidad || "Disponible"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <button
                          onClick={() => setSelectedAsset(asset as Asset)}
                          className="text-gray-400 hover:text-[#111c2d] p-1 rounded transition-colors"
                          title="Ver detalles del activo"
                        >
                          <Eye className="h-5 w-5 mx-auto" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="p-4 border-t border-gray-200 flex items-center justify-between bg-gray-50/50 shrink-0 rounded-b-xl">
            <span className="text-xs text-gray-500">
              Página{" "}
              <span className="font-semibold text-gray-900">{currentPage}</span>{" "}
              de{" "}
              <span className="font-semibold text-gray-900">{totalPages}</span>
              <span className="ml-1 md:ml-2 hidden sm:inline">
                ({filteredAssets.length} resultados)
              </span>
            </span>
            <div className="flex gap-2">
              <button
                onClick={prevPage}
                disabled={currentPage === 1}
                className="p-1.5 border border-gray-200 rounded bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={nextPage}
                disabled={currentPage === totalPages}
                className="p-1.5 border border-gray-200 rounded bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
      <AssetDetailsModal
        key={selectedAsset?.id}
        asset={selectedAsset}
        onClose={() => setSelectedAsset(null)}
      />
    </>
  );
}
