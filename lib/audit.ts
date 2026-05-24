import { db } from "@/lib/db";
import { auditoriaLogs } from "@/lib/schema";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { headers } from "next/headers";

export async function registrarLogAuditoria(
  accion_realizada: string,
  idUsuarioOverride?: number,
) {
  try {
    let userId = idUsuarioOverride;

    if (!userId) {
      const session = await getServerSession(authOptions);
      if (!session?.user?.id) {
        console.warn("Intento de registro de auditoría sin sesión activa.");
        return;
      }
      userId = Number(session.user.id);
    }

    const headersList = await headers();
    const forwardedFor = headersList.get("x-forwarded-for");
    const realIp = headersList.get("x-real-ip");

    let ip = "Desconocida";
    if (forwardedFor) {
      ip = forwardedFor.split(",")[0].trim();
    } else if (realIp) {
      ip = realIp.trim();
    }

    await db.insert(auditoriaLogs).values({
      accion_realizada,
      id_usuario: userId,
      direccion_ip: ip,
    });
  } catch (error) {
    console.error("Error crítico al registrar auditoría:", error);
  }
}
