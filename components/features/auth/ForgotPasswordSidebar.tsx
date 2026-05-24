"use client";

import { useState, useEffect } from "react";
import {
  solicitarPinReset,
  cambiarPasswordConPin,
} from "@/actions/reset-actions";
import {
  EyeIcon,
  EyeSlashIcon,
  XMarkIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
} from "@heroicons/react/24/outline";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

type Step = 1 | 2 | 3;

export default function ForgotPasswordSidebar({ isOpen, onClose }: Props) {
  const [step, setStep] = useState<Step>(1);
  const [email, setEmail] = useState("");
  const [pin, setPin] = useState("");
  const [passwords, setPasswords] = useState({ new: "", confirm: "" });

  const [statusMsg, setStatusMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(
        () => setResendCooldown(resendCooldown - 1),
        1000,
      );
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        setStep(1);
        setEmail("");
        setPin("");
        setPasswords({ new: "", confirm: "" });
        setStatusMsg("");
        setErrorMsg("");
        setResendCooldown(0);
      }, 300);
    }
  }, [isOpen]);

  const handleSendEmail = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMsg("");
    setStatusMsg("Verificando correo...");
    setIsLoading(true);

    const res = await solicitarPinReset(email);
    setIsLoading(false);

    if (res.error) {
      setErrorMsg(res.error);
      setStatusMsg("");
    } else {
      setStatusMsg("¡PIN enviado con éxito!");
      setStep(2);
      setResendCooldown(30);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (passwords.new !== passwords.confirm) {
      setErrorMsg("Las contraseñas no coinciden.");
      return;
    }

    if (passwords.new.length < 8) {
      setErrorMsg("La contraseña debe tener al menos 8 caracteres.");
      return;
    }

    setStatusMsg("Verificando PIN y actualizando...");
    setIsLoading(true);

    const res = await cambiarPasswordConPin(email, pin, passwords.new);
    setIsLoading(false);

    if (res.error) {
      setErrorMsg(res.error);
      setStatusMsg("");
    } else {
      setStatusMsg("¡Contraseña cambiada exitosamente!");
      setTimeout(() => {
        onClose();
      }, 2000);
    }
  };

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity"
          onClick={onClose}
        />
      )}

      <div
        className={`fixed inset-y-0 right-0 w-full max-w-sm bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col ${isOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">
            Recuperar Contraseña
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 flex-1 overflow-y-auto">
          {statusMsg && (
            <div className="mb-6 p-3 bg-emerald-50 text-emerald-700 text-sm font-medium rounded-lg flex items-center gap-2 border border-emerald-100">
              <CheckCircleIcon className="w-5 h-5 flex-shrink-0" /> {statusMsg}
            </div>
          )}
          {errorMsg && (
            <div className="mb-6 p-3 bg-red-50 text-red-700 text-sm font-medium rounded-lg flex items-center gap-2 border border-red-100">
              <ExclamationCircleIcon className="w-5 h-5 flex-shrink-0" />{" "}
              {errorMsg}
            </div>
          )}

          {step === 1 && (
            <form
              onSubmit={handleSendEmail}
              className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300"
            >
              <p className="text-sm text-gray-500 mb-2">
                Ingresa su correo y se le enviara un código de seguridad.
              </p>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Correo electrónico
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2 text-[#333333] border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#0B3B60] outline-none"
                />
              </div>
              <button
                type="submit"
                disabled={isLoading || !email}
                className="w-full bg-[#0B3B60] text-white py-2.5 rounded-lg font-medium hover:bg-[#0a2e4b] transition-colors disabled:opacity-50"
              >
                {isLoading ? "Buscando..." : "Enviar Código"}
              </button>
            </form>
          )}

          {step === 2 && (
            <form
              onSubmit={handleChangePassword}
              className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300"
            >
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                <p className="text-sm text-blue-800">
                  Se envió un código a <strong>{email}</strong>.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Código de 6 dígitos (PIN)
                </label>
                <input
                  type="text"
                  maxLength={6}
                  required
                  value={pin}
                  onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))} // Solo números
                  className="w-full px-4 py-3 text-center tracking-[0.5em] text-xl text-[#333333] font-bold border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#0B3B60] outline-none"
                  placeholder="------"
                />
              </div>

              <div className="pt-2 border-t border-gray-100">
                {/* Nueva Contraseña */}
                <div className="relative mb-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nueva Contraseña
                  </label>
                  <input
                    type={showNewPassword ? "text" : "password"}
                    required
                    value={passwords.new}
                    onChange={(e) =>
                      setPasswords({ ...passwords, new: e.target.value })
                    }
                    className="w-full px-4 py-2 pr-11 border border-gray-200 rounded-lg text-[#333333] focus:ring-2 focus:ring-[#0B3B60] outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-[38px] text-gray-400 hover:text-gray-600"
                  >
                    {showNewPassword ? (
                      <EyeSlashIcon className="w-5 h-5" />
                    ) : (
                      <EyeIcon className="w-5 h-5" />
                    )}
                  </button>
                </div>

                {/* Confirmar Contraseña */}
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Confirmar Contraseña
                  </label>
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    value={passwords.confirm}
                    onChange={(e) =>
                      setPasswords({ ...passwords, confirm: e.target.value })
                    }
                    className="w-full px-4 py-2 pr-11 border border-gray-200 rounded-lg text-[#333333] focus:ring-2 focus:ring-[#0B3B60] outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-[38px] text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? (
                      <EyeSlashIcon className="w-5 h-5" />
                    ) : (
                      <EyeIcon className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading || pin.length !== 6 || !passwords.new}
                className="w-full bg-[#0B3B60] text-white py-2.5 rounded-lg font-medium hover:bg-[#0a2e4b] transition-colors disabled:opacity-50"
              >
                {isLoading ? "Procesando..." : "Cambiar Contraseña"}
              </button>

              <div className="text-center mt-4">
                <button
                  type="button"
                  disabled={resendCooldown > 0 || isLoading}
                  onClick={() => handleSendEmail()}
                  className="text-sm text-[#0B3B60] font-medium hover:underline disabled:text-gray-400 disabled:no-underline"
                >
                  {resendCooldown > 0
                    ? `Reenviar código en ${resendCooldown}s`
                    : "¿No recibiste el código? Reenviar"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </>
  );
}
