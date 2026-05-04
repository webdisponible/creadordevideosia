import { getDb } from "./db";
import { eq } from "drizzle-orm";
import { projects, visualBibles, scenes } from "../drizzle/schema";

export interface ExportData {
  projectName: string;
  style: string;
  visualBible: {
    style: string;
    colorPalette: string;
    characters: string;
    environment: string;
    cinematicStyle: string;
    coherenceInstructions: string;
  };
  scenes: Array<{
    sceneNumber: number;
    timeStart: string;
    timeEnd: string;
    audioText: string;
    imagePrompt: string;
    animationPrompt: string;
    sequenceNote: string;
  }>;
}

export async function getProjectExportData(
  projectId: number
): Promise<ExportData | null> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  // Get project
  const projectResult = await db
    .select()
    .from(projects)
    .where(eq(projects.id, projectId))
    .limit(1);

  if (!projectResult.length) {
    return null;
  }

  const project = projectResult[0];

  // Get visual bible
  const visualBibleResult = await db
    .select()
    .from(visualBibles)
    .where(eq(visualBibles.projectId, projectId))
    .limit(1);

  if (!visualBibleResult.length) {
    return null;
  }

  const visualBible = visualBibleResult[0];

  // Get scenes
  const scenesResult = await db
    .select()
    .from(scenes)
    .where(eq(scenes.projectId, projectId))
    .orderBy(scenes.sceneNumber);

  return {
    projectName: project.name,
    style: project.selectedStyle,
    visualBible: {
      style: visualBible.style || "N/A",
      colorPalette: visualBible.colorPalette || "N/A",
      characters: visualBible.characters || "N/A",
      environment: visualBible.environment || "N/A",
      cinematicStyle: visualBible.cinematicStyle || "N/A",
      coherenceInstructions: visualBible.coherenceInstructions || "N/A",
    },
    scenes: scenesResult.map((scene) => ({
      sceneNumber: scene.sceneNumber,
      timeStart: scene.timeStart,
      timeEnd: scene.timeEnd,
      audioText: scene.audioText,
      imagePrompt: scene.imagePrompt,
      animationPrompt: scene.animationPrompt,
      sequenceNote: scene.sequenceNote || "",
    })),
  };
}

export function generateMarkdownContent(data: ExportData): string {
  let content = `# STORYBOARD: ${data.projectName}\n\n`;

  content += `## BIBLIA VISUAL\n\n`;
  content += `**Estilo:** ${data.visualBible.style}\n\n`;
  content += `**Paleta de Colores:** ${data.visualBible.colorPalette}\n\n`;
  content += `**Personajes:** ${data.visualBible.characters}\n\n`;
  content += `**Ambiente:** ${data.visualBible.environment}\n\n`;
    content += `**Estilo Cinematográfico:** ${data.visualBible.cinematicStyle || "N/A"}\n\n`;
    content += `**Instrucciones de Coherencia:** ${data.visualBible.coherenceInstructions || "N/A"}\n\n`;

  content += `---\n\n`;
  content += `## ESCENAS (${data.scenes.length} total)\n\n`;

  data.scenes.forEach((scene) => {
    content += `### ESCENA ${scene.sceneNumber} | (${scene.timeStart} - ${scene.timeEnd})\n\n`;
    content += `**Texto del Audio:**\n${scene.audioText}\n\n`;
    content += `**Prompt de Imagen Base:**\n\`\`\`\n${scene.imagePrompt}\n\`\`\`\n\n`;
    content += `**Prompt de Animación (5 segundos):**\n\`\`\`\n${scene.animationPrompt}\n\`\`\`\n\n`;
    content += `**Nota de Conexión de Secuencia:**\n${scene.sequenceNote}\n\n`;
    content += `---\n\n`;
  });

  return content;
}

export function generatePlainTextContent(data: ExportData): string {
  let content = `STORYBOARD: ${data.projectName}\n`;
  content += `${"=".repeat(50)}\n\n`;

  content += `BIBLIA VISUAL\n`;
  content += `${"-".repeat(50)}\n`;
  content += `Estilo: ${data.visualBible.style}\n`;
  content += `Paleta de Colores: ${data.visualBible.colorPalette}\n`;
  content += `Personajes: ${data.visualBible.characters}\n`;
  content += `Ambiente: ${data.visualBible.environment}\n`;
  content += `Estilo Cinematográfico: ${data.visualBible.cinematicStyle}\n`;
  content += `Instrucciones de Coherencia: ${data.visualBible.coherenceInstructions}\n\n`;

  content += `ESCENAS (${data.scenes.length} total)\n`;
  content += `${"=".repeat(50)}\n\n`;

  data.scenes.forEach((scene) => {
    content += `ESCENA ${scene.sceneNumber} | (${scene.timeStart} - ${scene.timeEnd})\n`;
    content += `${"-".repeat(50)}\n`;
    content += `Texto del Audio:\n${scene.audioText}\n\n`;
    content += `Prompt de Imagen Base:\n${scene.imagePrompt}\n\n`;
    content += `Prompt de Animación (5 segundos):\n${scene.animationPrompt}\n\n`;
    content += `Nota de Conexión de Secuencia:\n${scene.sequenceNote}\n\n`;
  });

  return content;
}
