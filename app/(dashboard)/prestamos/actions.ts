"use server";

import { db } from "@/lib/db";
import { movimientosPrestamos, articulos } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { registrarLogAuditoria } from "@/lib/audit";

export type RegisterLoanInput = {
  id_articulo: number;
  cantidad_prestada: number;
  autorizado_por: string;
  destino: string;
  fecha_inicio: Date;
  fecha_retorno: Date;
  responsable_externo: string;
  id_usuario: number;
};

export type ActionResponse = {
  success: boolean;
  message: string;
};

export async function registrarPrestamo(
  data: RegisterLoanInput,
): Promise<ActionResponse> {
  try {
    const articulo = await db
      .select({ cantidad: articulos.cantidad, nombre: articulos.nombre })
      .from(articulos)
      .where(eq(articulos.id_articulo, data.id_articulo))
      .limit(1);

    if (articulo.length === 0) {
      return { success: false, message: "El artículo seleccionado no existe." };
    }

    if (data.cantidad_prestada > articulo[0].cantidad) {
      return {
        success: false,
        message: `El artículo seleccionado (${articulo[0].nombre}) tiene registrado ${articulo[0].cantidad} unidades, por lo que sobrepasa lo seleccionado.`,
      };
    }

    await db.insert(movimientosPrestamos).values({
      id_articulo: data.id_articulo,
      cantidad_prestada: data.cantidad_prestada,
      autorizado_por: data.autorizado_por,
      destino: data.destino,
      fecha_inicio: data.fecha_inicio,
      fecha_retorno: data.fecha_retorno,
      responsable_externo: data.responsable_externo,
      id_usuario: data.id_usuario,
    });

    await db
      .update(articulos)
      .set({ estado_disponibilidad: "Prestado" })
      .where(eq(articulos.id_articulo, data.id_articulo));

    await registrarLogAuditoria(
      `Aprobó préstamo de activo #${data.id_articulo} a ${data.responsable_externo}`,
    );

    revalidatePath("/prestamos");
    return { success: true, message: "Préstamo registrado exitosamente." };
  } catch (error: unknown) {
    console.error("Error al registrar préstamo:", error);
    return {
      success: false,
      message: "Hubo un error al procesar el préstamo.",
    };
  }
}

export type EditLoanInput = {
  id_movimiento: number;
  id_articulo: number;
  cantidad_prestada: number;
  responsable_externo: string;
  destino: string;
  fecha_inicio: Date;
  fecha_retorno: Date;
};

export async function editarPrestamo(
  data: EditLoanInput,
): Promise<ActionResponse> {
  try {
    const prestamoActual = await db
      .select({ id_articulo: movimientosPrestamos.id_articulo })
      .from(movimientosPrestamos)
      .where(eq(movimientosPrestamos.id_movimiento, data.id_movimiento))
      .limit(1);

    if (prestamoActual.length === 0) {
      return { success: false, message: "Préstamo no encontrado." };
    }

    const oldIdArticulo = prestamoActual[0].id_articulo;
    const newIdArticulo = data.id_articulo;

    await db
      .update(movimientosPrestamos)
      .set({
        id_articulo: data.id_articulo,
        cantidad_prestada: data.cantidad_prestada,
        responsable_externo: data.responsable_externo,
        destino: data.destino,
        fecha_inicio: data.fecha_inicio,
        fecha_retorno: data.fecha_retorno,
      })
      .where(eq(movimientosPrestamos.id_movimiento, data.id_movimiento));

    if (oldIdArticulo !== newIdArticulo) {
      await db
        .update(articulos)
        .set({ estado_disponibilidad: "Disponible" })
        .where(eq(articulos.id_articulo, oldIdArticulo));

      await db
        .update(articulos)
        .set({ estado_disponibilidad: "Prestado" })
        .where(eq(articulos.id_articulo, newIdArticulo));
    }

    await registrarLogAuditoria(
      `Modificó los detalles del préstamo #${data.id_movimiento}`,
    );

    revalidatePath("/prestamos");
    revalidatePath("/activos");

    return { success: true, message: "Préstamo actualizado correctamente." };
  } catch (error: unknown) {
    console.error("Error al editar préstamo:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Error desconocido";
    return { success: false, message: `Hubo un error: ${errorMessage}` };
  }
}

export async function eliminarPrestamo(
  id_movimiento: number,
): Promise<ActionResponse> {
  try {
    const prestamo = await db
      .select({ id_articulo: movimientosPrestamos.id_articulo })
      .from(movimientosPrestamos)
      .where(eq(movimientosPrestamos.id_movimiento, id_movimiento))
      .limit(1);

    if (prestamo.length === 0) {
      return { success: false, message: "Préstamo no encontrado." };
    }

    const idArticulo = prestamo[0].id_articulo;

    await db
      .update(movimientosPrestamos)
      .set({ is_deleted: true })
      .where(eq(movimientosPrestamos.id_movimiento, id_movimiento));

    await db
      .update(articulos)
      .set({ estado_disponibilidad: "Disponible" })
      .where(eq(articulos.id_articulo, idArticulo));

    await registrarLogAuditoria(
      `Finalizó/Canceló el préstamo #${id_movimiento}`,
    );

    revalidatePath("/prestamos");
    revalidatePath("/activos");

    return {
      success: true,
      message: "Préstamo dado de baja y artículo liberado.",
    };
  } catch (error: unknown) {
    console.error("Error al eliminar préstamo:", error);
    return { success: false, message: "Error al eliminar el préstamo." };
  }
}
