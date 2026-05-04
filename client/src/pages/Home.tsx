import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Upload, FileText, Zap, Loader2 } from "lucide-react";
import { useState } from "react";
import { getLoginUrl } from "@/const";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

const STYLE_PRESETS = [
  { id: "cinematographic", name: "Cinematográfico", description: "Cine profesional con iluminación dramática" },
  { id: "cyberpunk", name: "Cyberpunk", description: "Neon distópico con efectos futuristas" },
  { id: "pixar", name: "Pixar-style", description: "Animación 3D colorida y expresiva" },
  { id: "documentary", name: "Documental", description: "Realismo de National Geographic" },
  { id: "noir", name: "Cine Negro", description: "Blanco y negro con sombras dramáticas" },
  { id: "fantasy", name: "Fantasía Épica", description: "Mundos mágicos y aventuras épicas" },
  { id: "scifi", name: "Sci-Fi", description: "Futurismo y tecnología avanzada" },
  { id: "minimalist", name: "Minimalista", description: "Diseño limpio y moderno" },
];

export default function Home() {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [selectedStyle, setSelectedStyle] = useState("cinematographic");
  const [isPromptsOnly, setIsPromptsOnly] = useState(false);
  const [inputMode, setInputMode] = useState<"audio" | "text">("text");
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [narrativeText, setNarrativeText] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const createProjectMutation = trpc.projects.create.useMutation();
  const generateStoryboardMutation = trpc.projects.generateStoryboard.useMutation();

  const handleGenerateStoryboard = async () => {
    if (inputMode === "text" && !narrativeText.trim()) {
      toast.error("Por favor ingresa una narrativa");
      return;
    }

    if (inputMode === "audio" && !audioFile) {
      toast.error("Por favor selecciona un archivo de audio");
      return;
    }

    setIsGenerating(true);

    try {
      // Crear proyecto
      const projectResult = await createProjectMutation.mutateAsync({
        name: `Proyecto ${new Date().toLocaleDateString("es-ES")}`,
        description: inputMode === "text" ? narrativeText.substring(0, 100) : "Proyecto de audio",
        selectedStyle,
        isPromptsOnly,
        narrativeText: inputMode === "text" ? narrativeText : undefined,
      });

      if (!projectResult.projectId) {
        throw new Error("Error al crear proyecto");
      }

      toast.info("📖 Generando Biblia Visual...");

      // Generar storyboard
      const storyboardResult = await generateStoryboardMutation.mutateAsync({
        projectId: projectResult.projectId,
        narrativeText: narrativeText || "",
        selectedStyle,
        isPromptsOnly,
      });

      // Mostrar resultado con información de errores si los hay
      if (storyboardResult.sceneErrors && storyboardResult.sceneErrors.length > 0) {
        const errorCount = storyboardResult.sceneErrors.length;
        toast.warning(
          `Storyboard generado con ${storyboardResult.totalScenes} escenas. ${errorCount} escena(s) sin imagen.`
        );
      } else {
        toast.success(`✅ Storyboard generado con ${storyboardResult.totalScenes} escenas`);
      }

      setLocation(`/project/${projectResult.projectId}`);
    } catch (error) {
      console.error("Error generando storyboard:", error);
      toast.error(`Error: ${error instanceof Error ? error.message : "Error desconocido"}`);
    } finally {
      setIsGenerating(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        {/* Glitch border effect */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-50"></div>
          <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-magenta-500 to-transparent opacity-50"></div>
        </div>

        <Card className="w-full max-w-md border-2 border-cyan-500/50 bg-black/80 backdrop-blur">
          <CardHeader className="text-center border-b border-cyan-500/30">
            <div className="text-4xl font-black text-cyan-500 mb-2 tracking-wider" style={{ textShadow: "0 0 10px #00ffff, -2px 0 #ff00ff, 2px 0 #00ffff" }}>
              AI VIDEO DIRECTOR
            </div>
            <CardDescription className="text-cyan-400 text-sm">
              [SISTEMA DE GENERACIÓN DE STORYBOARDS]
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <p className="text-foreground mb-6 text-center text-sm">
              Transforma narrativas en secuencias visuales coherentes con IA
            </p>
            <a href={getLoginUrl()}>
              <Button className="w-full bg-cyan-500 hover:bg-cyan-600 text-black font-bold border-2 border-cyan-500">
                <Zap className="mr-2 h-4 w-4" />
                INICIAR SESIÓN
              </Button>
            </a>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Glitch header */}
      <div className="border-b-2 border-cyan-500/30 bg-black/50 backdrop-blur sticky top-0 z-50">
        <div className="container py-4 flex justify-between items-center">
          <div className="text-2xl font-black text-cyan-500 tracking-wider" style={{ textShadow: "0 0 10px #00ffff" }}>
            AI VIDEO DIRECTOR
          </div>
          <div className="text-sm text-cyan-400">
            {user?.name && <span>Usuario: {user.name}</span>}
          </div>
        </div>
      </div>

      <div className="container py-12">
        <div className="max-w-4xl mx-auto">
          {/* Title with glitch effect */}
          <div className="mb-12 text-center">
            <h1 className="text-5xl font-black text-cyan-500 mb-4 tracking-wider" style={{ textShadow: "0 0 20px #00ffff, -3px 0 #ff00ff, 3px 0 #00ffff" }}>
              CREAR PROYECTO
            </h1>
            <p className="text-foreground text-lg">
              Convierte tu narrativa en un storyboard visual coherente
            </p>
          </div>

          {/* Main form card */}
          <Card className="border-2 border-cyan-500/50 bg-black/80 backdrop-blur mb-8">
            <CardHeader className="border-b border-cyan-500/30">
              <CardTitle className="text-cyan-500 text-2xl font-black">
                [ENTRADA DE NARRATIVA]
              </CardTitle>
              <CardDescription className="text-cyan-400">
                Selecciona el formato de entrada y proporciona tu contenido
              </CardDescription>
            </CardHeader>

            <CardContent className="pt-8 space-y-8">
              {/* Input mode selector */}
              <div className="space-y-4">
                <Label className="text-foreground font-bold text-lg">FORMATO DE ENTRADA</Label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => setInputMode("text")}
                    className={`p-4 border-2 rounded-none transition-all ${
                      inputMode === "text"
                        ? "border-cyan-500 bg-cyan-500/10 text-cyan-500"
                        : "border-cyan-500/30 bg-black/50 text-foreground hover:border-cyan-500/50"
                    }`}
                  >
                    <FileText className="mx-auto mb-2 h-6 w-6" />
                    <div className="font-bold">TEXTO</div>
                    <div className="text-xs mt-1">Pega tu narrativa</div>
                  </button>

                  <button
                    onClick={() => setInputMode("audio")}
                    className={`p-4 border-2 rounded-none transition-all ${
                      inputMode === "audio"
                        ? "border-cyan-500 bg-cyan-500/10 text-cyan-500"
                        : "border-cyan-500/30 bg-black/50 text-foreground hover:border-cyan-500/50"
                    }`}
                  >
                    <Upload className="mx-auto mb-2 h-6 w-6" />
                    <div className="font-bold">AUDIO</div>
                    <div className="text-xs mt-1">Sube archivo MP3/WAV</div>
                  </button>
                </div>
              </div>

              {/* Conditional input based on mode */}
              {inputMode === "text" ? (
                <div className="space-y-4">
                  <Label htmlFor="narrative" className="text-foreground font-bold">
                    NARRATIVA
                  </Label>
                  <Textarea
                    id="narrative"
                    placeholder="Escribe tu narrativa aquí. La IA la dividirá en bloques de 5 segundos y generará prompts coherentes..."
                    value={narrativeText}
                    onChange={(e) => setNarrativeText(e.target.value)}
                    className="min-h-40 bg-black/50 border-cyan-500/30 text-foreground placeholder-cyan-500/30 rounded-none focus:border-cyan-500"
                  />
                  <div className="text-xs text-cyan-400">
                    Caracteres: {narrativeText.length}
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <Label htmlFor="audio-file" className="text-foreground font-bold">
                    ARCHIVO DE AUDIO
                  </Label>
                  <div className="border-2 border-dashed border-cyan-500/30 rounded-none p-8 text-center hover:border-cyan-500/50 transition-colors cursor-pointer">
                    <input
                      id="audio-file"
                      type="file"
                      accept=".mp3,.wav,.m4a,.ogg"
                      onChange={(e) => setAudioFile(e.target.files?.[0] || null)}
                      className="hidden"
                    />
                    <label htmlFor="audio-file" className="cursor-pointer block">
                      <Upload className="mx-auto h-8 w-8 text-cyan-500 mb-2" />
                      <div className="font-bold text-foreground">
                        {audioFile ? audioFile.name : "Haz clic para seleccionar archivo"}
                      </div>
                      <div className="text-xs text-cyan-400 mt-1">
                        MP3, WAV, M4A, OGG (máx. 50MB)
                      </div>
                    </label>
                  </div>
                </div>
              )}

              {/* Style selector */}
              <div className="space-y-4">
                <Label htmlFor="style" className="text-foreground font-bold text-lg">
                  ESTILO VISUAL
                </Label>
                <Select value={selectedStyle} onValueChange={setSelectedStyle}>
                  <SelectTrigger className="bg-black/50 border-cyan-500/30 text-foreground rounded-none focus:border-cyan-500">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-black/90 border-cyan-500/30">
                    {STYLE_PRESETS.map((style) => (
                      <SelectItem key={style.id} value={style.id} className="text-foreground cursor-pointer">
                        <div>
                          <div className="font-bold">{style.name}</div>
                          <div className="text-xs text-cyan-400">{style.description}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-cyan-400">
                  El estilo se aplicará consistentemente a todas las escenas
                </p>
              </div>

              {/* Prompts only mode */}
              <div className="border-2 border-cyan-500/30 p-6 bg-black/50 rounded-none">
                <div className="flex items-center space-x-4">
                  <Checkbox
                    id="prompts-only"
                    checked={isPromptsOnly}
                    onCheckedChange={(checked) => setIsPromptsOnly(checked as boolean)}
                    className="border-cyan-500 rounded-none"
                  />
                  <div className="flex-1">
                    <Label htmlFor="prompts-only" className="text-foreground font-bold cursor-pointer">
                      MODO SOLO-PROMPTS
                    </Label>
                    <p className="text-xs text-cyan-400 mt-1">
                      Genera solo los prompts de imagen y animación sin crear las imágenes base
                    </p>
                  </div>
                </div>
              </div>

              {/* Submit button */}
              <Button
                onClick={handleGenerateStoryboard}
                disabled={isGenerating || (inputMode === "text" ? !narrativeText.trim() : !audioFile)}
                className="w-full bg-cyan-500 hover:bg-cyan-600 text-black font-bold text-lg py-6 rounded-none border-2 border-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    GENERANDO...
                  </>
                ) : (
                  <>
                    <Zap className="mr-2 h-5 w-5" />
                    GENERAR STORYBOARD
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Info cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                title: "BIBLIA VISUAL",
                desc: "Se genera una vez y se aplica a todas las escenas",
              },
              {
                title: "COHERENCIA",
                desc: "Mantiene consistencia visual absoluta entre frames",
              },
              {
                title: "EXPORTACIÓN",
                desc: "Descarga prompts, imágenes y ZIP completo",
              },
            ].map((info, i) => (
              <Card key={i} className="border-2 border-cyan-500/30 bg-black/50 rounded-none">
                <CardContent className="pt-6">
                  <div className="text-cyan-500 font-black text-sm mb-2">[{info.title}]</div>
                  <p className="text-foreground text-sm">{info.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Botón de galería */}
          <div className="mt-12 text-center">
            <Button
              onClick={() => setLocation("/gallery")}
              className="bg-magenta-600 hover:bg-magenta-700 text-white font-bold px-8 py-3 text-lg"
            >
              📽️ VER MIS PROYECTOS
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}