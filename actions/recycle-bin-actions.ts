"use server";

import { db } from "@/lib/db";
import { articulos, consumibles, movimientosPrestamos } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function restaurarActivo(id: number) {
  try {
    await db
      .update(articulos)
      .set({ is_deleted: false })
      .where(eq(articulos.id_articulo, id));
    revalidatePath("/configuracion");
    return { success: true };
  } catch (error) {
    return { success: false, message: "Error al restaurar activo" };
  }
}

export async function eliminarActivoPermanente(id: number) {
  try {
    await db.delete(articulos).where(eq(articulos.id_articulo, id));
    revalidatePath("/configuracion");
    return { success: true };
  } catch (error) {
    return {
      success: false,
      message:
        "Error al eliminar activo. Asegúrese de que no tenga dependencias.",
    };
  }
}

export async function restaurarConsumible(id: number) {
  try {
    await db
      .update(consumibles)
      .set({ is_deleted: false })
      .where(eq(consumibles.id_consumible, id));
    revalidatePath("/configuracion");
    return { success: true };
  } catch (error) {
    return { success: false, message: "Error al restaurar consumible" };
  }
}

export async function eliminarConsumiblePermanente(id: number) {
  try {
    await db.delete(consumibles).where(eq(consumibles.id_consumible, id));
    revalidatePath("/configuracion");
    return { success: true };
  } catch (error) {
    return { success: false, message: "Error al eliminar consumible." };
  }
}

export async function restaurarPrestamo(id: number) {
  try {
    const prestamo = await db
      .select({ id_articulo: movimientosPrestamos.id_articulo })
      .from(movimientosPrestamos)
      .where(eq(movimientosPrestamos.id_movimiento, id))
      .limit(1);

    if (prestamo.length === 0) {
      return { success: false, message: "Préstamo no encontrado." };
    }

    const idArticulo = prestamo[0].id_articulo;

    await db
      .update(movimientosPrestamos)
      .set({ is_deleted: false })
      .where(eq(movimientosPrestamos.id_movimiento, id));

    await db
      .update(articulos)
      .set({ estado_disponibilidad: "Prestado" })
      .where(eq(articulos.id_articulo, idArticulo));

    revalidatePath("/configuracion");
    return { success: true };
  } catch (error) {
    return { success: false, message: "Error al restaurar préstamo" };
  }
}

export async function eliminarPrestamoPermanente(id: number) {
  try {
    await db
      .delete(movimientosPrestamos)
      .where(eq(movimientosPrestamos.id_movimiento, id));
    revalidatePath("/configuracion");
    return { success: true };
  } catch (error) {
    return { success: false, message: "Error al eliminar préstamo." };
  }
}
