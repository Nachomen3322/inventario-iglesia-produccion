import {
  pgTable,
  serial,
  varchar,
  integer,
  boolean,
  timestamp,
  customType,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// Se define el tipo vector para Drizzle
const vector = customType<{ data: number[]; notNull: false; default: false }>({
  dataType() {
    return "vector(1024)"; // 1024 dimensiones para @vladmandic/human
  },
});

export const roles = pgTable("Rol", {
  id_rol: serial("id_rol").primaryKey(),
  nombre_rol: varchar("nombre_rol", { length: 50 }).notNull().unique(),
});

export const usuarios = pgTable("Usuario", {
  id_usuario: serial("id_usuario").primaryKey(),
  nombre_usuario: varchar("nombre_usuario", { length: 100 }).notNull(),
  email: varchar("email", { length: 150 }).notNull().unique(),
  password_hash: varchar("password_hash", { length: 255 }).notNull(),
  is_active: boolean("is_active").default(true),
  biometria: vector("biometria"),
  id_rol: integer("id_rol")
    .notNull()
    .references(() => roles.id_rol),
});

export const auditoriaLogs = pgTable("Auditoria_log", {
  id_log: serial("id_log").primaryKey(),
  accion_realizada: varchar("accion_realizada", { length: 255 }).notNull(),
  fecha_hora: timestamp("fecha_hora").defaultNow().notNull(),
  direccion_ip: varchar("direccion_ip", { length: 45 }),
  id_usuario: integer("id_usuario")
    .notNull()
    .references(() => usuarios.id_usuario),
});

export const categorias = pgTable("Categoria", {
  id_categoria: serial("id_categoria").primaryKey(),
  tipo_categoria: varchar("tipo_categoria", { length: 100 }).notNull().unique(),
});

export const ubicaciones = pgTable("Ubicacion", {
  id_ubicacion: serial("id_ubicacion").primaryKey(),
  nombre_ubicacion: varchar("nombre_ubicacion", { length: 100 }).notNull(),
});

export const articulos = pgTable("Articulo", {
  id_articulo: serial("id_articulo").primaryKey(),
  nombre: varchar("nombre", { length: 150 }).notNull(),
  cantidad: integer("cantidad").notNull().default(0),
  estado_fisico: varchar("estado_fisico", { length: 50 }),
  estado_disponibilidad: varchar("estado_disponibilidad", { length: 50 }),
  is_deleted: boolean("is_deleted").default(false),
  id_categoria: integer("id_categoria")
    .notNull()
    .references(() => categorias.id_categoria),
  id_ubicacion: integer("id_ubicacion")
    .notNull()
    .references(() => ubicaciones.id_ubicacion),
});

export const consumibles = pgTable("Consumible", {
  id_consumible: serial("id_consumible").primaryKey(),
  nombre: varchar("nombre", { length: 150 }).notNull(),
  cantidad: integer("cantidad").default(0).notNull(),
  stock_minimo: integer("stock_minimo").default(0).notNull(),
  unidad_medida: varchar("unidad_medida", { length: 20 }).default("uds"),
  is_deleted: boolean("is_deleted").default(false),
  id_categoria: integer("id_categoria")
    .references(() => categorias.id_categoria)
    .notNull(),
  id_ubicacion: integer("id_ubicacion")
    .references(() => ubicaciones.id_ubicacion)
    .notNull(),
});

export const usuariosRelations = relations(usuarios, ({ one, many }) => ({
  rol: one(roles, {
    fields: [usuarios.id_rol],
    references: [roles.id_rol],
  }),
  logs: many(auditoriaLogs),
}));

export const movimientosPrestamos = pgTable("Movimiento_Prestamos", {
  id_movimiento: serial("id_movimiento").primaryKey(),
  cantidad_prestada: integer("cantidad_prestada").notNull().default(1), // <-- Nuevo campo
  autorizado_por: varchar("autorizado_por", { length: 100 }),
  destino: varchar("destino", { length: 150 }),
  fecha_inicio: timestamp("fecha_inicio").notNull(),
  fecha_retorno: timestamp("fecha_retorno"), // Actúa como "Retorno esperado"
  responsable_externo: varchar("responsable_externo", { length: 100 }),
  is_deleted: boolean("is_deleted").default(false),
  id_usuario: integer("id_usuario")
    .references(() => usuarios.id_usuario)
    .notNull(),
  id_articulo: integer("id_articulo")
    .references(() => articulos.id_articulo)
    .notNull(),
});

// Tabla aparte para recopilar datos del cambio de contraseñas
export const passwordResets = pgTable("password_resets", {
  id_reset: serial("id_reset").primaryKey(),
  email: varchar("email", { length: 255 }).notNull(),
  pin: varchar("pin", { length: 6 }).notNull(),
  creado_en: timestamp("creado_en").defaultNow().notNull(),
  expira_en: timestamp("expira_en").notNull(),
});
