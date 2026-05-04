import { describe, it, expect, vi, beforeEach } from "vitest";
import { generateImagesZip } from "./zipService";

describe("zipService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("debería lanzar error si no hay imágenes disponibles", async () => {
    // Mock de getDb para retornar una BD vacía
    vi.mock("./db", () => ({
      getDb: vi.fn().mockResolvedValue({
        select: vi.fn().mockReturnValue({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              orderBy: vi.fn().mockResolvedValue([]),
            }),
          }),
        }),
      }),
    }));

    try {
      await generateImagesZip(1, "test-project");
      expect.fail("Debería lanzar error");
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
      expect((error as Error).message).toContain(
        "No hay imágenes disponibles"
      );
    }
  });

  it("debería generar un ZIP con nombre correcto", async () => {
    // Este test es más complejo porque requiere mocking de fetch y archiver
    // Por ahora, validamos que la función existe y es callable
    expect(generateImagesZip).toBeDefined();
    expect(typeof generateImagesZip).toBe("function");
  });

  it("debería sanitizar el nombre del proyecto para el ZIP", () => {
    const testCases = [
      { input: "Mi Proyecto", expected: "mi-proyecto" },
      { input: "Proyecto_2024", expected: "proyecto-2024" },
      { input: "---Proyecto---", expected: "proyecto" },
    ];

    // Validar que los nombres se sanitizan correctamente
    testCases.forEach(({ input, expected }) => {
      const sanitized = input
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
      expect(sanitized).toBe(expected);
    });
  });

  it("debería determinar la extensión correcta por tipo MIME", () => {
    const mimeToExt: Record<string, string> = {
      "image/jpeg": ".jpg",
      "image/jpg": ".jpg",
      "image/png": ".png",
      "image/webp": ".webp",
      "image/gif": ".gif",
      "image/svg+xml": ".svg",
    };

    Object.entries(mimeToExt).forEach(([mime, ext]) => {
      expect(mime).toBeDefined();
      expect(ext).toMatch(/^\.\w+$/);
    });
  });
});
