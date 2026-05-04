import { Router, Request, Response } from "express";
import { generateImagesZip } from "./zipService";
import { getDb } from "./db";

const router = Router();

/**
 * Endpoint para descargar ZIP de imágenes
 * GET /api/export/download-zip?projectId=123
 */
router.get("/download-zip", async (req: Request, res: Response) => {
  try {
    const projectId = parseInt(req.query.projectId as string);

    if (!projectId || isNaN(projectId)) {
      return res.status(400).json({ error: "projectId inválido" });
    }

    // Obtener nombre del proyecto
    const db = await getDb();
    if (!db) {
      return res.status(500).json({ error: "Database not available" });
    }

    // Importar función para obtener proyecto
    const { getProjectById } = await import("./db");
    const project = await getProjectById(projectId);

    if (!project) {
      return res.status(404).json({ error: "Proyecto no encontrado" });
    }

    // Generar ZIP
    const { stream, filename } = await generateImagesZip(projectId, project.name);

    // Configurar headers para descarga
    res.setHeader("Content-Type", "application/zip");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");

    // Enviar stream
    stream.pipe(res);

    // Manejar errores del stream
    stream.on("error", (error) => {
      console.error("[DownloadZipRoute] Error en stream:", error);
      if (!res.headersSent) {
        res.status(500).json({ error: "Error generando ZIP" });
      }
    });

    res.on("error", (error) => {
      console.error("[DownloadZipRoute] Error en respuesta:", error);
    });
  } catch (error) {
    console.error("[DownloadZipRoute] Error:", error);
    res.status(500).json({
      error: error instanceof Error ? error.message : "Error desconocido",
    });
  }
});

export default router;
