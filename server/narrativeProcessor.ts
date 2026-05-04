import { invokeLLM } from "./_core/llm";
import { getStyleInstructions, StylePresetKey } from "../shared/stylePresets";

export interface NarrativeSegment {
  sceneNumber: number;
  timeStart: string;
  timeEnd: string;
  audioText: string;
  imagePrompt: string;
  animationPrompt: string;
  sequenceNote: string;
}

export interface VisualBibleData {
  style: string;
  colorPalette: string;
  characters: string;
  environment: string;
  cinematicStyle: string;
  coherenceInstructions: string;
}

/**
 * Calcula el tiempo en formato MM:SS basado en el número de escena
 * Cada escena dura 5 segundos
 */
function calculateTimeRange(sceneNumber: number): { start: string; end: string } {
  const startSeconds = (sceneNumber - 1) * 5;
  const endSeconds = sceneNumber * 5;

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  return {
    start: formatTime(startSeconds),
    end: formatTime(endSeconds),
  };
}

/**
 * Genera la "Biblia Visual" de un proyecto basada en el texto narrativo y estilo seleccionado
 */
export async function generateVisualBible(
  narrativeText: string,
  styleKey: StylePresetKey
): Promise<VisualBibleData> {
  const styleInstructions = getStyleInstructions(styleKey);

  const prompt = `Eres un Director de Cine experto en producción audiovisual con IA. 
Tu tarea es crear una "Biblia Visual" para un proyecto de video basado en la siguiente narrativa y estilo.

NARRATIVA:
${narrativeText}

ESTILO SELECCIONADO:
${styleInstructions}

Genera una Biblia Visual completa que incluya:
1. Descripción del estilo visual general (2-3 líneas)
2. Paleta de colores específica (5-7 colores principales con códigos hex)
3. Descripción de personajes principales (si los hay)
4. Descripción del ambiente/escenario principal
5. Instrucciones de coherencia visual que se aplicarán a TODAS las escenas

Responde en formato JSON con esta estructura exacta:
{
  "style": "descripción del estilo visual",
  "colorPalette": "lista de colores con códigos hex",
  "characters": "descripción de personajes",
  "environment": "descripción del ambiente",
  "cinematicStyle": "técnicas cinematográficas a usar",
  "coherenceInstructions": "instrucciones para mantener coherencia visual absoluta"
}`;

  const response = await invokeLLM({
    messages: [
      {
        role: "system",
        content: "Eres un experto en dirección audiovisual y generación de contenido visual con IA. Responde siempre en JSON válido.",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "visual_bible",
        strict: true,
        schema: {
          type: "object",
          properties: {
            style: { type: "string" },
            colorPalette: { type: "string" },
            characters: { type: "string" },
            environment: { type: "string" },
            cinematicStyle: { type: "string" },
            coherenceInstructions: { type: "string" },
          },
          required: [
            "style",
            "colorPalette",
            "characters",
            "environment",
            "cinematicStyle",
            "coherenceInstructions",
          ],
          additionalProperties: false,
        },
      },
    },
  });

  const content = response.choices[0]?.message.content;
  if (!content || typeof content !== "string") {
    throw new Error("No response from LLM for Visual Bible generation");
  }

  const parsed = JSON.parse(content);
  return parsed as VisualBibleData;
}

/**
 * Segmenta el texto narrativo en bloques de 5 segundos y genera prompts coherentes
 */
export async function generateNarrativeSegments(
  narrativeText: string,
  visualBible: VisualBibleData,
  styleKey: StylePresetKey
): Promise<NarrativeSegment[]> {
  const styleInstructions = getStyleInstructions(styleKey);

  const prompt = `Eres un Director de Cine y Productor Audiovisual experto en Inteligencia Artificial.
Tu objetivo es tomar la siguiente narrativa y desglosarla en una secuencia exacta de prompts para imágenes y animación de video de 5 segundos cada uno.

BIBLIA VISUAL (APLICAR A TODAS LAS ESCENAS):
Estilo: ${visualBible.style}
Paleta de Colores: ${visualBible.colorPalette}
Personajes: ${visualBible.characters}
Ambiente: ${visualBible.environment}
Técnicas Cinematográficas: ${visualBible.cinematicStyle}
Instrucciones de Coherencia: ${visualBible.coherenceInstructions}

NARRATIVA A PROCESAR:
${narrativeText}

INSTRUCCIONES CRÍTICAS:
1. Divide la narrativa en bloques de 5 segundos exactos
2. Cada bloque debe ser una escena coherente que dure exactamente 5 segundos
3. Para cada escena, genera:
   - audioText: El texto exacto de la narrativa para esta escena (2-3 frases)
   - imagePrompt: Descripción detallada de la imagen base/primer frame (incluir estilo, iluminación, composición)
   - animationPrompt: Movimiento de cámara y acciones sutiles durante 5 segundos (partir de la imagen base)
   - sequenceNote: Cómo se conecta el final de esta escena con el inicio de la siguiente

4. COHERENCIA VISUAL ABSOLUTA:
   - Mantén los mismos personajes, colores y ambiente en todas las escenas
   - Asegúrate de que cada imagen base sea coherente con la anterior
   - Los movimientos de cámara deben ser fluidos entre escenas
   - Inyecta la paleta de colores en TODOS los prompts

5. Responde en formato JSON con un array de escenas

Responde SOLO con JSON válido, sin explicaciones adicionales:
[
  {
    "sceneNumber": 1,
    "audioText": "...",
    "imagePrompt": "...",
    "animationPrompt": "...",
    "sequenceNote": "..."
  },
  ...
]`;

  const response = await invokeLLM({
    messages: [
      {
        role: "system",
        content:
          "Eres un experto en dirección audiovisual. Responde SIEMPRE en JSON válido. Cada escena debe durar exactamente 5 segundos.",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "narrative_segments",
        strict: true,
        schema: {
          type: "array",
          items: {
            type: "object",
            properties: {
              sceneNumber: { type: "number" },
              audioText: { type: "string" },
              imagePrompt: { type: "string" },
              animationPrompt: { type: "string" },
              sequenceNote: { type: "string" },
            },
            required: [
              "sceneNumber",
              "audioText",
              "imagePrompt",
              "animationPrompt",
              "sequenceNote",
            ],
            additionalProperties: false,
          },
        },
      },
    },
  });

  const content = response.choices[0]?.message.content;
  if (!content || typeof content !== "string") {
    throw new Error("No response from LLM for narrative segments");
  }

  const segments = JSON.parse(content) as Array<{
    sceneNumber: number;
    audioText: string;
    imagePrompt: string;
    animationPrompt: string;
    sequenceNote: string;
  }>;

  // Agregar tiempos calculados a cada segmento
  return segments.map((segment) => {
    const times = calculateTimeRange(segment.sceneNumber);
    return {
      ...segment,
      timeStart: times.start,
      timeEnd: times.end,
    };
  });
}

/**
 * Procesa un archivo de audio transcrito para generar segmentos narrativos
 * (Esta función se usará después de transcribir el audio)
 */
export async function processAudioTranscription(
  transcribedText: string,
  durationSeconds: number,
  visualBible: VisualBibleData,
  styleKey: StylePresetKey
): Promise<NarrativeSegment[]> {
  // Calcular el número de escenas basado en la duración
  const numScenes = Math.ceil(durationSeconds / 5);

  // Usar la función de generación de segmentos
  return generateNarrativeSegments(transcribedText, visualBible, styleKey);
}
