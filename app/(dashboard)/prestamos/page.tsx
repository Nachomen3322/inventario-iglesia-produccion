import { db } from "@/lib/db";
import { movimientosPrestamos, articulos, ubicaciones } from "@/lib/schema";
import { eq, and } from "drizzle-orm";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { Header } from "@/components/layout/Header";
import LoansTable from "@/components/features/prestamos/LoansTable";
import { getCurrentUserRole } from "@/lib/getCurrentUser";

export default async function PrestamosPage() {
  const session = await getServerSession(authOptions);
  const rolActual = await getCurrentUserRole();

  const prestamos = await db
    .select({
      id: movimientosPrestamos.id_movimiento,
      id_articulo: movimientosPrestamos.id_articulo,
      articulo_nombre: articulos.nombre,
      articulo_ubicacion: ubicaciones.nombre_ubicacion,
      cantidad_prestada: movimientosPrestamos.cantidad_prestada,
      destino_externo: movimientosPrestamos.destino,
      responsable: movimientosPrestamos.responsable_externo,
      autorizado_por: movimientosPrestamos.autorizado_por,
      fecha_salida: movimientosPrestamos.fecha_inicio,
      fecha_retorno_esperada: movimientosPrestamos.fecha_retorno,
    })
    .from(movimientosPrestamos)
    .innerJoin(
      articulos,
      eq(movimientosPrestamos.id_articulo, articulos.id_articulo),
    )
    .innerJoin(
      ubicaciones,
      eq(articulos.id_ubicacion, ubicaciones.id_ubicacion),
    )
    .where(eq(movimientosPrestamos.is_deleted, false));

  const articulosDisponibles = await db
    .select({
      id: articulos.id_articulo,
      nombre: articulos.nombre,
      cantidad: articulos.cantidad,
      ubicacion: ubicaciones.nombre_ubicacion,
    })
    .from(articulos)
    .innerJoin(
      ubicaciones,
      eq(articulos.id_ubicacion, ubicaciones.id_ubicacion),
    )
    .where(
      and(
        eq(articulos.is_deleted, false),
        eq(articulos.estado_disponibilidad, "Disponible"),
      ),
    );

  const userData = {
    id: Number(session?.user?.id) || 0,
    name: session?.user?.name || "Usuario",
    role: session?.user?.role || "Obispo",
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <Header title="Gestión de Préstamos" />
      <main className="flex-1 p-8 overflow-auto">
        <LoansTable
          initialData={prestamos}
          articulosDisponibles={articulosDisponibles}
          currentUser={userData}
          currentUserRole={rolActual}
        />
      </main>
    </div>
  );
}
