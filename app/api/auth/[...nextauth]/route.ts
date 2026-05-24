import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { usuarios, roles } from "@/lib/schema";
import { eq, sql } from "drizzle-orm";
import { registrarLogAuditoria } from "@/lib/audit";

interface BiometricResult {
  id_usuario: number;
  email: string;
  nombre_usuario: string;
  nombre_rol: string;
  distance: number;
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Correo", type: "email" },
        password: { label: "Contraseña", type: "password" },
        vector: { label: "Vector Biométrico", type: "text" },
      },
      async authorize(credentials) {
        // FLUJO 2: LOGIN CON RECONOCIMIENTO FACIAL
        if (credentials?.vector) {
          const vectorArray = JSON.parse(credentials.vector);
          const vectorString = `[${vectorArray.join(",")}]`;

          const query = sql`
            SELECT u.id_usuario, u.email, u.nombre_usuario, r.nombre_rol, u.biometria <=> ${vectorString}::vector as distance 
            FROM "Usuario" u
            INNER JOIN "Rol" r ON u.id_rol = r.id_rol
            WHERE u.biometria IS NOT NULL 
            ORDER BY distance ASC 
            LIMIT 1
          `;

          const { rows } = await db.execute(query);
          const match = rows[0] as unknown as BiometricResult | undefined;

          if (match && Number(match.distance) < 0.25) {
            await registrarLogAuditoria(
              `Inicio de sesión Biometrico exitoso ${match.email}`,
              match.id_usuario,
            );
            return {
              id: match.id_usuario.toString(),
              email: match.email,
              name: match.nombre_usuario,
              role: match.nombre_rol,
            };
          }
          await registrarLogAuditoria(
            `Intento de Inicio de Sesion Biometrico Fallido`,
            match?.id_usuario,
          );
          throw new Error("Rostro no reconocido por el sistema.");
        }

        // FLUJO 1: LOGIN MEDIANTE CREDENCIALES
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Faltan credenciales");
        }

        const result = await db
          .select({
            id_usuario: usuarios.id_usuario,
            email: usuarios.email,
            nombre_usuario: usuarios.nombre_usuario,
            password_hash: usuarios.password_hash,
            nombre_rol: roles.nombre_rol,
          })
          .from(usuarios)
          .innerJoin(roles, eq(usuarios.id_rol, roles.id_rol))
          .where(eq(usuarios.email, credentials.email))
          .limit(1);

        const user = result[0];

        if (
          !user ||
          !(await bcrypt.compare(credentials.password, user.password_hash))
        ) {
          await registrarLogAuditoria(
            `Intento de Inicio de Sesion por Credenciales Fallido`,
            user.id_usuario,
          );
          throw new Error("Credenciales incorrectas");
        }

        //Descomentar para habilitar auditoria de quien inicia sesion mediante credenciales
        /*         await registrarLogAuditoria(
          `Inicio de sesión por Credenciales exitoso ${user.email}`,
          user.id_usuario,
        ); */

        return {
          id: user.id_usuario.toString(),
          email: user.email,
          name: user.nombre_usuario,
          role: user.nombre_rol,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role;
        session.user.id = token.id;
      }
      return session;
    },
  },
  session: { strategy: "jwt", maxAge: 15 * 60, updateAge: 5 * 60 },
  pages: { signIn: "/login" },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
