import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Projects table: almacena los proyectos de cada usuario
 */
export const projects = mysqlTable("projects", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  audioUrl: varchar("audioUrl", { length: 1024 }),
  audioKey: varchar("audioKey", { length: 255 }),
  narrativeText: text("narrativeText"),
  selectedStyle: varchar("selectedStyle", { length: 255 }).notNull().default("cinematographic"),
  isPromptsOnly: int("isPromptsOnly").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Project = typeof projects.$inferSelect;
export type InsertProject = typeof projects.$inferInsert;

/**
 * Visual Bibles table: almacena la "Biblia Visual" de cada proyecto
 * Se genera una sola vez por proyecto y se aplica a todas las escenas
 */
export const visualBibles = mysqlTable("visual_bibles", {
  id: int("id").autoincrement().primaryKey(),
  projectId: int("projectId").notNull(),
  style: varchar("style", { length: 1024 }).notNull(),
  colorPalette: text("colorPalette").notNull(),
  characters: text("characters"),
  environment: text("environment"),
  cinematicStyle: text("cinematicStyle"),
  coherenceInstructions: text("coherenceInstructions").notNull(),
  generatedAt: timestamp("generatedAt").defaultNow().notNull(),
});

export type VisualBible = typeof visualBibles.$inferSelect;
export type InsertVisualBible = typeof visualBibles.$inferInsert;

/**
 * Scenes table: almacena cada escena del proyecto
 */
export const scenes = mysqlTable("scenes", {
  id: int("id").autoincrement().primaryKey(),
  projectId: int("projectId").notNull(),
  sceneNumber: int("sceneNumber").notNull(),
  timeStart: varchar("timeStart", { length: 12 }).notNull(),
  timeEnd: varchar("timeEnd", { length: 12 }).notNull(),
  audioText: text("audioText").notNull(),
  imagePrompt: text("imagePrompt").notNull(),
  animationPrompt: text("animationPrompt").notNull(),
  sequenceNote: text("sequenceNote").notNull(),
  imageUrl: varchar("imageUrl", { length: 1024 }),
  imageKey: varchar("imageKey", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Scene = typeof scenes.$inferSelect;
export type InsertScene = typeof scenes.$inferInsert;

/**
 * Style Presets table: almacena los estilos visuales predefinidos
 */
export const stylePresets = mysqlTable("style_presets", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull().unique(),
  displayName: varchar("displayName", { length: 255 }).notNull(),
  description: text("description"),
  instructions: text("instructions").notNull(),
  colorPaletteHint: text("colorPaletteHint"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type StylePreset = typeof stylePresets.$inferSelect;
export type InsertStylePreset = typeof stylePresets.$inferInsert;