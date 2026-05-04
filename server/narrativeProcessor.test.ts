import { describe, it, expect, vi } from "vitest";
import { generateNarrativeSegments, generateVisualBible } from "./narrativeProcessor";
import * as llm from "./_core/llm";

// Mock the LLM module
vi.mock("./_core/llm", () => ({
  invokeLLM: vi.fn(),
}));

describe("narrativeProcessor", () => {
  describe("generateVisualBible", () => {
    it("should generate a valid visual bible from narrative text", async () => {
      const mockResponse = {
        choices: [
          {
            message: {
              content: JSON.stringify({
                style: "Cinematográfico con iluminación dramática",
                colorPalette: "#FF6B6B, #4ECDC4, #1A535C, #FFFFFF, #000000",
                characters: "Protagonista masculino, ambiente urbano",
                environment: "Ciudad moderna, noche, lluvia",
                cinematicStyle: "Planos amplios, movimiento de cámara suave",
                coherenceInstructions: "Mantener consistencia de iluminación y paleta de colores en todas las escenas",
              }),
            },
          },
        ],
      };

      vi.mocked(llm.invokeLLM).mockResolvedValueOnce(mockResponse as any);

      const result = await generateVisualBible(
        "Una historia sobre un detective en la ciudad",
        "cinematographic"
      );

      expect(result).toHaveProperty("style");
      expect(result).toHaveProperty("colorPalette");
      expect(result).toHaveProperty("characters");
      expect(result).toHaveProperty("environment");
      expect(result).toHaveProperty("cinematicStyle");
      expect(result).toHaveProperty("coherenceInstructions");
    });

    it("should throw error if LLM returns invalid response", async () => {
      vi.mocked(llm.invokeLLM).mockResolvedValueOnce({
        choices: [{ message: { content: null } }],
      } as any);

      await expect(
        generateVisualBible("Test narrative", "cinematographic")
      ).rejects.toThrow("No response from LLM for Visual Bible generation");
    });
  });

  describe("generateNarrativeSegments", () => {
    it("should generate narrative segments with correct time ranges", async () => {
      const mockVisualBible = {
        style: "Cinematográfico",
        colorPalette: "#FF6B6B, #4ECDC4",
        characters: "Protagonista",
        environment: "Ciudad",
        cinematicStyle: "Planos amplios",
        coherenceInstructions: "Mantener consistencia",
      };

      const mockResponse = {
        choices: [
          {
            message: {
              content: JSON.stringify([
                {
                  sceneNumber: 1,
                  audioText: "Primera escena del video",
                  imagePrompt: "Imagen de la ciudad de noche",
                  animationPrompt: "Zoom in lento a través de la ciudad",
                  sequenceNote: "Transición a la siguiente escena",
                },
                {
                  sceneNumber: 2,
                  audioText: "Segunda escena",
                  imagePrompt: "Primer plano del protagonista",
                  animationPrompt: "Paneo lateral suave",
                  sequenceNote: "Conexión fluida",
                },
              ]),
            },
          },
        ],
      };

      vi.mocked(llm.invokeLLM).mockResolvedValueOnce(mockResponse as any);

      const result = await generateNarrativeSegments(
        "Una historia de dos escenas",
        mockVisualBible,
        "cinematographic"
      );

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual(
        expect.objectContaining({
          sceneNumber: 1,
          timeStart: "00:00",
          timeEnd: "00:05",
          audioText: "Primera escena del video",
        })
      );
      expect(result[1]).toEqual(
        expect.objectContaining({
          sceneNumber: 2,
          timeStart: "00:05",
          timeEnd: "00:10",
        })
      );
    });

    it("should calculate correct time ranges for multiple scenes", async () => {
      const mockVisualBible = {
        style: "Cyberpunk",
        colorPalette: "#00FFFF, #FF00FF",
        characters: "Hacker",
        environment: "Cyberespacio",
        cinematicStyle: "Neon, distópico",
        coherenceInstructions: "Mantener estilo neon",
      };

      const mockResponse = {
        choices: [
          {
            message: {
              content: JSON.stringify(
                Array.from({ length: 5 }, (_, i) => ({
                  sceneNumber: i + 1,
                  audioText: `Escena ${i + 1}`,
                  imagePrompt: `Prompt imagen ${i + 1}`,
                  animationPrompt: `Prompt animación ${i + 1}`,
                  sequenceNote: `Nota ${i + 1}`,
                }))
              ),
            },
          },
        ],
      };

      vi.mocked(llm.invokeLLM).mockResolvedValueOnce(mockResponse as any);

      const result = await generateNarrativeSegments(
        "Historia de 5 escenas",
        mockVisualBible,
        "cyberpunk"
      );

      expect(result).toHaveLength(5);
      expect(result[0].timeStart).toBe("00:00");
      expect(result[0].timeEnd).toBe("00:05");
      expect(result[2].timeStart).toBe("00:10");
      expect(result[2].timeEnd).toBe("00:15");
      expect(result[4].timeStart).toBe("00:20");
      expect(result[4].timeEnd).toBe("00:25");
    });

    it("should throw error if LLM returns invalid segments", async () => {
      const mockVisualBible = {
        style: "Test",
        colorPalette: "Colors",
        characters: "Chars",
        environment: "Env",
        cinematicStyle: "Style",
        coherenceInstructions: "Instructions",
      };

      vi.mocked(llm.invokeLLM).mockResolvedValueOnce({
        choices: [{ message: { content: null } }],
      } as any);

      await expect(
        generateNarrativeSegments("Test", mockVisualBible, "cinematographic")
      ).rejects.toThrow("No response from LLM for narrative segments");
    });
  });
});
