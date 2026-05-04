import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { useLocation, useRoute } from "wouter";
import { Download, Edit2, Loader2, ArrowLeft, Copy, Package } from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function Storyboard() {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [match, params] = useRoute("/project/:projectId");
  const projectId = params?.projectId ? parseInt(params.projectId) : null;

  const [editingSceneId, setEditingSceneId] = useState<number | null>(null);
  const [editImagePrompt, setEditImagePrompt] = useState("");
  const [editAnimationPrompt, setEditAnimationPrompt] = useState("");
  const [editSequenceNote, setEditSequenceNote] = useState("");

  const { data: projectData, isLoading } = trpc.projects.getById.useQuery(
    { projectId: projectId || 0 },
    { enabled: !!projectId }
  );

  const updateSceneMutation = trpc.projects.updateScene.useMutation();
  const exportPromptsQuery = trpc.export.prompts.useQuery(
    { projectId: projectId || 0 },
    { enabled: false }
  );
  const downloadZipMutation = trpc.export.imagesZip.useMutation();

  if (!isAuthenticated) {
    setLocation("/");
    return null;
  }

  if (!projectId) {
    return <div>Proyecto no encontrado</div>;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex justify-center items-center">
        <Loader2 className="h-8 w-8 text-cyan-500 animate-spin" />
      </div>
    );
  }

  if (!projectData) {
    return <div>Proyecto no encontrado</div>;
  }

  const { project, scenes, visualBible } = projectData;

  const handleUpdateScene = async () => {
    if (!editingSceneId) return;

    try {
      await updateSceneMutation.mutateAsync({
        sceneId: editingSceneId,
        projectId,
        imagePrompt: editImagePrompt,
        animationPrompt: editAnimationPrompt,
        sequenceNote: editSequenceNote,
      });

      setEditingSceneId(null);
    } catch (error) {
      console.error("Error updating scene:", error);
    }
  };

  const handleExportPrompts = async () => {
    try {
      const result = await exportPromptsQuery.refetch();
      if (result.data?.content) {
        const blob = new Blob([result.data.content], { type: "text/plain" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `storyboard-${result.data.projectName}.txt`;
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error("Error exportando prompts:", error);
    }
  };

  const handleDownloadImagesZip = async () => {
    try {
      toast.loading("Preparando descarga de imágenes...");
      const result = await downloadZipMutation.mutateAsync({
        projectId: projectId || 0,
      });

      if (result.success) {
        // Crear un iframe temporal para descargar el archivo
        const iframe = document.createElement("iframe");
        iframe.style.display = "none";
        iframe.src = `/api/export/download-zip?projectId=${projectId}`;
        document.body.appendChild(iframe);

        setTimeout(() => {
          document.body.removeChild(iframe);
        }, 1000);

        toast.success("Descarga iniciada");
      }
    } catch (error) {
      console.error("Error descargando ZIP:", error);
      toast.error(
        error instanceof Error ? error.message : "Error descargando imágenes"
      );
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b-2 border-cyan-500/30 bg-black/50 backdrop-blur sticky top-0 z-50">
        <div className="container py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setLocation("/dashboard")}
              className="text-cyan-500 hover:text-cyan-400 transition-colors"
            >
              <ArrowLeft className="h-6 w-6" />
            </button>
            <div className="text-2xl font-black text-cyan-500 tracking-wider" style={{ textShadow: "0 0 10px #00ffff" }}>
              {project.name}
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={handleExportPrompts}
              className="bg-cyan-500 hover:bg-cyan-600 text-black font-bold border-2 border-cyan-500"
            >
              <Download className="mr-2 h-4 w-4" />
              EXPORTAR TXT
            </Button>
            <Button
              onClick={handleDownloadImagesZip}
              disabled={downloadZipMutation.isPending}
              className="bg-magenta-500 hover:bg-magenta-600 text-black font-bold border-2 border-magenta-500"
            >
              {downloadZipMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  PREPARANDO...
                </>
              ) : (
                <>
                  <Package className="mr-2 h-4 w-4" />
                  DESCARGAR ZIP
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      <div className="container py-12">
        <div className="max-w-6xl mx-auto">
          {/* Visual Bible Info */}
          {visualBible && (
            <Card className="border-2 border-cyan-500/30 bg-black/50 mb-12 rounded-none">
              <CardHeader className="border-b border-cyan-500/30">
                <CardTitle className="text-cyan-500 font-black">
                  [BIBLIA VISUAL]
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label className="text-cyan-400 font-bold text-sm">ESTILO</Label>
                  <p className="text-foreground mt-1">{visualBible.style}</p>
                </div>
                <div>
                  <Label className="text-cyan-400 font-bold text-sm">PALETA DE COLORES</Label>
                  <p className="text-foreground mt-1 text-sm">{visualBible.colorPalette}</p>
                </div>
                <div>
                  <Label className="text-cyan-400 font-bold text-sm">PERSONAJES</Label>
                  <p className="text-foreground mt-1 text-sm">{visualBible.characters}</p>
                </div>
                <div>
                  <Label className="text-cyan-400 font-bold text-sm">AMBIENTE</Label>
                  <p className="text-foreground mt-1 text-sm">{visualBible.environment}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Scenes Gallery */}
          <div className="space-y-6">
            <h2 className="text-3xl font-black text-cyan-500 tracking-wider">
              ESCENAS ({scenes.length})
            </h2>

            {scenes.map((scene) => (
              <Card
                key={scene.id}
                className="border-2 border-cyan-500/30 bg-black/80 backdrop-blur hover:border-cyan-500/50 transition-all rounded-none"
              >
                <CardHeader className="border-b border-cyan-500/30 pb-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-cyan-500 font-black text-lg">
                        ESCENA {scene.sceneNumber}
                      </CardTitle>
                      <CardDescription className="text-cyan-400 text-sm mt-1">
                        {scene.timeStart} - {scene.timeEnd}
                      </CardDescription>
                    </div>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-cyan-500/50 text-cyan-500 hover:bg-cyan-500/10 rounded-none"
                          onClick={() => {
                            setEditingSceneId(scene.id);
                            setEditImagePrompt(scene.imagePrompt);
                            setEditAnimationPrompt(scene.animationPrompt);
                            setEditSequenceNote(scene.sequenceNote);
                          }}
                        >
                          <Edit2 className="h-4 w-4 mr-1" />
                          Editar
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="bg-black/90 border-2 border-cyan-500/50 rounded-none max-w-2xl">
                        <DialogHeader>
                          <DialogTitle className="text-cyan-500 font-black">
                            EDITAR ESCENA {scene.sceneNumber}
                          </DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label className="text-foreground font-bold">PROMPT DE IMAGEN BASE</Label>
                            <Textarea
                              value={editImagePrompt}
                              onChange={(e) => setEditImagePrompt(e.target.value)}
                              className="mt-2 bg-black/50 border-cyan-500/30 text-foreground rounded-none min-h-24"
                            />
                          </div>
                          <div>
                            <Label className="text-foreground font-bold">PROMPT DE ANIMACIÓN</Label>
                            <Textarea
                              value={editAnimationPrompt}
                              onChange={(e) => setEditAnimationPrompt(e.target.value)}
                              className="mt-2 bg-black/50 border-cyan-500/30 text-foreground rounded-none min-h-24"
                            />
                          </div>
                          <div>
                            <Label className="text-foreground font-bold">NOTA DE CONEXIÓN</Label>
                            <Textarea
                              value={editSequenceNote}
                              onChange={(e) => setEditSequenceNote(e.target.value)}
                              className="mt-2 bg-black/50 border-cyan-500/30 text-foreground rounded-none min-h-16"
                            />
                          </div>
                          <Button
                            onClick={handleUpdateScene}
                            className="w-full bg-cyan-500 hover:bg-cyan-600 text-black font-bold rounded-none"
                          >
                            GUARDAR CAMBIOS
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardHeader>

                <CardContent className="pt-6 space-y-6">
                  {/* Audio Text */}
                  <div>
                    <Label className="text-cyan-400 font-bold text-sm">TEXTO DEL AUDIO</Label>
                    <p className="text-foreground mt-2 text-sm leading-relaxed">
                      {scene.audioText}
                    </p>
                  </div>

                  {/* Image */}
                  {scene.imageUrl ? (
                    <div>
                      <Label className="text-cyan-400 font-bold text-sm">IMAGEN BASE</Label>
                      <div className="mt-2 border-2 border-cyan-500/30 p-2 bg-black/50">
                        <img
                          src={scene.imageUrl}
                          alt={`Scene ${scene.sceneNumber}`}
                          className="w-full h-auto"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="border-2 border-magenta-500/30 p-4 bg-black/50 rounded-none">
                      <Label className="text-magenta-400 font-bold text-sm">MODO SOLO-PROMPTS</Label>
                      <p className="text-foreground text-xs mt-2">
                        Esta escena fue generada en modo solo-prompts. La imagen base no fue generada automáticamente.
                      </p>
                    </div>
                  )}

                  {/* Image Prompt */}
                  <div>
                    <Label className="text-cyan-400 font-bold text-sm flex items-center gap-2">
                      PROMPT DE IMAGEN BASE
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(scene.imagePrompt);
                        }}
                        className="text-cyan-500 hover:text-cyan-400"
                      >
                        <Copy className="h-3 w-3" />
                      </button>
                    </Label>
                    <p className="text-foreground mt-2 text-xs bg-black/50 p-3 border border-cyan-500/20 rounded-none leading-relaxed">
                      {scene.imagePrompt}
                    </p>
                  </div>

                  {/* Animation Prompt */}
                  <div>
                    <Label className="text-cyan-400 font-bold text-sm flex items-center gap-2">
                      PROMPT DE ANIMACIÓN (5 SEGUNDOS)
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(scene.animationPrompt);
                        }}
                        className="text-cyan-500 hover:text-cyan-400"
                      >
                        <Copy className="h-3 w-3" />
                      </button>
                    </Label>
                    <p className="text-foreground mt-2 text-xs bg-black/50 p-3 border border-cyan-500/20 rounded-none leading-relaxed">
                      {scene.animationPrompt}
                    </p>
                  </div>

                  {/* Sequence Note */}
                  <div>
                    <Label className="text-cyan-400 font-bold text-sm">NOTA DE CONEXIÓN DE SECUENCIA</Label>
                    <p className="text-foreground mt-2 text-xs bg-black/50 p-3 border border-magenta-500/20 rounded-none leading-relaxed">
                      {scene.sequenceNote}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
