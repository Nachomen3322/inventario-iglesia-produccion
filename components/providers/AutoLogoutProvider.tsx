"use client";

import { useEffect } from "react";
import { signOut } from "next-auth/react";

export default function AutoLogoutProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const resetTimer = () => {
      clearTimeout(timeoutId);
      const isEnabled = localStorage.getItem("autoLogoutConfig") !== "false";

      if (isEnabled) {
        // 15 minutos = 15 * 60 * 1000 milisegundos
        timeoutId = setTimeout(
          () => {
            console.log("Inactividad detectada. Cerrando sesión...");
            signOut({ callbackUrl: "/login" });
          },
          15 * 60 * 1000,
        );
      }
    };

    window.addEventListener("autoLogoutChanged", resetTimer);

    const events = [
      "mousemove",
      "keydown",
      "mousedown",
      "touchstart",
      "scroll",
    ];
    events.forEach((event) => window.addEventListener(event, resetTimer));

    resetTimer();

    return () => {
      events.forEach((event) => window.removeEventListener(event, resetTimer));
      window.removeEventListener("autoLogoutChanged", resetTimer);
      clearTimeout(timeoutId);
    };
  }, []);

  return <>{children}</>;
}
