import { db } from "@/lib/db";
import {
  articulos,
  consumibles,
  categorias,
  ubicaciones,
  movimientosPrestamos,
} from "@/lib/schema";
import { eq, count, desc, sql } from "drizzle-orm";
import { Header } from "@/components/layout/Header";
import DashboardView from "@/components/features/panel/DashboardView";

export default async function PanelPage() {
  const [totalActivosResult] = await db
    .select({ value: count() })
    .from(articulos)
    .where(eq(articulos.is_deleted, false));

  const [prestadosResult] = await db
    .select({ value: count() })
    .from(articulos)
    .where(eq(articulos.estado_disponibilidad, "Prestado"));

  const [reparacionResult] = await db
    .select({ value: count() })
    .from(articulos)
    .where(eq(articulos.estado_fisico, "Dañado"));

  const categoriasData = await db
    .select({ id: categorias.id_categoria, nombre: categorias.tipo_categoria })
    .from(categorias);

  const ubicacionesData = await db
    .select({
      id: ubicaciones.id_ubicacion,
      nombre: ubicaciones.nombre_ubicacion,
    })
    .from(ubicaciones);

  const consumiblesData = await db
    .select({
      cantidad: consumibles.cantidad,
      stock_minimo: consumibles.stock_minimo,
    })
    .from(consumibles)
    .where(eq(consumibles.is_deleted, false));

  let nivelConsumibles = "Óptimo";
  let consumiblesStatusColor = "text-green-600";

  const hayAgotados = consumiblesData.some((c) => c.cantidad === 0);
  const hayStockBajo = consumiblesData.some(
    (c) => c.cantidad > 0 && c.cantidad <= c.stock_minimo,
  );

  if (hayAgotados) {
    nivelConsumibles = "Crítico (Agotados)";
    consumiblesStatusColor = "text-red-600";
  } else if (hayStockBajo) {
    nivelConsumibles = "Atención requerida";
    consumiblesStatusColor = "text-orange-600";
  }

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

  const actividadReciente = await db
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
    .where(eq(articulos.is_deleted, false))
    .orderBy(desc(articulos.id_articulo))
    .limit(20);

  const kpis = {
    totalActivos: totalActivosResult.value,
    articulosPrestados: prestadosResult.value,
    necesitanReparacion: reparacionResult.value,
    nivelConsumibles,
    consumiblesStatusColor,
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <Header title="Resumen del panel" />

      <main className="flex-1 p-8 overflow-hidden flex flex-col">
        <DashboardView
          kpis={kpis}
          recentAssets={actividadReciente}
          categorias={categoriasData}
          ubicaciones={ubicacionesData}
        />
      </main>
    </div>
  );
}
