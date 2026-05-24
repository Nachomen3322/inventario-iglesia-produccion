"use client";

import { useState, useTransition } from "react";
import {
  CircleStackIcon,
  ArrowDownTrayIcon,
  TrashIcon,
  ArchiveBoxXMarkIcon,
  XMarkIcon,
  ArrowUturnLeftIcon,
} from "@heroicons/react/24/outline";
import {
  restaurarActivo,
  eliminarActivoPermanente,
  restaurarConsumible,
  eliminarConsumiblePermanente,
  restaurarPrestamo,
  eliminarPrestamoPermanente,
} from "@/actions/recycle-bin-actions";

export interface DeletedAsset {
  id_articulo: number;
  nombre: string;
}

export interface DeletedConsumable {
  id_consumible: number;
  nombre: string;
  cantidad: number;
}

export interface DeletedLoan {
  id_movimiento: number;
  articulo_nombre: string;
  responsable_externo: string | null;
}

interface DatabaseMaintenanceProps {
  currentUserRole: string;
  deletedAssets: DeletedAsset[];
  deletedConsumables: DeletedConsumable[];
  deletedLoans: DeletedLoan[];
}

// COMPONENTE AUXILIAR PARA MODAL
const RecycleBinModal = ({
  title,
  isOpen,
  onClose,
  children,
}: {
  title: string;
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl overflow-hidden relative flex flex-col max-h-[85vh]">
        <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <div className="flex items-center gap-3">
            <ArchiveBoxXMarkIcon className="w-6 h-6 text-red-600" />
            <h3 className="text-lg font-bold text-gray-900">{title}</h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-200 transition-colors"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>
        <div className="p-6 overflow-y-auto flex-1">{children}</div>
      </div>
    </div>
  );
};

export default function DatabaseMaintenance({
  currentUserRole,
  deletedAssets,
  deletedConsumables,
  deletedLoans,
}: DatabaseMaintenanceProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [isPending, startTransition] = useTransition();
  const esAdmin = currentUserRole === "Obispo";
  const [activeModal, setActiveModal] = useState<
    "activos" | "consumibles" | "prestamos" | null
  >(null);

  // MANEJADOR DE DESCARGA DE COPIA DE BASE DE DATOS
  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      window.location.href = "/api/backup";
    } catch (error) {
      console.error("Error al descargar:", error);
    } finally {
      setTimeout(() => setIsDownloading(false), 1500);
    }
  };

  // MANEJADORES DE PAPELERA
  const handleRestore = (
    type: "activo" | "consumible" | "prestamo",
    id: number,
  ) => {
    startTransition(async () => {
      if (type === "activo") await restaurarActivo(id);
      if (type === "consumible") await restaurarConsumible(id);
      if (type === "prestamo") await restaurarPrestamo(id);
    });
  };

  const handleHardDelete = (
    type: "activo" | "consumible" | "prestamo",
    id: number,
  ) => {
    const confirmMessage =
      "¿Está completamente seguro? Esta acción eliminará el registro de forma permanente y NO se puede deshacer.";
    if (!window.confirm(confirmMessage)) return;

    startTransition(async () => {
      if (type === "activo") await eliminarActivoPermanente(id);
      if (type === "consumible") await eliminarConsumiblePermanente(id);
      if (type === "prestamo") await eliminarPrestamoPermanente(id);
    });
  };

  return (
    <div className="space-y-8 mt-8">
      <section className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden mt-8">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">
            Mantenimiento de Base de Datos
          </h2>
          <p className="text-sm text-gray-500">
            Gestione las copias de seguridad de los registros o inventarios.
          </p>
        </div>

        <div className="p-6">
          <div className="flex items-center justify-between p-4 border border-gray-100 rounded-xl bg-gray-50/50">
            <div className="flex items-start gap-4">
              <div className="p-2.5 bg-gray-100 rounded-lg text-gray-500 border border-gray-200">
                <CircleStackIcon className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">
                  Copia de seguridad manual
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  Genere un archivo SQL con todos los registros actuales del
                  sistema.
                </p>
                {!esAdmin && (
                  <p className="text-xs font-medium text-red-500 mt-2">
                    * Permiso denegado.
                  </p>
                )}
              </div>
            </div>

            <button
              onClick={handleDownload}
              disabled={!esAdmin || isDownloading}
              className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 hover:text-gray-900 disabled:cursor-not-allowed shadow-sm disabled:opacity-50 disabled:bg-gray-300"
            >
              <ArrowDownTrayIcon className="w-4 h-4" />
              {isDownloading ? "Generando..." : "Generar copia"}
            </button>
          </div>
        </div>
      </section>

      {/* SECCIÓN 2: PAPELERA DE RECICLAJE */}
      {esAdmin && (
        <section className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex items-center gap-3">
            <TrashIcon className="w-6 h-6 text-gray-700" />
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Papelera de Reciclaje
              </h2>
              <p className="text-sm text-gray-500">
                Gestione los elementos dados de baja.
              </p>
            </div>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <button
                onClick={() => setActiveModal("activos")}
                className="relative flex flex-col items-center justify-center p-6 border border-gray-200 rounded-xl bg-gray-50/50 hover:bg-red-50/50 hover:border-red-200 transition-all group"
              >
                {deletedAssets.length > 0 && (
                  <span className="absolute -top-3 -right-3 flex h-7 w-7 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white shadow-sm ring-4 ring-white">
                    {deletedAssets.length}
                  </span>
                )}
                <ArchiveBoxXMarkIcon className="w-10 h-10 text-gray-400 group-hover:text-red-500 transition-colors mb-3" />
                <span className="font-semibold text-gray-700 group-hover:text-red-700">
                  Activos Fijos
                </span>
              </button>

              <button
                onClick={() => setActiveModal("consumibles")}
                className="relative flex flex-col items-center justify-center p-6 border border-gray-200 rounded-xl bg-gray-50/50 hover:bg-red-50/50 hover:border-red-200 transition-all group"
              >
                {deletedConsumables.length > 0 && (
                  <span className="absolute -top-3 -right-3 flex h-7 w-7 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white shadow-sm ring-4 ring-white">
                    {deletedConsumables.length}
                  </span>
                )}
                <ArchiveBoxXMarkIcon className="w-10 h-10 text-gray-400 group-hover:text-red-500 transition-colors mb-3" />
                <span className="font-semibold text-gray-700 group-hover:text-red-700">
                  Consumibles
                </span>
              </button>

              <button
                onClick={() => setActiveModal("prestamos")}
                className="relative flex flex-col items-center justify-center p-6 border border-gray-200 rounded-xl bg-gray-50/50 hover:bg-red-50/50 hover:border-red-200 transition-all group"
              >
                {deletedLoans.length > 0 && (
                  <span className="absolute -top-3 -right-3 flex h-7 w-7 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white shadow-sm ring-4 ring-white">
                    {deletedLoans.length}
                  </span>
                )}
                <ArchiveBoxXMarkIcon className="w-10 h-10 text-gray-400 group-hover:text-red-500 transition-colors mb-3" />
                <span className="font-semibold text-gray-700 group-hover:text-red-700">
                  Préstamos
                </span>
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Modal activos */}
      <RecycleBinModal
        title="Papelera: Activos Fijos"
        isOpen={activeModal === "activos"}
        onClose={() => setActiveModal(null)}
      >
        {deletedAssets.length === 0 ? (
          <p className="text-center text-gray-500 py-8">
            La papelera de activos está vacía.
          </p>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-xs font-bold text-gray-400 uppercase border-b border-gray-200 bg-gray-50">
                <th className="px-4 py-3 rounded-tl-lg">ID</th>
                <th className="px-4 py-3">Nombre del Activo</th>
                <th className="px-4 py-3 text-right rounded-tr-lg">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {deletedAssets.map((item) => (
                <tr
                  key={item.id_articulo}
                  className={`hover:bg-gray-50 ${isPending ? "opacity-50" : ""}`}
                >
                  <td className="px-4 py-3 text-sm text-gray-500 font-mono">
                    #{item.id_articulo}
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">
                    {item.nombre}
                  </td>
                  <td className="px-4 py-3 flex justify-end gap-2">
                    <button
                      onClick={() => handleRestore("activo", item.id_articulo)}
                      disabled={isPending}
                      className="p-2 text-green-600 bg-green-50 hover:bg-green-100 rounded-md transition-colors"
                      title="Restaurar"
                    >
                      <ArrowUturnLeftIcon className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() =>
                        handleHardDelete("activo", item.id_articulo)
                      }
                      disabled={!esAdmin || isPending}
                      className="p-2 text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors disabled:opacity-50"
                      title="Eliminar permanentemente"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </RecycleBinModal>

      {/* Modal Consumibles */}
      <RecycleBinModal
        title="Papelera: Consumibles"
        isOpen={activeModal === "consumibles"}
        onClose={() => setActiveModal(null)}
      >
        {deletedConsumables.length === 0 ? (
          <p className="text-center text-gray-500 py-8">
            La papelera de consumibles está vacía.
          </p>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-xs font-bold text-gray-400 uppercase border-b border-gray-200 bg-gray-50">
                <th className="px-4 py-3 rounded-tl-lg">ID</th>
                <th className="px-4 py-3">Consumible</th>
                <th className="px-4 py-3 text-right rounded-tr-lg">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {deletedConsumables.map((item) => (
                <tr
                  key={item.id_consumible}
                  className={`hover:bg-gray-50 ${isPending ? "opacity-50" : ""}`}
                >
                  <td className="px-4 py-3 text-sm text-gray-500 font-mono">
                    #{item.id_consumible}
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">
                    {item.nombre}{" "}
                    <span className="text-gray-400 font-normal">
                      ({item.cantidad} uds)
                    </span>
                  </td>
                  <td className="px-4 py-3 flex justify-end gap-2">
                    <button
                      onClick={() =>
                        handleRestore("consumible", item.id_consumible)
                      }
                      disabled={isPending}
                      className="p-2 text-green-600 bg-green-50 hover:bg-green-100 rounded-md transition-colors"
                      title="Restaurar"
                    >
                      <ArrowUturnLeftIcon className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() =>
                        handleHardDelete("consumible", item.id_consumible)
                      }
                      disabled={!esAdmin || isPending}
                      className="p-2 text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors disabled:opacity-50"
                      title="Eliminar permanentemente"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </RecycleBinModal>

      {/* Modal Préstamos */}
      <RecycleBinModal
        title="Papelera: Préstamos"
        isOpen={activeModal === "prestamos"}
        onClose={() => setActiveModal(null)}
      >
        {deletedLoans.length === 0 ? (
          <p className="text-center text-gray-500 py-8">
            La papelera de préstamos está vacía.
          </p>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-xs font-bold text-gray-400 uppercase border-b border-gray-200 bg-gray-50">
                <th className="px-4 py-3 rounded-tl-lg">ID</th>
                <th className="px-4 py-3">Detalle del Préstamo</th>
                <th className="px-4 py-3 text-right rounded-tr-lg">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {deletedLoans.map((item) => (
                <tr
                  key={item.id_movimiento}
                  className={`hover:bg-gray-50 ${isPending ? "opacity-50" : ""}`}
                >
                  <td className="px-4 py-3 text-sm text-gray-500 font-mono">
                    #{item.id_movimiento}
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">
                    {item.articulo_nombre} <br />
                    <span className="text-xs font-normal text-gray-500">
                      Resp: {item.responsable_externo}
                    </span>
                  </td>
                  <td className="px-4 py-3 flex justify-end gap-2">
                    <button
                      onClick={() =>
                        handleRestore("prestamo", item.id_movimiento)
                      }
                      disabled={isPending}
                      className="p-2 text-green-600 bg-green-50 hover:bg-green-100 rounded-md transition-colors"
                      title="Restaurar"
                    >
                      <ArrowUturnLeftIcon className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() =>
                        handleHardDelete("prestamo", item.id_movimiento)
                      }
                      disabled={!esAdmin || isPending}
                      className="p-2 text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors disabled:opacity-50"
                      title="Eliminar permanentemente"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </RecycleBinModal>
    </div>
  );
}
