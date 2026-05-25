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
  Menu,
  X,
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

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const handleLinkClick = () => {
    if (window.innerWidth < 768) {
      setIsMobileMenuOpen(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsMobileMenuOpen(true)}
        className="md:hidden fixed top-3.5 left-4 z-40 p-1.5 rounded-lg bg-white border border-gray-200 shadow-sm text-gray-700 hover:bg-gray-50 transition-colors"
      >
        <Menu className="h-6 w-6" />
      </button>

      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-[55] bg-black/50 backdrop-blur-sm md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-[60] w-64 bg-[#111c2d] flex flex-col text-slate-300 transition-transform duration-300 ease-in-out md:relative md:translate-x-0 
        ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="h-16 flex items-center justify-between px-6 border-b border-white/5 shrink-0">
          <div className="flex items-center gap-3">
            <Image src={logo_sud} alt="Mi Logo" className="w-9 h-9" />
            <span className="text-white font-semibold text-lg tracking-wide">
              Inventario SUD
            </span>
          </div>
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="md:hidden p-1 rounded-md text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navegación principal */}
        <div className="flex-1 overflow-y-auto py-6 px-3 custom-scrollbar">
          <div className="mb-8">
            <h3 className="px-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-3">
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
                      onClick={handleLinkClick}
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
            <h3 className="px-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-3">
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
                      onClick={handleLinkClick}
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

        <div className="p-4 border-t border-white/5 shrink-0">
          <button
            onClick={() => {
              setIsMobileMenuOpen(false);
              setIsLogoutModalOpen(true);
            }}
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
