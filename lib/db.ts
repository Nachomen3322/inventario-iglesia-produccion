import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";
import "dotenv/config";

if (!process.env.DATABASE_URL) {
  throw new Error("La variable de entorno DATABASE_URL no está definida");
}

// Inicializa el cliente de Neon
const sql = neon(process.env.DATABASE_URL);

// Exporta la instancia de db configurada para Neon con el esquema
export const db = drizzle(sql, { schema });
