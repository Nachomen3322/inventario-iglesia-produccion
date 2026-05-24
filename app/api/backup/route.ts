import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  roles,
  usuarios,
  categorias,
  ubicaciones,
  articulos,
  consumibles,
  movimientosPrestamos,
  auditoriaLogs,
} from "@/lib/schema";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { eq } from "drizzle-orm";

const formatearValorSQL = (valor: unknown): string => {
  if (valor === null || valor === undefined) return "NULL";
  if (typeof valor === "number") return String(valor);
  if (typeof valor === "boolean") return valor ? "TRUE" : "FALSE";

  if (valor instanceof Date) return `'${valor.toISOString()}'`;

  if (typeof valor === "object")
    return `'${JSON.stringify(valor).replace(/'/g, "''")}'`;

  return `'${String(valor).replace(/'/g, "''")}'`;
};

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new NextResponse("No autorizado", { status: 401 });
    }

    const usuarioActual = await db.query.usuarios.findFirst({
      where: eq(usuarios.id_usuario, Number(session.user.id)),
      with: { rol: true },
    });

    if (usuarioActual?.rol.nombre_rol !== "Obispo") {
      return new NextResponse("Acceso denegado: Se requiere rol de Obispo", {
        status: 403,
      });
    }

    const datosRoles = await db.select().from(roles);
    const datosUsuarios = await db.select().from(usuarios);
    const datosCategorias = await db.select().from(categorias);
    const datosUbicaciones = await db.select().from(ubicaciones);
    const datosArticulos = await db.select().from(articulos);
    const datosConsumibles = await db.select().from(consumibles);
    const datosPrestamos = await db.select().from(movimientosPrestamos);
    const datosAuditoria = await db.select().from(auditoriaLogs);

    // Construcción del archivo SQL
    const fechaActual = new Date();
    let sqlDump = `-- ==========================================\n`;
    sqlDump += `-- Copia de Seguridad: Inventario SUD\n`;
    sqlDump += `-- Generado el: ${fechaActual.toLocaleString()}\n`;
    sqlDump += `-- Generado por: ${usuarioActual.nombre_usuario}\n`;
    sqlDump += `-- ==========================================\n\n`;

    sqlDump += `-- Tabla: Rol\n`;
    datosRoles.forEach((r) => {
      sqlDump += `INSERT INTO "Rol" (id_rol, nombre_rol) VALUES (${r.id_rol}, ${formatearValorSQL(r.nombre_rol)}) ON CONFLICT DO NOTHING;\n`;
    });

    sqlDump += `\n-- Tabla: Categoria\n`;
    datosCategorias.forEach((c) => {
      sqlDump += `INSERT INTO "Categoria" (id_categoria, tipo_categoria) VALUES (${c.id_categoria}, ${formatearValorSQL(c.tipo_categoria)}) ON CONFLICT DO NOTHING;\n`;
    });

    sqlDump += `\n-- Tabla: Ubicacion\n`;
    datosUbicaciones.forEach((u) => {
      sqlDump += `INSERT INTO "Ubicacion" (id_ubicacion, nombre_ubicacion) VALUES (${u.id_ubicacion}, ${formatearValorSQL(u.nombre_ubicacion)}) ON CONFLICT DO NOTHING;\n`;
    });

    sqlDump += `\n-- Tabla: Usuario\n`;
    datosUsuarios.forEach((u) => {
      sqlDump += `INSERT INTO "Usuario" (id_usuario, nombre_usuario, email, password_hash, id_rol, biometria) VALUES (${u.id_usuario}, ${formatearValorSQL(u.nombre_usuario)}, ${formatearValorSQL(u.email)}, ${formatearValorSQL(u.password_hash)}, ${u.id_rol}, ${formatearValorSQL(u.biometria)}) ON CONFLICT DO NOTHING;\n`;
    });

    sqlDump += `\n-- Tabla: Articulo (Activos Fijos)\n`;
    datosArticulos.forEach((a) => {
      sqlDump += `INSERT INTO "Articulo" (id_articulo, nombre, estado_fisico, estado_disponibilidad, is_deleted, id_categoria, id_ubicacion) VALUES (${a.id_articulo}, ${formatearValorSQL(a.nombre)}, ${formatearValorSQL(a.estado_fisico)}, ${formatearValorSQL(a.estado_disponibilidad)}, ${formatearValorSQL(a.is_deleted)}, ${a.id_categoria}, ${a.id_ubicacion}) ON CONFLICT DO NOTHING;\n`;
    });

    sqlDump += `\n-- Tabla: Consumible\n`;
    datosConsumibles.forEach((c) => {
      sqlDump += `INSERT INTO "Consumible" (id_consumible, nombre, cantidad, stock_minimo, unidad_medida, is_deleted, id_categoria, id_ubicacion) VALUES (${c.id_consumible}, ${formatearValorSQL(c.nombre)}, ${c.cantidad}, ${c.stock_minimo}, ${formatearValorSQL(c.unidad_medida)}, ${formatearValorSQL(c.is_deleted)}, ${c.id_categoria}, ${c.id_ubicacion}) ON CONFLICT DO NOTHING;\n`;
    });

    sqlDump += `\n-- Tabla: Movimiento_Prestamos\n`;
    datosPrestamos.forEach((p) => {
      sqlDump += `INSERT INTO "Movimiento_Prestamos" (id_movimiento, cantidad_prestada, autorizado_por, destino, fecha_inicio, fecha_retorno, responsable_externo, id_usuario, id_articulo, is_deleted) VALUES (${p.id_movimiento}, ${p.cantidad_prestada}, ${formatearValorSQL(p.autorizado_por)}, ${formatearValorSQL(p.destino)}, ${formatearValorSQL(p.fecha_inicio)}, ${formatearValorSQL(p.fecha_retorno)}, ${formatearValorSQL(p.responsable_externo)}, ${p.id_usuario}, ${p.id_articulo}, ${formatearValorSQL(p.is_deleted)}) ON CONFLICT DO NOTHING;\n`;
    });

    sqlDump += `\n-- Tabla: Auditoria_log\n`;
    datosAuditoria.forEach((a) => {
      sqlDump += `INSERT INTO "Auditoria_log" (id_log, accion_realizada, fecha_hora, id_usuario, direccion_ip) VALUES (${a.id_log}, ${formatearValorSQL(a.accion_realizada)}, ${formatearValorSQL(a.fecha_hora)}, ${a.id_usuario}, ${formatearValorSQL(a.direccion_ip)}) ON CONFLICT DO NOTHING;\n`;
    });

    const nombreArchivo = `respaldo_inventario_${fechaActual.toISOString().split("T")[0]}.sql`;

    return new NextResponse(sqlDump, {
      headers: {
        "Content-Type": "application/sql",
        "Content-Disposition": `attachment; filename="${nombreArchivo}"`,
      },
    });
  } catch (error) {
    console.error("Error al generar backup SQL:", error);
    return new NextResponse("Error interno al generar la copia de seguridad", {
      status: 500,
    });
  }
}
