"use server";

import { db } from "@/lib/db";
import { eq } from "drizzle-orm";
import { usuarios } from "@/lib/schema";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

async function validarPermisosAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return false;

  const usuario = await db.query.usuarios.findFirst({
    where: eq(usuarios.id_usuario, Number(session.user.id)),
    with: { rol: true },
  });

  return usuario?.rol.nombre_rol === "Obispo";
}

export async function crearUsuario(formData: FormData) {
  const nombre = formData.get("nombre") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const id_rol = Number(formData.get("id_rol"));

  if (!nombre || !email || !password || !id_rol) {
    return { error: "Todos los campos son obligatorios" };
  }

  try {
    const passwordHash = await bcrypt.hash(password, 10);

    await db.insert(usuarios).values({
      nombre_usuario: nombre,
      email,
      password_hash: passwordHash,
      id_rol,
    });

    revalidatePath("/configuracion");

    return { success: true };
  } catch (error) {
    console.error("Error al crear usuario:", error);
    return { error: "El correo electrónico ya está registrado." };
  }
}

export async function actualizarUsuario(
  id_usuario: number,
  formData: FormData,
) {
  const tienePermiso = await validarPermisosAdmin();
  if (!tienePermiso)
    return { error: "No tienes permisos para realizar esta acción." };

  const nombre = formData.get("nombre") as string;
  const email = formData.get("email") as string;
  const id_rol = Number(formData.get("id_rol"));

  try {
    await db
      .update(usuarios)
      .set({ nombre_usuario: nombre, email, id_rol })
      .where(eq(usuarios.id_usuario, id_usuario));

    revalidatePath("/configuracion");

    return { success: true };
  } catch (error) {
    return { error: "Error al actualizar el usuario." };
  }
}

export async function borrarUsuario(id_usuario: number) {
  const tienePermiso = await validarPermisosAdmin();
  if (!tienePermiso)
    return { error: "Solo el Obispo puede eliminar usuarios." };

  try {
    await db.delete(usuarios).where(eq(usuarios.id_usuario, id_usuario));

    revalidatePath("/configuracion");
    return { success: true };
  } catch (error) {
    return {
      error:
        "No se puede eliminar el usuario. Es posible que tenga registros asociados en auditoría o préstamos.",
    };
  }
}
