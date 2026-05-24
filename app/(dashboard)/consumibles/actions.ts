"use server";

import { db } from "@/lib/db";
import { consumibles } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { registrarLogAuditoria } from "@/lib/audit";

export async function actualizarStock(
  id_consumible: number,
  nuevaCantidad: number,
) {
  try {
    const cantidadFinal = nuevaCantidad < 0 ? 0 : nuevaCantidad;

    const consumible = await db
      .select({ nombre: consumibles.nombre })
      .from(consumibles)
      .where(eq(consumibles.id_consumible, id_consumible))
      .limit(1);
    const nombre =
      consumible.length > 0 ? consumible[0].nombre : `#${id_consumible}`;

    await db
      .update(consumibles)
      .set({ cantidad: cantidadFinal })
      .where(eq(consumibles.id_consumible, id_consumible));

    await registrarLogAuditoria(
      `Actualizó stock de ${nombre} a ${cantidadFinal} unidades`,
    );

    revalidatePath("/consumibles");
    return { success: true };
  } catch (error: unknown) {
    console.error("Error al actualizar stock:", error);
    return { success: false, message: "Error al actualizar el inventario." };
  }
}

export type RegisterConsumableInput = {
  nombre: string;
  cantidad: number;
  stock_minimo: number;
  unidad_medida: string;
  id_categoria: number;
  id_ubicacion: number;
};

export type ActionResponse = {
  success: boolean;
  message: string;
};

export async function registrarConsumible(
  data: RegisterConsumableInput,
): Promise<ActionResponse> {
  try {
    await db.insert(consumibles).values({
      nombre: data.nombre,
      cantidad: data.cantidad,
      stock_minimo: data.stock_minimo,
      unidad_medida: data.unidad_medida,
      id_categoria: data.id_categoria,
      id_ubicacion: data.id_ubicacion,
      is_deleted: false,
    });

    await registrarLogAuditoria(
      `Registró el consumible: ${data.nombre} con stock inicial de ${data.cantidad}`,
    );

    revalidatePath("/consumibles");
    return { success: true, message: "Consumible registrado correctamente." };
  } catch (error: unknown) {
    console.error("Error al registrar consumible:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Error desconocido";
    return { success: false, message: `Hubo un error: ${errorMessage}` };
  }
}

export type EditConsumableInput = {
  id_consumible: number;
  nombre: string;
  cantidad: number;
  stock_minimo: number;
  unidad_medida: string;
  id_categoria: number;
  id_ubicacion: number;
};

export async function darDeBajaConsumible(
  id_consumible: number,
): Promise<ActionResponse> {
  try {
    await db
      .update(consumibles)
      .set({ is_deleted: true })
      .where(eq(consumibles.id_consumible, id_consumible));

    await registrarLogAuditoria(`Dio de baja el consumible #${id_consumible}`);

    revalidatePath("/consumibles");
    return { success: true, message: "Consumible eliminado correctamente." };
  } catch (error: unknown) {
    console.error("Error al dar de baja:", error);
    return { success: false, message: "Error al eliminar el consumible." };
  }
}

export async function editarConsumible(
  data: EditConsumableInput,
): Promise<ActionResponse> {
  try {
    await db
      .update(consumibles)
      .set({
        nombre: data.nombre,
        cantidad: data.cantidad,
        stock_minimo: data.stock_minimo,
        unidad_medida: data.unidad_medida,
        id_categoria: data.id_categoria,
        id_ubicacion: data.id_ubicacion,
      })
      .where(eq(consumibles.id_consumible, data.id_consumible));

    await registrarLogAuditoria(
      `Editó configuración del consumible #${data.id_consumible}`,
    );

    revalidatePath("/consumibles");
    return { success: true, message: "Consumible actualizado." };
  } catch (error: unknown) {
    console.error("Error al editar:", error);
    return { success: false, message: "Error al editar el consumible." };
  }
}
