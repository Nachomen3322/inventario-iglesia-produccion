"use client";

import { useEffect, useRef, useState } from "react";
import Human from "@vladmandic/human";

interface ScannerFaceProps {
  userId?: string;
  onCaptureSuccess?: () => void;
  onLoginSuccess?: (vector: number[]) => Promise<void> | void;
}

export default function ScannerFace({
  userId,
  onCaptureSuccess,
  onLoginSuccess,
}: ScannerFaceProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const currentEmbeddingRef = useRef<number[] | null>(null);
  const requestRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [isCameraActive, setIsCameraActive] = useState(false);
  const [status, setStatus] = useState("Iniciando motor biométrico...");
  const [human, setHuman] = useState<Human | null>(null);
  const [canCapture, setCanCapture] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  useEffect(() => {
    return () => {
      stopCamera();
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, []);

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, []);

  useEffect(() => {
    const initAI = async () => {
      try {
        const humanConfig = {
          modelBasePath: "/models",
          face: {
            enabled: true,
            detector: { return: true },
            mesh: { enabled: true },
            emotion: { enabled: false },
          },
          body: { enabled: false },
          hand: { enabled: false },
          object: { enabled: false },
        };

        const humanInstance = new Human(humanConfig);
        await humanInstance.load();
        setHuman(humanInstance);
        setStatus("Motor listo. Esperando cámara...");
      } catch (error) {
        console.error("Error cargando Human:", error);
        setStatus("Error cargando el motor de IA.");
      }
    };

    if (typeof window !== "undefined") {
      initAI();
    }
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsCameraActive(true);
        setStatus("Cámara activa. Analizando rostro...");
      }
    } catch (error) {
      console.error("Error al acceder a la cámara:", error);
      setStatus("Error: Permiso de cámara denegado.");
    }
  };

  const detectFace = async () => {
    if (!human || !videoRef.current || !canvasRef.current) return;

    if (videoRef.current.readyState >= 2) {
      const result = await human.detect(videoRef.current);
      const canvas = canvasRef.current;
      const video = videoRef.current;

      if (canvas && video) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          if (result.face && result.face.length > 0) {
            human.draw.face(canvas, result.face);
            const rostro = result.face[0];
            if (rostro.embedding && rostro.faceScore > 0.8) {
              currentEmbeddingRef.current = Array.from(rostro.embedding);
              setCanCapture(true);
              setStatus("Rostro fijado. Listo para capturar.");
            } else {
              setCanCapture(false);
              setStatus("Acerque su rostro...");
            }
          } else {
            setCanCapture(false);
            setStatus("Buscando rostro...");
          }
        }
      }
    }
    requestRef.current = requestAnimationFrame(detectFace);
  };

  const handleCapture = async () => {
    if (!currentEmbeddingRef.current) return;
    setIsLoading(true);

    try {
      if (userId) {
        // CASO 1: Registro biometrico
        setStatus("Guardando credencial...");
        const res = await fetch("/api/biometria", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: String(userId),
            vector: currentEmbeddingRef.current,
            action: "register",
          }),
        });

        if (res.ok) {
          setStatus("¡ÉXITO! Rostro guardado.");
          if (onCaptureSuccess) onCaptureSuccess();
        } else {
          const data = await res.json();
          setStatus(`Error: ${data.error || "Fallo en API"}`);
        }
      } else {
        // CASO 2: Login con credenciales
        if (onLoginSuccess) {
          setStatus("Autenticando...");
          await onLoginSuccess(currentEmbeddingRef.current);
        }
      }
    } catch (error) {
      setStatus("Error en la operación.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="relative bg-[#eeeeee] rounded-lg overflow-hidden w-[640px] h-[480px] flex items-center justify-center border border-[#1A3A5F] shadow-xl">
        <div className="absolute top-4 left-4 z-30 bg-[#eeeeee] px-3 py-1 rounded text-sm font-mono text-[#1A3A5F] border border-[#1A3A5F]">
          {status}
        </div>

        <video
          ref={videoRef}
          autoPlay
          muted
          onPlay={() => {
            requestRef.current = requestAnimationFrame(detectFace);
          }}
          className={`absolute inset-0 w-full h-full object-cover z-10 transition-opacity ${!isCameraActive ? "opacity-0" : "opacity-100"}`}
        />

        <canvas
          ref={canvasRef}
          className={`absolute inset-0 w-full h-full object-cover z-20 pointer-events-none ${!isCameraActive ? "opacity-0" : "opacity-100"}`}
        />

        {!isCameraActive && (
          <button
            onClick={startCamera}
            disabled={!human}
            className="z-30 px-8 py-3 bg-[#0B3B60] hover:bg-[#3478c5] disabled:bg-gray-800 rounded font-bold transition-all text-[#F8F9FA]"
          >
            {human ? "ENCENDER ESCÁNER" : "CARGANDO IA..."}
          </button>
        )}
      </div>

      {isCameraActive && (
        <div className="w-[640px] flex justify-between items-center bg-gray-900 p-4 rounded-lg border border-gray-800">
          <span className="text-[#F8F9FA] text-sm font-mono">
            Estado:{" "}
            <span className={canCapture ? "text-[#5896dd]" : "text-amber-500"}>
              {canCapture ? "Listo" : "Ajustando..."}
            </span>
          </span>

          <button
            onClick={handleCapture}
            disabled={!canCapture || isLoading}
            className="px-6 py-2 bg-[#0B3B60] hover:bg-[#3768a5] disabled:bg-gray-800 disabled:text-gray-500 rounded font-bold transition-all text-[#F8F9FA] flex items-center gap-2 min-w-[200px] justify-center"
          >
            {isLoading ? (
              <>
                <svg
                  className="animate-spin h-5 w-5 text-[#F8F9FA]"
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
                <span>PROCESANDO...</span>
              </>
            ) : userId ? (
              "GUARDAR ROSTRO"
            ) : (
              "VERIFICAR IDENTIDAD"
            )}
          </button>
        </div>
      )}
    </div>
  );
}
