import { db } from "@/lib/db";
import {
  articulos,
  categorias,
  ubicaciones,
  movimientosPrestamos,
} from "@/lib/schema";
import { eq, and, sql } from "drizzle-orm";
import AssetsTable from "@/components/features/activos/AssetsTable";
import { Header } from "@/components/layout/Header";
import { getCurrentUserRole } from "@/lib/getCurrentUser";

export default async function ActivosFijosPage() {
  const rolActual = await getCurrentUserRole();

  const prestadoSubquery = db
    .select({
      id_articulo: movimientosPrestamos.id_articulo,
      total_prestado:
        sql<number>`coalesce(sum(${movimientosPrestamos.cantidad_prestada}), 0)`
          .mapWith(Number)
          .as("total_prestado"),
    })
    .from(movimientosPrestamos)
    .where(eq(movimientosPrestamos.is_deleted, false))
    .groupBy(movimientosPrestamos.id_articulo)
    .as("p_sub");

  const data = await db
    .select({
      id: articulos.id_articulo,
      nombre: articulos.nombre,
      cantidad: articulos.cantidad,
      estado_fisico: articulos.estado_fisico,
      estado_disponibilidad: articulos.estado_disponibilidad,
      categoria: categorias.tipo_categoria,
      id_categoria: articulos.id_categoria,
      ubicacion: ubicaciones.nombre_ubicacion,
      id_ubicacion: articulos.id_ubicacion,
      cantidad_prestada: prestadoSubquery.total_prestado,
    })
    .from(articulos)
    .innerJoin(categorias, eq(articulos.id_categoria, categorias.id_categoria))
    .innerJoin(
      ubicaciones,
      eq(articulos.id_ubicacion, ubicaciones.id_ubicacion),
    )
    .leftJoin(
      prestadoSubquery,
      eq(articulos.id_articulo, prestadoSubquery.id_articulo),
    )
    .where(eq(articulos.is_deleted, false));

  const categoriasData = await db
    .select({ id: categorias.id_categoria, nombre: categorias.tipo_categoria })
    .from(categorias);

  const ubicacionesData = await db
    .select({
      id: ubicaciones.id_ubicacion,
      nombre: ubicaciones.nombre_ubicacion,
    })
    .from(ubicaciones);

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <Header title="Activos fijos" />
      <main className="flex-1 p-8 overflow-auto">
        <AssetsTable
          initialData={data}
          totalItems={data.length}
          categorias={categoriasData}
          ubicaciones={ubicacionesData}
          currentUserRole={rolActual}
        />
      </main>
    </div>
  );
}
