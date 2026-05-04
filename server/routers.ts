import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import { generateVisualBible, generateNarrativeSegments } from "./narrativeProcessor";
import { StylePresetKey } from "@shared/stylePresets";
import { generateImage } from "./_core/imageGeneration";
// import { storagePut } from "./storage"; // TODO: usar si se necesita guardar imágenes en storage

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  projects: router({
    /**
     * Crear un nuevo proyecto
     */
    create: protectedProcedure
      .input(
        z.object({
          name: z.string().min(1, "El nombre del proyecto es requerido"),
          description: z.string().optional(),
          selectedStyle: z.string().default("cinematographic"),
          isPromptsOnly: z.boolean().default(false),
          narrativeText: z.string().optional(),
          audioUrl: z.string().optional(),
          audioKey: z.string().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const result = await db.createProject(
          ctx.user.id,
          input.name,
          input.description || "",
          input.selectedStyle,
          input.isPromptsOnly,
          input.audioUrl,
          input.audioKey,
          input.narrativeText
        );

        if (!result.insertId || result.insertId === 0) {
          throw new Error("Error al crear el proyecto: no se obtuvo ID valido");
        }

        return {
          projectId: result.insertId,
          success: true,
        };
      }),

    /**
     * Obtener lista de proyectos del usuario
     */
    list: protectedProcedure.query(async ({ ctx }) => {
      return await db.getUserProjects(ctx.user.id);
    }),

    /**
     * Obtener un proyecto específico con todas sus escenas
     */
    getById: protectedProcedure
      .input(z.object({ projectId: z.number() }))
      .query(async ({ input, ctx }) => {
        const project = await db.getProjectById(input.projectId);

        if (!project || project.userId !== ctx.user.id) {
          throw new Error("Proyecto no encontrado o no autorizado");
        }

        const scenes = await db.getScenesByProjectId(input.projectId);
        const visualBible = await db.getVisualBibleByProjectId(input.projectId);

        return {
          project,
          scenes,
          visualBible,
        };
      }),

    /**
     * Generar storyboard completo a partir de narrativa
     */
    generateStoryboard: protectedProcedure
      .input(
        z.object({
          projectId: z.number(),
          narrativeText: z.string().min(10, "La narrativa debe tener al menos 10 caracteres"),
          selectedStyle: z.string(),
          isPromptsOnly: z.boolean().default(false),
        })
      )
      .mutation(async ({ input, ctx }) => {
        // Verificar que el proyecto pertenece al usuario
        const project = await db.getProjectById(input.projectId);
        if (!project || project.userId !== ctx.user.id) {
          throw new Error("Proyecto no encontrado o no autorizado");
        }

        try {
          // Paso 1: Generar Biblia Visual
          console.log("[Storyboard] Generando Biblia Visual...");
          const visualBible = await generateVisualBible(
            input.narrativeText,
            input.selectedStyle as StylePresetKey
          );

          // Guardar Biblia Visual en BD
          await db.createVisualBible(
            input.projectId,
            visualBible.style,
            visualBible.colorPalette,
            visualBible.coherenceInstructions,
            visualBible.characters,
            visualBible.environment,
            visualBible.cinematicStyle
          );

          // Paso 2: Generar segmentos narrativos
          console.log("[Storyboard] Generando segmentos narrativos...");
          const segments = await generateNarrativeSegments(
            input.narrativeText,
            visualBible,
            input.selectedStyle as StylePresetKey
          );

          // Paso 3: Crear escenas en BD y generar imágenes (si no es modo solo-prompts)
          console.log(`[Storyboard] Creando ${segments.length} escenas...`);
          const createdScenes = [];
          const sceneErrors: Array<{ sceneNumber: number; error: string }> = [];

          for (const segment of segments) {
            let imageUrl: string | undefined;
            let imageKey: string | undefined;
            let generationError: string | undefined;

            // Generar imagen base si no está en modo solo-prompts
            if (!input.isPromptsOnly) {
              try {
                console.log(`[Storyboard] Generando imagen para escena ${segment.sceneNumber}...`);
                const imageResult = await generateImage({
                  prompt: segment.imagePrompt,
                });

                if (imageResult.url) {
                  imageUrl = imageResult.url;
                  // Opcionalmente guardar en storage si es necesario
                  // imageKey = `project-${input.projectId}/scene-${segment.sceneNumber}.png`;
                }
              } catch (error) {
                const errorMsg = error instanceof Error ? error.message : "Error desconocido";
                console.error(`Error generando imagen para escena ${segment.sceneNumber}:`, error);
                generationError = errorMsg;
                sceneErrors.push({
                  sceneNumber: segment.sceneNumber,
                  error: errorMsg,
                });
              }
            }

            // Crear escena en BD
            const sceneResult = await db.createScene(
              input.projectId,
              segment.sceneNumber,
              segment.timeStart,
              segment.timeEnd,
              segment.audioText,
              segment.imagePrompt,
              segment.animationPrompt,
              segment.sequenceNote,
              imageUrl,
              imageKey
            );

            createdScenes.push({
              sceneId: (sceneResult as any).insertId || 0,
              sceneNumber: segment.sceneNumber,
              imageUrl,
              generationError,
            });
          }

          return {
            success: true,
            projectId: input.projectId,
            totalScenes: segments.length,
            scenes: createdScenes,
            visualBible,
            sceneErrors: sceneErrors.length > 0 ? sceneErrors : undefined,
          };
        } catch (error) {
          console.error("[Storyboard] Error generando storyboard:", error);
          throw error;
        }
      }),

    /**
     * Actualizar una escena específica
     */
    updateScene: protectedProcedure
      .input(
        z.object({
          sceneId: z.number(),
          projectId: z.number(),
          imagePrompt: z.string().optional(),
          animationPrompt: z.string().optional(),
          sequenceNote: z.string().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        // Verificar autorización
        const project = await db.getProjectById(input.projectId);
        if (!project || project.userId !== ctx.user.id) {
          throw new Error("No autorizado");
        }

        const updates: Record<string, any> = {};
        if (input.imagePrompt) updates.imagePrompt = input.imagePrompt;
        if (input.animationPrompt) updates.animationPrompt = input.animationPrompt;
        if (input.sequenceNote) updates.sequenceNote = input.sequenceNote;

        await db.updateScene(input.sceneId, updates);

        return { success: true };
      }),

    /**
     * Eliminar un proyecto
     */
    delete: protectedProcedure
      .input(z.object({ projectId: z.number() }))
      .mutation(async ({ input, ctx }) => {
        const project = await db.getProjectById(input.projectId);
        if (!project || project.userId !== ctx.user.id) {
          throw new Error("No autorizado");
        }

        // Eliminar escenas primero
        await db.deleteScenesByProjectId(input.projectId);

        // Eliminar proyecto
        await db.deleteProject(input.projectId);

        return { success: true };
      }),
  }),

  styles: router({
    /**
     * Obtener todos los estilos predefinidos
     */
    getAll: publicProcedure.query(async () => {
      return await db.getAllStylePresets();
    }),
  }),

  export: router({
    /**
     * Exportar prompts en formato markdown
     */
    prompts: protectedProcedure
      .input(z.object({ projectId: z.number() }))
      .query(async ({ input }) => {
        const { getProjectExportData, generateMarkdownContent } = await import(
          "./exportService"
        );

        const exportData = await getProjectExportData(input.projectId);
        if (!exportData) {
          throw new Error("Proyecto no encontrado");
        }

        const markdownContent = generateMarkdownContent(exportData);

        return {
          success: true,
          content: markdownContent,
          projectName: exportData.projectName,
          sceneCount: exportData.scenes.length,
        };
       }),

    /**
     * Descargar todas las imagenes en un ZIP
     */
    imagesZip: protectedProcedure
      .input(z.object({ projectId: z.number() }))
      .mutation(async ({ input }) => {
        const { generateImagesZip } = await import("./zipService");

        const projectResult = await db.getProjectById(input.projectId);
        if (!projectResult) {
          throw new Error("Proyecto no encontrado");
        }

        const { filename } = await generateImagesZip(
          input.projectId,
          projectResult.name
        );

        return {
          success: true,
          filename,
        };
      }),

    /**
     * Listar todos los proyectos del usuario
     */
    list: protectedProcedure
      .input(
        z.object({
          search: z.string().optional(),
          sortBy: z.enum(["newest", "oldest", "name"]).default("newest"),
        })
      )
      .query(async ({ input, ctx }) => {
        const projects = await db.getUserProjects(ctx.user.id);

        let filtered = projects;

        if (input.search) {
          const searchLower = input.search.toLowerCase();
          filtered = filtered.filter(
            (p) =>
              p.name.toLowerCase().includes(searchLower) ||
              (p.description && p.description.toLowerCase().includes(searchLower))
          );
        }

        if (input.sortBy === "oldest") {
          filtered.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
        } else if (input.sortBy === "name") {
          filtered.sort((a, b) => a.name.localeCompare(b.name));
        } else {
          filtered.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
        }

        const projectsWithInfo = await Promise.all(
          filtered.map(async (project) => {
            const scenes = await db.getScenesByProjectId(project.id);
            const visualBible = await db.getVisualBibleByProjectId(project.id);

            return {
              ...project,
              sceneCount: scenes.length,
              style: visualBible?.style || project.selectedStyle,
            };
          })
        );

        return projectsWithInfo;
      }),

    /**
     * Duplicar un proyecto existente
     */
    duplicate: protectedProcedure
      .input(z.object({ projectId: z.number() }))
      .mutation(async ({ input, ctx }) => {
        const originalProject = await db.getProjectById(input.projectId);
        if (!originalProject) {
          throw new Error("Proyecto no encontrado");
        }

        if (originalProject.userId !== ctx.user.id) {
          throw new Error("No tienes permiso para duplicar este proyecto");
        }

        const newProjectName = `${originalProject.name} (Copia)`;
        const createResult = await db.createProject(
          ctx.user.id,
          newProjectName,
          originalProject.description || "",
          originalProject.selectedStyle,
          originalProject.isPromptsOnly === 1,
          originalProject.audioUrl || undefined,
          originalProject.audioKey || undefined,
          originalProject.narrativeText || undefined
        );
        const newProjectId = createResult.insertId;

        const visualBible = await db.getVisualBibleByProjectId(input.projectId);
        if (visualBible) {
          await db.createVisualBible(
            newProjectId,
            visualBible.style,
            visualBible.colorPalette,
            visualBible.coherenceInstructions,
            visualBible.characters || undefined,
            visualBible.environment || undefined,
            visualBible.cinematicStyle || undefined
          );
        }

        const scenes = await db.getScenesByProjectId(input.projectId);
        for (const scene of scenes) {
          await db.createScene(
            newProjectId,
            scene.sceneNumber,
            scene.timeStart,
            scene.timeEnd,
            scene.audioText,
            scene.imagePrompt,
            scene.animationPrompt,
            scene.sequenceNote,
            scene.imageUrl || undefined,
            scene.imageKey || undefined
          );
        }

        return {
          success: true,
          newProjectId,
          message: "Proyecto duplicado exitosamente",
        };
      }),

    /**
     * Eliminar un proyecto
     */
    delete: protectedProcedure
      .input(z.object({ projectId: z.number() }))
      .mutation(async ({ input, ctx }) => {
        const project = await db.getProjectById(input.projectId);
        if (!project) {
          throw new Error("Proyecto no encontrado");
        }

        if (project.userId !== ctx.user.id) {
          throw new Error("No tienes permiso para eliminar este proyecto");
        }

        await db.deleteScenesByProjectId(input.projectId);
        await db.deleteVisualBibleByProjectId(input.projectId);
        await db.deleteProject(input.projectId);

        return {
          success: true,
          message: "Proyecto eliminado exitosamente",
        };
      }),
  }),
});
export type AppRouter = typeof appRouter;
