"use client";

import {
  X,
  Package,
  MapPin,
  Tag,
  ClipboardList,
  Activity,
  Hash,
} from "lucide-react";
import type { Asset } from "./AssetsTable";

interface AssetDetailsModalProps {
  asset: Asset | null;
  onClose: () => void;
}

export default function AssetDetailsModal({
  asset,
  onClose,
}: AssetDetailsModalProps) {
  if (!asset) return null;

  const getStatusColor = (status: string | null) => {
    switch (status?.toLowerCase()) {
      case "nuevo":
        return "bg-yellow-100 text-yellow-700";
      case "bueno":
        return "bg-green-100 text-green-700";
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

  const totalUnits = asset.cantidad;
  const loanedUnits = asset.cantidad_prestada || 0;
  const remainingUnits = Math.max(0, totalUnits - loanedUnits);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden relative flex flex-col max-h-[90vh]">
        {/* Cabecera del Modal */}
        <div className="bg-slate-50 px-6 py-5 md:px-8 md:py-6 border-b border-gray-100 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-4">
            <div className="p-2 md:p-3 bg-white rounded-xl shadow-sm border border-gray-100 hidden sm:block">
              <Package className="h-6 w-6 text-slate-700" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">
                {asset.nombre}
              </h3>
              <p className="text-sm text-gray-500 font-mono">#AF-{asset.id}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Contenido del Detalle */}
        <div className="p-6 md:p-8 overflow-y-auto custom-scrollbar flex-1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            <div className="space-y-6">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest border-b pb-2">
                Especificaciones
              </h4>

              <div className="flex items-start gap-3">
                <Tag className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500">Categoría</p>
                  <p className="text-sm font-semibold text-gray-800">
                    {asset.categoria}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Hash className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500">
                    Cantidad Total Registrada
                  </p>
                  <p className="text-sm font-semibold text-gray-800">
                    {totalUnits} unidades
                  </p>
                  {asset.estado_disponibilidad?.toLowerCase() ===
                    "prestado" && (
                    <div className="mt-3 p-3 bg-orange-50/70 border border-orange-100 rounded-xl grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-1 duration-200">
                      <div>
                        <p className="text-[11px] font-semibold text-orange-700 uppercase tracking-wider">
                          Prestadas
                        </p>
                        <p className="text-base font-bold text-gray-900 mt-0.5">
                          {loanedUnits} uds
                        </p>
                      </div>
                      <div className="border-l border-orange-200/60 pl-4">
                        <p className="text-[11px] font-semibold text-green-700 uppercase tracking-wider">
                          Restantes
                        </p>
                        <p className="text-base font-bold text-gray-900 mt-0.5">
                          {remainingUnits} uds
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500">Ubicación Interna</p>
                  <p className="text-sm font-semibold text-gray-800">
                    {asset.ubicacion}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest border-b pb-2">
                Estado Actual
              </h4>

              <div className="flex items-start gap-3">
                <ClipboardList className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500 mb-1">Estado Físico</p>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(asset.estado_fisico)}`}
                  >
                    {asset.estado_fisico}
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Activity className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500 mb-1">Disponibilidad</p>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(asset.estado_disponibilidad)}`}
                  >
                    {asset.estado_disponibilidad}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Sección de Código QR (en caso de aplicarlo en un futuro) */}
          <div className="mt-8 md:mt-10 p-5 md:p-6 bg-slate-50 rounded-xl border border-dashed flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-center sm:text-left">
              <p className="text-sm font-bold text-gray-900">
                Identificador Único (QR)
              </p>
              <p className="text-xs text-gray-500">
                Utilice este código para inventarios rápidos y auditorías.
              </p>
            </div>
            <div className="h-16 w-16 bg-white border flex items-center justify-center text-[10px] text-gray-300 font-bold shrink-0">
              QR CODE
            </div>
          </div>
        </div>

        {/* Pie del Modal */}
        <div className="px-6 py-4 md:px-8 bg-gray-50 border-t border-gray-100 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-slate-800 text-white text-sm font-medium rounded-lg hover:bg-slate-700 transition-colors shadow-sm"
          >
            Cerrar vista
          </button>
        </div>
      </div>
    </div>
  );
}
