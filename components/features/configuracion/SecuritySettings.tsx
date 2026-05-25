"use client";

import { useState } from "react";
import dynamic from "next/dynamic";

const ScannerModalNoSSR = dynamic(
  () => import("@/app/(dashboard)/configuracion/ScannerModal"),
  { ssr: false },
);

interface SecuritySettingsProps {
  userId?: string;
}

export default function SecuritySettings({ userId }: SecuritySettingsProps) {
  const [autoLogout, setAutoLogout] = useState(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("autoLogoutConfig");
      if (stored !== null) {
        return stored === "true";
      }
    }
    return true;
  });

  const handleToggle = () => {
    const newValue = !autoLogout;
    setAutoLogout(newValue);
    localStorage.setItem("autoLogoutConfig", String(newValue));
    window.dispatchEvent(new Event("autoLogoutChanged"));
  };

  return (
    <section className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm mt-8">
      <h2 className="text-lg font-semibold text-gray-900 mb-6">
        Seguridad de Acceso
      </h2>

      {/* Calibración Biométrica */}
      <div className="p-4 md:p-6 border-b border-gray-200 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 shrink-0">
        <div>
          <h3 className="font-medium text-gray-900">
            Activacion/Calibración biométrica facial
          </h3>
          <p className="text-sm text-gray-500">
            Activa/Configura tu rostro para autorizaciones rápidas y login sin
            contraseña.
          </p>
        </div>
        <ScannerModalNoSSR userId={userId} />
      </div>

      {/* Cierre Automático con Toggle */}
      <div className="p-4 md:p-6 border-b border-gray-200 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 shrink-0">
        <div>
          <h3 className="font-medium text-gray-900">
            Cierre automático de sesión
          </h3>
          <p className="text-sm text-gray-500">
            Forzar el cierre de sesión tras 15 minutos de inactividad por
            seguridad.
          </p>
        </div>

        {/* Toggle Switch */}
        <div
          onClick={handleToggle}
          className={`w-12 h-6 rounded-full relative cursor-pointer transition-colors duration-300 ${autoLogout ? "bg-[#0B3B60]" : "bg-gray-300"}`}
        >
          <div
            className={`absolute top-1 bg-white w-4 h-4 rounded-full transition-all duration-300 shadow-sm ${autoLogout ? "right-1" : "left-1"}`}
          ></div>
        </div>
      </div>
    </section>
  );
}
