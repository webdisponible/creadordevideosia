import archiver from "archiver";
import { PassThrough } from "stream";
import { getDb } from "./db";
import { eq } from "drizzle-orm";
import { scenes } from "../drizzle/schema";

export interface ZipGenerationResult {
  stream: PassThrough;
  filename: string;
  size?: number;
}

/**
 * Genera un archivo ZIP con todas las imágenes de un proyecto
 * @param projectId ID del proyecto
 * @param projectName Nombre del proyecto para el archivo ZIP
 * @returns Stream del archivo ZIP y nombre del archivo
 */
export async function generateImagesZip(
  projectId: number,
  projectName: string
): Promise<ZipGenerationResult> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  // Obtener todas las escenas con imágenes
  const projectScenes = await db
    .select()
    .from(scenes)
    .where(eq(scenes.projectId, projectId))
    .orderBy(scenes.sceneNumber);

  // Filtrar escenas que tienen imagen
  const scenesWithImages = projectScenes.filter((scene) => scene.imageUrl);

  if (scenesWithImages.length === 0) {
    throw new Error(
      "No hay imágenes disponibles para descargar en este proyecto"
    );
  }

  // Crear archivo ZIP
  const output = new PassThrough();
  const archive = archiver("zip", {
    zlib: { level: 9 }, // Máxima compresión
  });

  // Manejar errores del archive
  archive.on("error", (err) => {
    console.error("[ZipService] Error en archive:", err);
    output.destroy(err);
  });

  // Conectar archive al output stream
  archive.pipe(output);

  // Agregar cada imagen al ZIP
  for (const scene of scenesWithImages) {
    if (!scene.imageUrl) continue;

    try {
      console.log(
        `[ZipService] Descargando imagen para escena ${scene.sceneNumber}...`
      );

      // Descargar la imagen
      const response = await fetch(scene.imageUrl);

      if (!response.ok) {
        console.warn(
          `[ZipService] Error descargando imagen de escena ${scene.sceneNumber}: ${response.statusText}`
        );
        continue;
      }

      // Obtener el buffer de la imagen
      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // Determinar la extensión del archivo
      const contentType = response.headers.get("content-type") || "image/png";
      const extension = getImageExtension(contentType);

      // Agregar al ZIP con nombre descriptivo
      const filename = `escena_${String(scene.sceneNumber).padStart(2, "0")}${extension}`;
      archive.append(buffer, { name: filename });

      console.log(
        `[ZipService] Agregado ${filename} al ZIP (${buffer.length} bytes)`
      );
    } catch (error) {
      console.error(
        `[ZipService] Error procesando imagen de escena ${scene.sceneNumber}:`,
        error
      );
      // Continuar con la siguiente imagen
    }
  }

  // Finalizar el archivo ZIP
  await archive.finalize();

  // Generar nombre del archivo ZIP
  const sanitizedName = projectName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  const filename = `storyboard-${sanitizedName}-${Date.now()}.zip`;

  return {
    stream: output,
    filename,
  };
}

/**
 * Determina la extensión de archivo basada en el tipo MIME
 */
function getImageExtension(contentType: string): string {
  const mimeToExt: Record<string, string> = {
    "image/jpeg": ".jpg",
    "image/jpg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
    "image/gif": ".gif",
    "image/svg+xml": ".svg",
  };

  return mimeToExt[contentType] || ".png";
}
