"use server";

import { db } from "@/lib/db";
import { usuarios, passwordResets } from "@/lib/schema";
import { eq, and, gt } from "drizzle-orm";
import bcrypt from "bcryptjs";
import nodemailer from "nodemailer";
import { registrarLogAuditoria } from "@/lib/audit";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  tls: {
    // Evita que Node.js rechace certificados auto-firmados, colocar true en produccion
    rejectUnauthorized: false,
  },
});

export async function solicitarPinReset(email: string) {
  try {
    const user = await db.query.usuarios.findFirst({
      where: eq(usuarios.email, email),
    });

    if (!user) {
      return { error: "No se encontró su correo en el sistema." };
    }

    const pin = Math.floor(100000 + Math.random() * 900000).toString();

    const expiraEn = new Date();
    expiraEn.setMinutes(expiraEn.getMinutes() + 10);

    await db.delete(passwordResets).where(eq(passwordResets.email, email));
    await db.insert(passwordResets).values({
      email,
      pin,
      expira_en: expiraEn,
    });

    await transporter.sendMail({
      from: `"Inventario SUD" <${process.env.SMTP_USER}>`,
      to: email,
      subject: "Código de Recuperación de Contraseña",
      html: `<h2>Recuperación de Contraseña</h2>
             <p>Su código de verificación es: <strong style="font-size: 24px; letter-spacing: 2px;">${pin}</strong></p>
             <p>Este código expirará en 10 minutos.</p>`,
    });

    return { success: true };
  } catch (error) {
    console.error("Error al enviar PIN:", error);
    return { error: "Ocurrió un error al enviar el correo." };
  }
}

export async function cambiarPasswordConPin(
  email: string,
  pin: string,
  nuevaPassword: string,
) {
  try {
    const ahora = new Date();

    const resetRecord = await db.query.passwordResets.findFirst({
      where: and(
        eq(passwordResets.email, email),
        eq(passwordResets.pin, pin),
        gt(passwordResets.expira_en, ahora),
      ),
    });

    if (!resetRecord) {
      return { error: "El PIN es incorrecto o ha expirado." };
    }

    const passwordHash = await bcrypt.hash(nuevaPassword, 10);

    await db
      .update(usuarios)
      .set({ password_hash: passwordHash })
      .where(eq(usuarios.email, email));

    await db.delete(passwordResets).where(eq(passwordResets.email, email));

    return { success: true };
  } catch (error) {
    console.error("Error al cambiar contraseña:", error);
    return { error: "Error interno al actualizar la contraseña." };
  }
}
