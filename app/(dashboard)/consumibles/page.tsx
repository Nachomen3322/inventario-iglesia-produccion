import { db } from "@/lib/db";
import { consumibles, categorias, ubicaciones } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { Header } from "@/components/layout/Header";
import ConsumablesGrid from "@/components/features/consumibles/ConsumablesGrid";
import { getCurrentUserRole } from "@/lib/getCurrentUser";

export default async function ConsumiblesPage() {
  const data = await db
    .select({
      id: consumibles.id_consumible,
      nombre: consumibles.nombre,
      cantidad: consumibles.cantidad,
      stock_minimo: consumibles.stock_minimo,
      unidad_medida: consumibles.unidad_medida,
      categoria: categorias.tipo_categoria,
      id_categoria: consumibles.id_categoria,
      ubicacion: ubicaciones.nombre_ubicacion,
      id_ubicacion: consumibles.id_ubicacion,
    })
    .from(consumibles)
    .innerJoin(
      categorias,
      eq(consumibles.id_categoria, categorias.id_categoria),
    )
    .innerJoin(
      ubicaciones,
      eq(consumibles.id_ubicacion, ubicaciones.id_ubicacion),
    )
    .where(eq(consumibles.is_deleted, false));

  const categoriasData = await db
    .select({ id: categorias.id_categoria, nombre: categorias.tipo_categoria })
    .from(categorias);
  const ubicacionesData = await db
    .select({
      id: ubicaciones.id_ubicacion,
      nombre: ubicaciones.nombre_ubicacion,
    })
    .from(ubicaciones);

  const rolActual = await getCurrentUserRole();

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <Header title="Gestión de Consumibles" />

      <main className="flex-1 p-8 overflow-auto">
        <ConsumablesGrid
          initialData={data}
          categorias={categoriasData}
          ubicaciones={ubicacionesData}
          currentUserRole={rolActual}
        />
      </main>
    </div>
  );
}
