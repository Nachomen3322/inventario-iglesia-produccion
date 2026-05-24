"use server";

import { db } from "@/lib/db";
import { articulos } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { registrarLogAuditoria } from "@/lib/audit";

export type RegisterAssetInput = {
  nombre: string;
  cantidad: number;
  estado_fisico: string;
  id_categoria: number;
  id_ubicacion: number;
};

export type ActionResponse = {
  success: boolean;
  message: string;
};

export async function darDeBajaActivo(id_articulo: number) {
  try {
    await db
      .update(articulos)
      .set({ is_deleted: true, estado_disponibilidad: "Agotado/Baja" })
      .where(eq(articulos.id_articulo, id_articulo));

    await registrarLogAuditoria(`Dio de baja el activo #${id_articulo}`);

    revalidatePath("/activos");
    return { success: true, message: "Activo dado de baja correctamente." };
  } catch (error) {
    console.error("Error al dar de baja el activo:", error);
    return {
      success: false,
      message: "Hubo un error al procesar la solicitud.",
    };
  }
}

export async function registrarActivo(
  data: RegisterAssetInput,
): Promise<ActionResponse> {
  try {
    const disponibilidadInicial =
      data.estado_fisico === "Dañado" ? "No Disponible" : "Disponible";
    await db.insert(articulos).values({
      nombre: data.nombre,
      cantidad: data.cantidad,
      estado_fisico: data.estado_fisico,
      id_categoria: data.id_categoria,
      id_ubicacion: data.id_ubicacion,
      estado_disponibilidad: disponibilidadInicial,
      is_deleted: false,
    });
    await registrarLogAuditoria(
      `Registró el activo: ${data.nombre} (${data.cantidad} uds)`,
    );

    revalidatePath("/activos");
    return { success: true, message: "Activo registrado correctamente." };
  } catch (error: unknown) {
    console.error("Error al registrar el activo:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Error desconocido";
    return {
      success: false,
      message: `Hubo un error al procesar la solicitud: ${errorMessage}`,
    };
  }
}

export type EditAssetInput = {
  id_articulo: number;
  nombre: string;
  cantidad: number;
  estado_fisico: string;
  estado_disponibilidad: string;
  id_categoria: number;
  id_ubicacion: number;
};

export async function editarActivo(
  data: EditAssetInput,
): Promise<ActionResponse> {
  try {
    await db
      .update(articulos)
      .set({
        nombre: data.nombre,
        cantidad: data.cantidad,
        estado_fisico: data.estado_fisico,
        estado_disponibilidad: data.estado_disponibilidad,
        id_categoria: data.id_categoria,
        id_ubicacion: data.id_ubicacion,
      })
      .where(eq(articulos.id_articulo, data.id_articulo));

    await registrarLogAuditoria(
      `Actualizó características del activo #${data.id_articulo}: ${data.nombre}`,
    );

    revalidatePath("/activos");
    return { success: true, message: "Activo actualizado correctamente." };
  } catch (error: unknown) {
    console.error("Error al editar el activo:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Error desconocido";
    return {
      success: false,
      message: `Hubo un error al procesar la solicitud: ${errorMessage}`,
    };
  }
}
