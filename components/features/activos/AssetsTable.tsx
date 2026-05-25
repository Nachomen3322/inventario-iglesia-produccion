"use client";

import { useState, useTransition, ChangeEvent } from "react";
import { darDeBajaActivo } from "@/app/(dashboard)/activos/actions";
import RegisterAssetModal, { type SelectOption } from "./RegisterAssetModal";
import {
  Search,
  Filter,
  Plus,
  Eye,
  Pencil,
  Trash2,
  AlertTriangle,
} from "lucide-react";
import EditAssetModal from "./EditAssetModal";
import AssetDetailsModal from "./AssetDetailsModal";

export type Asset = {
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

interface AssetsTableProps {
  initialData: Asset[];
  totalItems: number;
  categorias: SelectOption[];
  ubicaciones: SelectOption[];
  currentUserRole: string;
}

interface FilterState {
  categoria: string;
  ubicacion: string;
  estado_fisico: string;
  estado_disponibilidad: string;
}

export default function AssetsTable({
  initialData,
  totalItems,
  categorias,
  ubicaciones,
  currentUserRole,
}: AssetsTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isPending, startTransition] = useTransition();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    categoria: "",
    ubicacion: "",
    estado_fisico: "",
    estado_disponibilidad: "",
  });
  const [assetToEdit, setAssetToEdit] = useState<Asset | null>(null);
  const [assetToShowDetails, setAssetToShowDetails] = useState<Asset | null>(
    null,
  );
  const [assetWithWarning, setAssetWithWarning] = useState<Asset | null>(null);
  const esAdmin =
    currentUserRole === "Obispo" || currentUserRole === "Secretario";

  const filteredData = initialData.filter((asset) => {
    const matchesSearch =
      asset.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.id.toString().includes(searchTerm);
    asset.cantidad.toString().includes(searchTerm);

    const matchesCategoria =
      filters.categoria === "" || asset.categoria === filters.categoria;
    const matchesUbicacion =
      filters.ubicacion === "" || asset.ubicacion === filters.ubicacion;
    const matchesEstado =
      filters.estado_fisico === "" ||
      asset.estado_fisico === filters.estado_fisico;
    const matchesDisponibilidad =
      filters.estado_disponibilidad === "" ||
      asset.estado_disponibilidad === filters.estado_disponibilidad;

    return (
      matchesSearch &&
      matchesCategoria &&
      matchesUbicacion &&
      matchesEstado &&
      matchesDisponibilidad
    );
  });

  const handleEditClick = (asset: Asset) => {
    if (asset.estado_disponibilidad?.toLowerCase() === "prestado") {
      setAssetWithWarning(asset);
    } else {
      setAssetToEdit(asset);
    }
  };

  const handleContinueAnyway = () => {
    if (assetWithWarning) {
      setAssetToEdit(assetWithWarning);
      setAssetWithWarning(null);
    }
  };

  const handleFilterChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const clearFilters = () => {
    setFilters({
      categoria: "",
      ubicacion: "",
      estado_fisico: "",
      estado_disponibilidad: "",
    });
  };

  const handleDarDeBaja = (id: number) => {
    if (
      confirm(
        "¿Estás seguro de dar de baja este activo? Esta acción conservará el historial pero lo quitará del inventario activo.",
      )
    ) {
      startTransition(async () => {
        const result = await darDeBajaActivo(id);
        if (!result.success) alert(result.message);
      });
    }
  };

  const activeFiltersCount = Object.values(filters).filter(
    (value) => value !== "",
  ).length;

  const getStatusColor = (status: string | null) => {
    switch (status?.toLowerCase()) {
      case "nuevo":
        return "bg-green-100 text-green-700";
      case "bueno":
        return "bg-gray-100 text-gray-700";
      case "dañado":
        return "bg-red-100 text-red-700";
      case "disponible":
        return "bg-blue-100 text-blue-700";
      case "prestado":
        return "bg-orange-100 text-orange-700";
      case "en mantenimiento":
        return "bg-purple-100 text-orange-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col flex-1 min-h-[500px] md:min-h-0">
        <div className="p-4 md:p-6 border-b border-gray-200 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 shrink-0">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-semibold text-gray-800">
                Inventario de activos fijos
              </h2>
              <span className="bg-gray-100 text-gray-500 text-xs px-2 py-1 rounded-full">
                {totalItems} elementos
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Buscar activo fijo..."
                className="w-full pl-10 pr-4 py-2 text-[#333333] border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="relative w-full sm:w-auto">
              <button
                onClick={() => setIsFilterMenuOpen(!isFilterMenuOpen)}
                className={`flex items-center gap-2 px-4 py-2 border rounded-lg transition-colors text-sm font-medium
                  ${activeFiltersCount > 0 ? "bg-blue-50 border-blue-200 text-blue-700" : "hover:bg-gray-50 text-gray-700"}`}
              >
                <Filter className="h-4 w-4" />
                Filtros
                {activeFiltersCount > 0 && (
                  <span className="bg-blue-600 text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full ml-1">
                    {activeFiltersCount}
                  </span>
                )}
              </button>

              {/* Menú Desplegable de Filtros */}
              {isFilterMenuOpen && (
                <div className="absolute top-full right-0 mt-2 w-[calc(100vw-2rem)] sm:w-72 max-w-sm bg-white border rounded-lg shadow-xl z-20 p-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-semibold text-gray-800 text-sm">
                      Filtrar inventario
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

                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-[#333333] mb-1">
                        Categoría
                      </label>
                      <select
                        name="categoria"
                        value={filters.categoria}
                        onChange={handleFilterChange}
                        className="w-full text-sm text-[#333333] border rounded-md p-1.5 outline-none focus:border-blue-500"
                      >
                        <option value="">Todas las categorías</option>
                        {categorias.map((c) => (
                          <option key={`cat-${c.id}`} value={c.nombre}>
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
                        className="w-full text-sm text-[#333333] border rounded-md p-1.5 outline-none focus:border-blue-500"
                      >
                        <option value="">Todas las ubicaciones</option>
                        {ubicaciones.map((u) => (
                          <option key={`ubi-${u.id}`} value={u.nombre}>
                            {u.nombre}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Estado Físico
                      </label>
                      <select
                        name="estado_fisico"
                        value={filters.estado_fisico}
                        onChange={handleFilterChange}
                        className="w-full text-sm text-[#333333] border rounded-md p-1.5 outline-none focus:border-blue-500"
                      >
                        <option value="">Cualquier estado</option>
                        <option value="Nuevo">Nuevo</option>
                        <option value="Bueno">Bueno</option>
                        <option value="Dañado">Dañado</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Disponibilidad
                      </label>
                      <select
                        name="estado_disponibilidad"
                        value={filters.estado_disponibilidad}
                        onChange={handleFilterChange}
                        className="w-full text-sm text-[#333333] border rounded-md p-1.5 outline-none focus:border-blue-500"
                      >
                        <option value="">Cualquier estado</option>
                        <option value="Disponible">Disponible</option>
                        <option value="En Mantenimiento">
                          En Mantenimiento
                        </option>
                        <option value="Prestado">Prestado</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={() => setIsModalOpen(true)}
              disabled={!esAdmin}
              className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 ml-auto text-sm font-medium disabled:cursor-not-allowed shadow-sm disabled:opacity-50 disabled:bg-gray-300"
            >
              <Plus className="h-4 w-4" /> Registrar activo
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100 bg-gray-50/50">
                <th className="px-6 py-4">Nombre del artículo</th>
                <th className="px-6 py-4">Cantidad</th>
                <th className="px-6 py-4">Categoría</th>
                <th className="px-6 py-4">Ubicación Interna</th>
                <th className="px-6 py-4">Estado Físico</th>
                <th className="px-6 py-4">Disponibilidad</th>
                <th className="px-6 py-4 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredData.map((asset) => (
                <tr
                  key={asset.id}
                  className={`hover:bg-gray-50 ${isPending ? "opacity-50" : ""}`}
                >
                  <td className="px-6 py-4 font-medium text-gray-900">
                    {asset.nombre}
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-900">
                    {asset.cantidad}
                  </td>
                  <td className="px-6 py-4 text-gray-600">{asset.categoria}</td>
                  <td className="px-6 py-4 text-gray-600">{asset.ubicacion}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(asset.estado_fisico)}`}
                    >
                      {asset.estado_fisico}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-4 py-1 rounded-full text-[11px] font-bold tracking-wide ${getStatusColor(asset.estado_disponibilidad)}`}
                    >
                      {asset.estado_disponibilidad}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center items-center gap-3">
                      <button
                        onClick={() => setAssetToShowDetails(asset)}
                        className="text-gray-400 hover:text-blue-600 transition-colors"
                        title="Ver detalle"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleEditClick(asset)}
                        disabled={!esAdmin}
                        className="text-gray-400 hover:text-blue-600 disabled:cursor-not-allowed shadow-sm disabled:opacity-50 disabled:bg-gray-300"
                        title="Editar Activo"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>

                      <button
                        onClick={() => handleDarDeBaja(asset.id)}
                        disabled={
                          isPending ||
                          !esAdmin ||
                          asset?.estado_disponibilidad?.toLowerCase() ===
                            "prestado"
                        }
                        className="flex items-center gap-1 text-red-500 border border-red-200 hover:bg-red-50 px-2 py-1 rounded text-xs transition-colors disabled:cursor-not-allowed shadow-sm disabled:opacity-50 disabled:bg-gray-300"
                        title="Dar de Baja"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-4 border-t flex items-center justify-between text-sm text-gray-500 bg-gray-50 rounded-b-lg">
          <span>
            Mostrando {filteredData.length} de {totalItems} activos en total
          </span>
        </div>
      </div>

      {assetWithWarning && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 relative animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 mb-4 text-orange-600">
              <div className="p-2 bg-orange-100 rounded-full">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">ADVERTENCIA!</h3>
            </div>

            <p className="text-gray-600 text-sm mb-6 leading-relaxed">
              El articulo{" "}
              <strong className="text-gray-900">
                {assetWithWarning.nombre}
              </strong>{" "}
              actualmente tiene un registro de préstamo activo. Modificar sus
              características de forma manual podría causar inconsistencias en
              el inventario.
            </p>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
              <button
                onClick={() => setAssetWithWarning(null)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Aceptar
              </button>
              <button
                onClick={handleContinueAnyway}
                className="px-4 py-2 text-sm font-medium text-white bg-orange-600 rounded-lg hover:bg-orange-700 transition-colors shadow-sm"
              >
                Continuar de todos modos
              </button>
            </div>
          </div>
        </div>
      )}
      {/* RENDERIZACION DEL MODAL DE REGISTRAR */}
      <RegisterAssetModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        categorias={categorias}
        ubicaciones={ubicaciones}
      />

      {/* RENDERIZACION DEL MODAL DE EDICIÓN */}
      <EditAssetModal
        key={assetToEdit?.id}
        assetToEdit={assetToEdit}
        onClose={() => setAssetToEdit(null)}
        categorias={categorias}
        ubicaciones={ubicaciones}
      />

      {/* RENDERIZADO DEL MODAL DE DETALLES */}
      <AssetDetailsModal
        key={assetToShowDetails?.id}
        asset={assetToShowDetails}
        onClose={() => setAssetToShowDetails(null)}
      />
    </>
  );
}
