"use client";

import { useState } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import dynamic from "next/dynamic";

const ScannerFaceNoSSR = dynamic(
  () => import("@/components/features/auth/ScannerFace"),
  {
    ssr: false,
    loading: () => (
      <div className="w-[640px] h-[480px] bg-[#eeeeee] flex items-center justify-center rounded-lg border border-gray-800">
        <p className="text-[#F8F9FA] font-mono animate-pulse">
          Cargando cámara...
        </p>
      </div>
    ),
  },
);

export default function ScannerModal({ userId }: { userId?: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
      >
        Activar/Recalibrar
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm">
          <div className="bg-[#0B3B60] p-6 rounded-2xl shadow-2xl relative w-full max-w-2xl border border-gray-800">
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>

            <h3 className="text-xl font-bold text-[#F8F9FA] mb-4 tracking-wider">
              CALIBRACIÓN BIOMÉTRICA
            </h3>

            {/* Se carga el escáner*/}
            <ScannerFaceNoSSR
              userId={userId}
              onCaptureSuccess={() => {
                setTimeout(() => setIsOpen(false), 2000);
              }}
            />
          </div>
        </div>
      )}
    </>
  );
}
