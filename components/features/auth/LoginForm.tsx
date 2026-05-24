"use client";

import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import logo_sud from "@/public/icons/Logo_Sud.png";
import Image from "next/image";

import {
  EyeIcon,
  EyeSlashIcon,
  FaceSmileIcon,
  LockClosedIcon,
  ArrowLeftIcon,
} from "@heroicons/react/24/outline";
import dynamic from "next/dynamic";
import ForgotPasswordSidebar from "./ForgotPasswordSidebar";

const ScannerFaceNoSSR = dynamic(() => import("./ScannerFace"), {
  ssr: false,
  loading: () => (
    <div className="w-[640px] h-[480px] bg-black/50 flex items-center justify-center rounded-lg border border-gray-800">
      <p className="text-[#1A3A5F] font-mono animate-pulse">
        Cargando motor de IA en el navegador...
      </p>
    </div>
  ),
});

export default function LoginForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isScanningMode, setIsScanningMode] = useState(false);
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    const res = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });

    if (res?.error) {
      setErrorMessage(res.error);
      setIsLoading(false);
    } else if (res?.ok) {
      router.push("/panel");
    }
  };

  // Si el usuario presiona "Ingresar con Reconocimiento Facial"
  if (isScanningMode) {
    return (
      <div className="w-full max-w-2xl p-8 bg-[#0B3B60] rounded-2xl shadow-xl border border-[#1A3A5F] flex flex-col items-center">
        <div className="w-full flex justify-start mb-4">
          <button
            onClick={() => setIsScanningMode(false)}
            className="text-[#F8F9FA] hover:text-[#a1a1a1] flex items-center gap-2 text-sm"
          >
            <ArrowLeftIcon className="w-2 h-2" /> Volver al login normal
          </button>
        </div>
        <h2 className="text-[#F8F9FA] font-bold mb-4">ACCESO BIOMÉTRICO</h2>

        <ScannerFaceNoSSR
          onLoginSuccess={async (vector: number[]) => {
            await signIn("credentials", {
              vector: JSON.stringify(vector),
              callbackUrl: "/panel",
            });
          }}
        />
      </div>
    );
  }

  return (
    <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-sm border border-gray-100">
      <div className="flex flex-col items-center mb-8">
        <div className="w-12 h-12 bg-[#0B3B60] rounded-xl flex items-center justify-center mb-4">
          <Image src={logo_sud} alt="Mi Logo" className="w-11 h-11" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Inventario SUD</h1>
        <p className="text-sm text-gray-500 mt-1">
          Ingresa a tu cuenta para continuar
        </p>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Correo electrónico
          </label>
          <input
            type="email"
            name="email"
            placeholder="ejemplo@institucion.org"
            required
            className="w-full px-4 py-2 border text-gray-900 rounded-lg focus:ring-2 focus:ring-[#0B3B60] focus:border-transparent outline-none transition-all"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Contraseña
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="••••••••••••"
              required
              className="w-full px-4 py-2 border text-gray-900 rounded-lg focus:ring-2 focus:ring-[#0B3B60] focus:border-transparent outline-none transition-all pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? (
                <EyeSlashIcon className="w-5 h-5" />
              ) : (
                <EyeIcon className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {errorMessage && (
          <p className="text-red-500 text-sm font-medium bg-red-50 p-2 rounded-md">
            {errorMessage}
          </p>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-[#0B3B60] hover:bg-[#0a2e4b] text-white font-medium py-2.5 rounded-lg transition-colors disabled:opacity-70 mt-2"
        >
          {isLoading ? "Ingresando..." : "Ingresar"}
        </button>
        {/* SECCION div DE RECUPERAR CONTRASEÑA
        Archivos involucrados: 
        actions/reset-actions.ts
        components/features/ForgotPasswordSidebar.tsx
        En lib/schema.ts se añadio nueva tabla password_resets
        Archivo .env -> SMTP */}
        <div className="text-center mt-4">
          <button
            type="button"
            onClick={() => setIsForgotPasswordOpen(true)}
            className="text-sm font-medium text-[#0B3B60] hover:text-blue-800 transition-colors"
          >
            ¿Olvidaste tu contraseña?
          </button>
        </div>
      </form>

      <div className="relative flex items-center py-6">
        <div className="flex-grow border-t border-gray-200"></div>
        <span className="flex-shrink-0 mx-4 text-xs font-medium text-gray-400 tracking-wider">
          OPCIONAL
        </span>
        <div className="flex-grow border-t border-gray-200"></div>
      </div>

      {/* Sección Biométrica */}
      <div className="flex flex-col items-center gap-3">
        <div className="flex items-center gap-1.5 bg-green-50 text-green-700 px-3 py-1 rounded-full text-xs font-medium border border-green-100">
          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
          Seguridad Biométrica
        </div>

        <button
          type="button"
          onClick={() => setIsScanningMode(true)}
          className="w-full flex items-center justify-center gap-2 bg-[#EAF2F8] hover:bg-[#dbe9f4] text-[#0B3B60] font-medium py-2.5 rounded-lg transition-colors"
        >
          <FaceSmileIcon className="w-5 h-5" />
          Ingresar con Reconocimiento Facial
        </button>
      </div>

      {/* Footer / Privacidad */}
      <div className="mt-8 flex items-start gap-2 text-center justify-center">
        <LockClosedIcon className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
        <p className="text-[10px] text-gray-400 leading-tight max-w-[250px]">
          Tus datos están encriptados y protegidos bajo nuestras estrictas
          políticas de privacidad institucional.
        </p>
      </div>

      {/* SECCION DE RECUPERAR CONTRASEÑA
      Sidebar que sale por el lado derecho */}
      <ForgotPasswordSidebar
        isOpen={isForgotPasswordOpen}
        onClose={() => setIsForgotPasswordOpen(false)}
      />
    </div>
  );
}
