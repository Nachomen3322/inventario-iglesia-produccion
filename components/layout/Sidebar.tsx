"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import logo_sud from "@/public/icons/Logo_Sud.png";
import Image from "next/image";
import {
  LayoutDashboard,
  Package,
  Box,
  ArrowRightLeft,
  ClipboardList,
  Settings,
  LogOut,
  AlertTriangle,
} from "lucide-react";

type MenuItem = {
  name: string;
  href: string;
  icon: React.ElementType;
};

const menuPrincipal: MenuItem[] = [
  { name: "Panel", href: "/panel", icon: LayoutDashboard },
  { name: "Activos fijos", href: "/activos", icon: Package },
  { name: "Consumibles", href: "/consumibles", icon: Box },
  { name: "Préstamos", href: "/prestamos", icon: ArrowRightLeft },
];

const administracion: MenuItem[] = [
  { name: "Registros de auditoría", href: "/auditoria", icon: ClipboardList },
  { name: "Configuración", href: "/configuracion", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();

  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const isActive = (href: string) => pathname.startsWith(href);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await signOut({ callbackUrl: "/login" });
  };

  return (
    <>
      <aside className="w-64 h-screen bg-[#111c2d] flex flex-col text-slate-300 flex-shrink-0">
        {/* Logo y Título */}
        <div className="h-16 flex items-center px-6 border-b border-white/5">
          <Image src={logo_sud} alt="Mi Logo" className="w-11 h-11" />
          <span className="text-white font-semibold text-lg tracking-wide">
            Inventario SUD
          </span>
        </div>

        {/* Navegación principal */}
        <div className="flex-1 overflow-y-auto py-6 px-3 custom-scrollbar">
          <div className="mb-8">
            <h3 className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
              Menú Principal
            </h3>
            <ul className="space-y-1">
              {menuPrincipal.map((item) => {
                const active = isActive(item.href);
                const Icon = item.icon;
                return (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm font-medium
                      ${
                        active
                          ? "bg-blue-600/10 text-blue-400"
                          : "hover:bg-white/5 hover:text-white"
                      }`}
                    >
                      <Icon
                        className={`h-5 w-5 ${active ? "text-blue-400" : "text-slate-400"}`}
                      />
                      {item.name}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          <div>
            <h3 className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
              Administración
            </h3>
            <ul className="space-y-1">
              {administracion.map((item) => {
                const active = isActive(item.href);
                const Icon = item.icon;
                return (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm font-medium
                      ${
                        active
                          ? "bg-blue-600/10 text-blue-400"
                          : "hover:bg-white/5 hover:text-white"
                      }`}
                    >
                      <Icon
                        className={`h-5 w-5 ${active ? "text-blue-400" : "text-slate-400"}`}
                      />
                      {item.name}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        <div className="p-4 border-t border-white/5">
          <button
            onClick={() => setIsLogoutModalOpen(true)}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg transition-colors text-sm font-medium text-red-400 hover:bg-red-500/10 hover:text-red-300"
          >
            <LogOut className="h-5 w-5" />
            Cerrar sesión
          </button>
        </div>
      </aside>
      {isLogoutModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 text-center shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>

            <h3 className="text-xl font-bold text-gray-900 mb-2">
              ¿Cerrar sesión?
            </h3>

            <p className="text-sm text-gray-500 mb-8">
              Deberá volver a ingresar sus credenciales o usar el escáner facial
              para acceder al sistema.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setIsLogoutModalOpen(false)}
                disabled={isLoggingOut}
                className="flex-1 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>

              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="flex-1 flex justify-center items-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors disabled:opacity-70"
              >
                {isLoggingOut ? (
                  <>
                    <svg
                      className="animate-spin h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Saliendo...
                  </>
                ) : (
                  "Sí, cerrar sesión"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
