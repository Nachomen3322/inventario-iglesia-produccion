// Ejecutar en la terminal para crear y agregar a un usuario en la base de datos
// npx tsx scripts/add-user.ts

import { db } from "../lib/db";
import { usuarios, roles } from "../lib/schema";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";

async function main() {
  // Datos del usuario a crear
  const email = "juan2026@gmail.com";
  const password = "123";
  const nombre = "Juan";
  const nombreRol = "Consejero";

  console.log("--- Iniciando creación de usuario ---");

  try {
    // 1. Verificar si el rol ya existe
    let rol = await db.query.roles.findFirst({
      where: eq(roles.nombre_rol, nombreRol),
    });

    // Si el rol no existe, lo insertamos en la base de datos
    if (!rol) {
      console.log(`Creando rol: ${nombreRol}...`);
      const result = await db
        .insert(roles)
        .values({ nombre_rol: nombreRol })
        .returning();
      rol = result[0];
    }

    // 2. Verificar si el usuario ya existe para evitar errores de duplicidad
    const usuarioExistente = await db.query.usuarios.findFirst({
      where: eq(usuarios.email, email),
    });

    if (usuarioExistente) {
      console.log(`⚠️ El usuario con correo ${email} ya existe en el sistema.`);
      process.exit(0);
    }

    // 3. Encriptar la contraseña de forma segura
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // 4. Insertar el nuevo usuario vinculándolo con su rol
    await db.insert(usuarios).values({
      nombre_usuario: nombre,
      email: email,
      password_hash: passwordHash,
      id_rol: rol.id_rol,
    });

    console.log(`✅ Usuario creado exitosamente:`);
    console.log(`   - Correo: ${email}`);
    console.log(`   - Rol: ${nombreRol}`);
  } catch (error) {
    console.error("❌ Error crítico al crear el usuario:", error);
  } finally {
    // Terminamos el proceso limpiamente
    process.exit(0);
  }
}

main();
