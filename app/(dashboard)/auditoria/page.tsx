import { db } from "@/lib/db";
import { auditoriaLogs, usuarios, roles } from "@/lib/schema";
import { desc, eq } from "drizzle-orm";
import { Header } from "@/components/layout/Header";
import AuditTable from "@/components/features/auditoria/AuditTable";
import { getCurrentUserRole } from "@/lib/getCurrentUser";

export default async function AuditoriaPage() {
  const rolActual = await getCurrentUserRole();

  const logsData = await db
    .select({
      id_log: auditoriaLogs.id_log,
      accion_realizada: auditoriaLogs.accion_realizada,
      fecha_hora: auditoriaLogs.fecha_hora,
      direccion_ip: auditoriaLogs.direccion_ip,
      nombre_usuario: usuarios.nombre_usuario,
      nombre_rol: roles.nombre_rol,
    })
    .from(auditoriaLogs)
    .innerJoin(usuarios, eq(auditoriaLogs.id_usuario, usuarios.id_usuario))
    .innerJoin(roles, eq(usuarios.id_rol, roles.id_rol))
    .orderBy(desc(auditoriaLogs.fecha_hora));

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <Header title="Registros de auditoría" />

      <main className="flex-1 p-4 md:p-8 overflow-y-auto flex flex-col">
        <AuditTable initialData={logsData} currentUserRole={rolActual} />
      </main>
    </div>
  );
}
