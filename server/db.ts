import { eq, and } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, projects, visualBibles, scenes, stylePresets } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// ============= PROJECT QUERIES =============

export async function createProject(userId: number, name: string, description: string, selectedStyle: string, isPromptsOnly: boolean, audioUrl?: string, audioKey?: string, narrativeText?: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  try {
    // Usar .$returningId() para obtener el ID del proyecto insertado
    const result = await db.insert(projects).values({
      userId,
      name,
      description,
      selectedStyle,
      isPromptsOnly: isPromptsOnly ? 1 : 0,
      audioUrl,
      audioKey,
      narrativeText,
    }).$returningId();

    // En Drizzle con MySQL, .$returningId() retorna un array con objeto {id: number}
    const insertId = result[0]?.id;
    if (!insertId || insertId === 0) {
      throw new Error("No se pudo obtener el ID del proyecto creado");
    }

    console.log("[DB] Proyecto creado con ID:", insertId);

    return {
      insertId,
      success: true,
    };
  } catch (error) {
    console.error("[DB] Error creando proyecto:", error);
    throw error;
  }
}

export async function getProjectById(projectId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.select().from(projects).where(eq(projects.id, projectId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserProjects(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.select().from(projects).where(eq(projects.userId, userId));
}

export async function updateProject(projectId: number, updates: Partial<typeof projects.$inferInsert>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.update(projects).set(updates).where(eq(projects.id, projectId));
}

export async function deleteProject(projectId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.delete(projects).where(eq(projects.id, projectId));
}

// ============= VISUAL BIBLE QUERIES =============

export async function createVisualBible(projectId: number, style: string, colorPalette: string, coherenceInstructions: string, characters?: string, environment?: string, cinematicStyle?: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(visualBibles).values({
    projectId,
    style,
    colorPalette,
    coherenceInstructions,
    characters,
    environment,
    cinematicStyle,
  });

  return result;
}

export async function getVisualBibleByProjectId(projectId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.select().from(visualBibles).where(eq(visualBibles.projectId, projectId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// ============= SCENE QUERIES =============

export async function createScene(projectId: number, sceneNumber: number, timeStart: string, timeEnd: string, audioText: string, imagePrompt: string, animationPrompt: string, sequenceNote: string, imageUrl?: string, imageKey?: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(scenes).values({
    projectId,
    sceneNumber,
    timeStart,
    timeEnd,
    audioText,
    imagePrompt,
    animationPrompt,
    sequenceNote,
    imageUrl,
    imageKey,
  });

  return result;
}

export async function getScenesByProjectId(projectId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.select().from(scenes).where(eq(scenes.projectId, projectId));
}

export async function getSceneById(sceneId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.select().from(scenes).where(eq(scenes.id, sceneId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateScene(sceneId: number, updates: Partial<typeof scenes.$inferInsert>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.update(scenes).set(updates).where(eq(scenes.id, sceneId));
}

export async function deleteScenesByProjectId(projectId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.delete(scenes).where(eq(scenes.projectId, projectId));
}

// ============= STYLE PRESET QUERIES =============

export async function getAllStylePresets() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.select().from(stylePresets);
}

export async function getStylePresetByName(name: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.select().from(stylePresets).where(eq(stylePresets.name, name)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createStylePreset(name: string, displayName: string, instructions: string, description?: string, colorPaletteHint?: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.insert(stylePresets).values({
    name,
    displayName,
    instructions,
    description,
    colorPaletteHint,
  });
}


export async function deleteVisualBibleByProjectId(projectId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.delete(visualBibles).where(eq(visualBibles.projectId, projectId));
  return result;
}
