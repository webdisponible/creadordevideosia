import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { Plus, Trash2, Eye, Loader2 } from "lucide-react";
import { useState } from "react";

export default function Dashboard() {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const { data: projects, isLoading } = trpc.projects.list.useQuery();
  const deleteProjectMutation = trpc.projects.delete.useMutation();

  if (!isAuthenticated) {
    setLocation("/");
    return null;
  }

  const handleDeleteProject = async (projectId: number) => {
    if (confirm("¿Estás seguro de que deseas eliminar este proyecto?")) {
      try {
        await deleteProjectMutation.mutateAsync({ projectId });
      } catch (error) {
        console.error("Error deleting project:", error);
      }
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
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
        <div className="max-w-6xl mx-auto">
          {/* Title */}
          <div className="mb-12">
            <h1 className="text-4xl font-black text-cyan-500 mb-4 tracking-wider" style={{ textShadow: "0 0 20px #00ffff" }}>
              MIS PROYECTOS
            </h1>
            <p className="text-foreground text-lg">
              Gestiona tus storyboards y proyectos de video
            </p>
          </div>

          {/* Create new project button */}
          <div className="mb-8">
            <Button
              onClick={() => setLocation("/")}
              className="bg-cyan-500 hover:bg-cyan-600 text-black font-bold border-2 border-cyan-500"
            >
              <Plus className="mr-2 h-4 w-4" />
              CREAR NUEVO PROYECTO
            </Button>
          </div>

          {/* Projects grid */}
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 text-cyan-500 animate-spin" />
            </div>
          ) : projects && projects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project) => (
                <Card
                  key={project.id}
                  className="border-2 border-cyan-500/50 bg-black/80 backdrop-blur hover:border-cyan-500 transition-all cursor-pointer"
                  onClick={() => setLocation(`/project/${project.id}`)}
                >
                  <CardHeader className="border-b border-cyan-500/30">
                    <CardTitle className="text-cyan-500 font-black truncate">
                      {project.name}
                    </CardTitle>
                    <CardDescription className="text-cyan-400 text-xs">
                      {new Date(project.createdAt).toLocaleDateString("es-ES")}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      {project.description && (
                        <p className="text-foreground text-sm line-clamp-2">
                          {project.description}
                        </p>
                      )}

                      <div className="flex gap-2 text-xs text-cyan-400">
                        <span className="px-2 py-1 border border-cyan-500/30 rounded-none">
                          {project.selectedStyle}
                        </span>
                        {project.isPromptsOnly === 1 && (
                          <span className="px-2 py-1 border border-magenta-500/30 rounded-none">
                            SOLO PROMPTS
                          </span>
                        )}
                      </div>

                      <div className="flex gap-2 pt-4">
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1 border-cyan-500/50 text-cyan-500 hover:bg-cyan-500/10 rounded-none"
                          onClick={(e) => {
                            e.stopPropagation();
                            setLocation(`/project/${project.id}`);
                          }}
                        >
                          <Eye className="h-3 w-3 mr-1" />
                          Ver
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1 border-red-500/50 text-red-500 hover:bg-red-500/10 rounded-none"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteProject(project.id);
                          }}
                        >
                          <Trash2 className="h-3 w-3 mr-1" />
                          Eliminar
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="border-2 border-cyan-500/30 bg-black/50 rounded-none">
              <CardContent className="pt-12 pb-12 text-center">
                <p className="text-foreground mb-6">
                  No tienes proyectos aún. ¡Crea uno para comenzar!
                </p>
                <Button
                  onClick={() => setLocation("/")}
                  className="bg-cyan-500 hover:bg-cyan-600 text-black font-bold border-2 border-cyan-500"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  CREAR PRIMER PROYECTO
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
