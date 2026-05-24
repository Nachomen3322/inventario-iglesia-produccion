"use client";

import { useState } from "react";
import {
  Search,
  Calendar,
  Download,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  X,
  FileSpreadsheet,
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export type AuditLog = {
  id_log: number;
  accion_realizada: string;
  fecha_hora: Date | string;
  direccion_ip: string | null;
  nombre_usuario: string;
  nombre_rol: string;
};

interface AuditTableProps {
  initialData: AuditLog[];
  currentUserRole: string;
}

const isWithinDateRange = (
  dateInput: Date | string,
  startStr: string,
  endStr: string,
) => {
  if (!startStr && !endStr) return true;
  const logDate = new Date(dateInput);
  const logTime = logDate.getTime();

  if (startStr) {
    const [y, m, d] = startStr.split("-").map(Number);
    const startTime = new Date(y, m - 1, d, 0, 0, 0).getTime();
    if (logTime < startTime) return false;
  }

  if (endStr) {
    const [y, m, d] = endStr.split("-").map(Number);
    const endTime = new Date(y, m - 1, d, 23, 59, 59, 999).getTime();
    if (logTime > endTime) return false;
  }

  return true;
};

const generarCSV = (data: AuditLog[]) => {
  const headers = ["Fecha", "Hora", "Usuario", "Rol", "Accion", "Direccion IP"];

  const rows = data.map((log) => {
    const logDate = new Date(log.fecha_hora);
    return [
      format(logDate, "yyyy-MM-dd"),
      format(logDate, "HH:mm:ss"),
      `"${log.nombre_usuario}"`,
      `"${log.nombre_rol}"`,
      `"${log.accion_realizada}"`,
      log.direccion_ip || "Desconocida",
    ];
  });

  const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join(
    "\n",
  );
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.setAttribute(
    "download",
    `Auditoria_SUD_${format(new Date(), "yyyyMMdd_HHmm")}.csv`,
  );
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export default function AuditTable({
  initialData,
  currentUserRole,
}: AuditTableProps) {
  const esAdmin = currentUserRole === "Obispo";
  const todayFormatted = format(new Date(), "yyyy-MM-dd");
  const [searchTerm, setSearchTerm] = useState("");

  const [isDateFilterOpen, setIsDateFilterOpen] = useState(false);
  const [tableDateRange, setTableDateRange] = useState({
    start: "",
    end: todayFormatted,
  });

  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [exportDateRange, setExportDateRange] = useState({
    start: "",
    end: todayFormatted,
  });
  const [exportError, setExportError] = useState<string | null>(null);

  const filteredData = initialData.filter((log) => {
    const matchesSearch =
      log.accion_realizada.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.nombre_usuario.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDates = isWithinDateRange(
      log.fecha_hora,
      tableDateRange.start,
      tableDateRange.end,
    );

    return matchesSearch && matchesDates;
  });

  const handleExportAll = () => {
    generarCSV(initialData);
    setIsExportModalOpen(false);
  };

  const handleExportRange = () => {
    if (!exportDateRange.start || !exportDateRange.end) {
      setExportError(
        "Debe seleccionar tanto la fecha de inicio como la de fin.",
      );
      return;
    }

    const dataToExport = initialData.filter((log) =>
      isWithinDateRange(
        log.fecha_hora,
        exportDateRange.start,
        exportDateRange.end,
      ),
    );

    if (dataToExport.length === 0) {
      setExportError("No hay registros en el rango seleccionado.");
      return;
    }

    generarCSV(dataToExport);
    setIsExportModalOpen(false);
    setExportError(null);
  };

  const formatDateUI = (dateInput: Date | string) =>
    format(new Date(dateInput), "dd MMM, yyyy", { locale: es });
  const formatTimeUI = (dateInput: Date | string) =>
    format(new Date(dateInput), "hh:mm:ss aa");

  const getActionStyle = (actionText: string) => {
    const text = actionText.toLowerCase();

    if (text.includes("registró") || text.includes("entrada")) {
      return "bg-green-50 text-green-600 border border-green-100";
    }
    if (text.includes("salida")) {
      return "bg-orange-50 text-orange-600 border border-orange-100";
    }
    if (
      text.includes("dañado") ||
      text.includes("dio de baja") ||
      text.includes("error")
    ) {
      return "bg-red-50 text-red-600 border border-red-100";
    }
    if (text.includes("actualizó")) {
      return "bg-blue-50 text-blue-600 border border-blue-100";
    }
    return "bg-gray-50 text-gray-700 border border-gray-200";
  };

  const hasActiveTableDateFilter =
    tableDateRange.start !== "" || tableDateRange.end !== todayFormatted;

  return (
    <>
      {esAdmin ? (
        <>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col h-full min-h-0">
            <div className="p-6 border-b border-gray-200">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    Historial del sistema
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    Registro inalterable de todas las acciones de los usuarios.
                  </p>
                </div>

                <div className="flex gap-3 w-full md:w-auto">
                  <div className="relative flex-1 md:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <input
                      type="text"
                      placeholder="Buscar por usuario o acción..."
                      className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#111c2d] outline-none text-sm text-[#333333] bg-white"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>

                  <div className="relative">
                    <button
                      onClick={() => setIsDateFilterOpen(!isDateFilterOpen)}
                      className={`flex items-center gap-2 px-4 py-2 border rounded-lg transition-colors text-sm font-medium ${hasActiveTableDateFilter ? "bg-blue-50 border-blue-200 text-blue-700" : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"}`}
                    >
                      <Calendar className="h-4 w-4" /> Rango de fechas
                      {hasActiveTableDateFilter && (
                        <div className="w-2 h-2 rounded-full bg-blue-600 ml-1"></div>
                      )}
                    </button>

                    {isDateFilterOpen && (
                      <div className="absolute top-full right-0 mt-2 w-72 bg-white border border-gray-200 rounded-lg shadow-xl z-20 p-4">
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="font-semibold text-gray-800 text-sm">
                            Filtrar por fecha
                          </h3>
                          {hasActiveTableDateFilter && (
                            <button
                              onClick={() =>
                                setTableDateRange({
                                  start: "",
                                  end: todayFormatted,
                                })
                              }
                              className="text-xs text-blue-600 hover:underline"
                            >
                              Limpiar
                            </button>
                          )}
                        </div>
                        <div className="space-y-3">
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">
                              Desde
                            </label>
                            <input
                              type="date"
                              value={tableDateRange.start}
                              onChange={(e) =>
                                setTableDateRange((p) => ({
                                  ...p,
                                  start: e.target.value,
                                }))
                              }
                              className="w-full text-sm text-[#333333] border border-gray-200 rounded-md p-2 outline-none focus:border-[#111c2d]"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">
                              Hasta
                            </label>
                            <input
                              type="date"
                              value={tableDateRange.end}
                              onChange={(e) =>
                                setTableDateRange((p) => ({
                                  ...p,
                                  end: e.target.value,
                                }))
                              }
                              className="w-full text-sm text-[#333333] border border-gray-200 rounded-md p-2 outline-none focus:border-[#111c2d]"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => {
                      setExportError(null);
                      setExportDateRange({ start: "", end: todayFormatted });
                      setIsExportModalOpen(true);
                    }}
                    className="flex items-center gap-2 px-4 py-2 border border-gray-200 bg-white rounded-lg hover:bg-gray-50 text-gray-700 text-sm font-medium transition-colors"
                  >
                    <Download className="h-4 w-4" /> Exportar CSV
                  </button>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-x-auto min-h-0">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-[11px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100 bg-white">
                    <th className="px-6 py-4">Fecha y Hora</th>
                    <th className="px-6 py-4">Usuario</th>
                    <th className="px-6 py-4">Acción Realizada</th>
                    <th className="px-6 py-4 text-right">Dirección IP</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredData.length === 0 ? (
                    <tr>
                      <td
                        colSpan={4}
                        className="px-6 py-12 text-center text-gray-500"
                      >
                        No hay registros de auditoría disponibles.
                      </td>
                    </tr>
                  ) : (
                    filteredData.map((log) => (
                      <tr
                        key={log.id_log}
                        className="hover:bg-gray-50/50 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="text-sm font-semibold text-gray-900">
                            {formatDateUI(log.fecha_hora)}
                          </div>
                          <div className="text-xs text-gray-500 mt-0.5">
                            {formatTimeUI(log.fecha_hora)}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 font-bold text-xs uppercase overflow-hidden">
                              {log.nombre_usuario.substring(0, 2)}
                            </div>
                            <div>
                              <div className="text-sm font-semibold text-gray-900">
                                {log.nombre_usuario}
                              </div>
                              <div className="text-xs text-gray-500">
                                {log.nombre_rol}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-3 py-1.5 rounded-md text-xs font-medium inline-flex items-center gap-1.5 ${getActionStyle(log.accion_realizada)}`}
                          >
                            {log.accion_realizada}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-400 font-mono text-right">
                          {log.direccion_ip || "Desconocida"}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="p-4 border-t border-gray-200 flex items-center justify-between bg-white shrink-0 rounded-b-xl">
              <span className="text-sm text-gray-400">
                Mostrando {filteredData.length} registros
              </span>
            </div>
          </div>

          {isExportModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
              <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 relative">
                <button
                  onClick={() => setIsExportModalOpen(false)}
                  className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>

                <div className="flex items-center gap-3 mb-6 text-[#111c2d]">
                  <div className="p-2 bg-slate-100 rounded-lg">
                    <FileSpreadsheet className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-bold">Exportar Auditoría</h3>
                </div>

                {exportError && (
                  <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-200">
                    {exportError}
                  </div>
                )}

                <div className="space-y-6">
                  <div className="p-4 border border-gray-200 rounded-xl bg-gray-50/50">
                    <h4 className="text-sm font-semibold text-gray-800 mb-3">
                      Exportar por rango de fechas
                    </h4>
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Desde
                        </label>
                        <input
                          type="date"
                          value={exportDateRange.start}
                          onChange={(e) =>
                            setExportDateRange((p) => ({
                              ...p,
                              start: e.target.value,
                            }))
                          }
                          className="w-full text-sm text-[#333333] border border-gray-300 rounded-lg p-2 outline-none focus:ring-2 focus:ring-[#111c2d] bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Hasta
                        </label>
                        <input
                          type="date"
                          value={exportDateRange.end}
                          onChange={(e) =>
                            setExportDateRange((p) => ({
                              ...p,
                              end: e.target.value,
                            }))
                          }
                          className="w-full text-sm text-[#333333] border border-gray-300 rounded-lg p-2 outline-none focus:ring-2 focus:ring-[#111c2d] bg-white"
                        />
                      </div>
                    </div>
                    <button
                      onClick={handleExportRange}
                      className="w-full py-2 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
                    >
                      Descargar selección
                    </button>
                  </div>

                  <div className="relative flex items-center py-2">
                    <div className="flex-grow border-t border-gray-200"></div>
                    <span className="flex-shrink-0 mx-4 text-xs font-medium text-gray-400 uppercase">
                      O bien
                    </span>
                    <div className="flex-grow border-t border-gray-200"></div>
                  </div>

                  <button
                    onClick={handleExportAll}
                    className="w-full py-2.5 bg-[#111c2d] text-white text-sm font-medium rounded-lg hover:bg-slate-800 transition-colors shadow-sm flex items-center justify-center gap-2"
                  >
                    <Download className="h-4 w-4" /> Exportar todos los
                    registros
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      ) : (
        <p className="text-[20px] ml-20 italic text-red-500 mt-2">
          * No tienes los permisos necesarios para acceder a esta seccion.
        </p>
      )}
    </>
  );
}
