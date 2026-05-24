import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { usuarios } from "@/lib/schema";
import { eq, sql } from "drizzle-orm";
import { registrarLogAuditoria } from "@/lib/audit";

export async function POST(req: Request) {
  try {
    const { userId, vector, action } = await req.json();

    if (!vector)
      return NextResponse.json(
        { error: "Falta el vector biométrico" },
        { status: 400 },
      );

    const vectorString = `[${vector.join(",")}]`;

    if (action === "register") {
      // CASO 1: GUARDAR/RECALIBRAR (Desde Configuración)
      if (!userId)
        return NextResponse.json({ error: "Falta userId" }, { status: 400 });

      await db
        .update(usuarios)
        .set({ biometria: sql`${vectorString}::vector` })
        .where(eq(usuarios.id_usuario, Number(userId)));

      await registrarLogAuditoria(`Se Activo/Recalibro la Biometria`, userId);

      return NextResponse.json({
        success: true,
        message: "Biometría guardada exitosamente",
      });
    } else if (action === "login") {
      // CASO 2: LOGIN FACIAL (Desde pantalla de Login) ---
      const query = sql`
        SELECT id_usuario, email, nombre_usuario, biometria <=> ${vectorString}::vector as distance 
        FROM "Usuario" 
        WHERE biometria IS NOT NULL 
        ORDER BY distance ASC 
        LIMIT 1
      `;

      const { rows } = await db.execute(query);
      const match = rows[0];

      if (match && Number(match.distance) < 0.25) {
        return NextResponse.json({
          success: true,
          user: {
            id: match.id_usuario,
            email: match.email,
            name: match.nombre_usuario,
          },
        });
      } else {
        return NextResponse.json(
          { success: false, error: "Rostro no reconocido" },
          { status: 401 },
        );
      }
    }
  } catch (error) {
    console.error("Error en biometría:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 },
    );
  }
}
