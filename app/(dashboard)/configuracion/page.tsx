import { db } from "@/lib/db";
import {
  roles,
  usuarios,
  articulos,
  consumibles,
  movimientosPrestamos,
} from "@/lib/schema";
import { eq } from "drizzle-orm";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { Header } from "@/components/layout/Header";
import UserManagement from "@/components/features/admin/UserManagement";
import DatabaseMaintenance from "@/components/features/admin/DatabaseMaintenance";
import SecuritySettings from "@/components/features/configuracion/SecuritySettings";
import { redirect } from "next/navigation";
import { getCurrentUserRole } from "@/lib/getCurrentUser";

export default async function ConfiguracionPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect("/login");
  }

  const rolActual = await getCurrentUserRole();

  const listaRoles = await db.select().from(roles);
  const listaUsuarios = await db
    .select({
      id_usuario: usuarios.id_usuario,
      nombre_usuario: usuarios.nombre_usuario,
      email: usuarios.email,
      id_rol: usuarios.id_rol,
      nombre_rol: roles.nombre_rol,
      is_active: usuarios.is_active,
    })
    .from(usuarios)
    .innerJoin(roles, eq(usuarios.id_rol, roles.id_rol));

  const deletedAsset = await db
    .select({
      id_articulo: articulos.id_articulo,
      nombre: articulos.nombre,
    })
    .from(articulos)
    .where(eq(articulos.is_deleted, true));

  const deletedConsumable = await db
    .select({
      id_consumible: consumibles.id_consumible,
      nombre: consumibles.nombre,
      cantidad: consumibles.cantidad,
    })
    .from(consumibles)
    .where(eq(consumibles.is_deleted, true));

  const deletedLoan = await db
    .select({
      id_movimiento: movimientosPrestamos.id_movimiento,
      articulo_nombre: articulos.nombre,
      responsable_externo: movimientosPrestamos.responsable_externo,
    })
    .from(movimientosPrestamos)
    .innerJoin(
      articulos,
      eq(movimientosPrestamos.id_articulo, articulos.id_articulo),
    )
    .where(eq(movimientosPrestamos.is_deleted, true));

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <Header title="Configuracion del Sistema" />

      {/* Contenido Principal */}
      <div className="flex-1 p-8 overflow-auto">
        <div className="scroll-mt-8">
          <UserManagement
            usuarios={listaUsuarios}
            roles={listaRoles}
            currentUserRole={rolActual}
          />
        </div>

        <div className="scroll-mt-8">
          <DatabaseMaintenance
            currentUserRole={rolActual}
            deletedAssets={deletedAsset}
            deletedConsumables={deletedConsumable}
            deletedLoans={deletedLoan}
          />
        </div>

        <div className="scroll-mt-8">
          <SecuritySettings userId={session.user.id} />
        </div>
      </div>
    </div>
  );
}
