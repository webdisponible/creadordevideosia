import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Copy, Trash2, Play, Search } from "lucide-react";
import { useLocation } from "wouter";
import { toast } from "sonner";

export default function Gallery() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "name">("newest");
  const [deleteProjectId, setDeleteProjectId] = useState<number | null>(null);

  // Usar any para evitar problemas de tipado con tRPC
  const projectsQuery = (trpc.projects as any).list.useQuery({
    search,
    sortBy,
  });

  const duplicateMutation = (trpc.projects as any).duplicate.useMutation({
    onSuccess: (data: any) => {
      toast.success(data?.message || "Proyecto duplicado");
      projectsQuery.refetch();
    },
    onError: (error: any) => {
      toast.error(error?.message || "Error al duplicar proyecto");
    },
  });

  const deleteMutation = (trpc.projects as any).delete.useMutation({
    onSuccess: (data: any) => {
      toast.success(data?.message || "Proyecto eliminado");
      setDeleteProjectId(null);
      projectsQuery.refetch();
    },
    onError: (error: any) => {
      toast.error(error?.message || "Error al eliminar proyecto");
    },
  });

  const handleDuplicate = (projectId: number) => {
    duplicateMutation.mutate({ projectId });
  };

  const handleDelete = () => {
    if (deleteProjectId) {
      deleteMutation.mutate({ projectId: deleteProjectId });
    }
  };

  const projects = projectsQuery.data || [];

  return (
    <div className="min-h-screen bg-black text-white p-6">
      {/* Scanlines effect */}
      <div className="pointer-events-none fixed inset-0 opacity-5 bg-repeat" style={{
        backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, currentColor 2px, currentColor 4px)",
      }} />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-magenta-500" style={{
            textShadow: "0 0 20px rgba(0, 255, 255, 0.5), 0 0 40px rgba(255, 0, 255, 0.3)",
          }}>
            [GALERÍA DE PROYECTOS]
          </h1>
          <p className="text-cyan-300 font-mono text-sm">Gestiona todos tus videos generados con IA</p>
        </div>

        {/* Controles de búsqueda y filtrado */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-cyan-400" />
            <Input
              placeholder="Buscar proyectos..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 bg-slate-900 border-cyan-500 text-white placeholder-cyan-300"
            />
          </div>

          <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
            <SelectTrigger className="bg-slate-900 border-cyan-500 text-white">
              <SelectValue placeholder="Ordenar por..." />
            </SelectTrigger>
            <SelectContent className="bg-slate-900 border-cyan-500">
              <SelectItem value="newest">Más recientes</SelectItem>
              <SelectItem value="oldest">Más antiguos</SelectItem>
              <SelectItem value="name">Por nombre</SelectItem>
            </SelectContent>
          </Select>

          <Button
            onClick={() => navigate("/")}
            className="bg-cyan-600 hover:bg-cyan-700 text-black font-bold"
          >
            + NUEVO PROYECTO
          </Button>
        </div>

        {/* Grid de proyectos */}
        {projects.length === 0 ? (
          <div className="text-center py-16 border border-cyan-500 rounded-lg bg-slate-900 bg-opacity-50">
            <p className="text-cyan-300 text-lg mb-4">No hay proyectos disponibles</p>
            <Button
              onClick={() => navigate("/")}
              className="bg-magenta-600 hover:bg-magenta-700 text-white font-bold"
            >
              Crear primer proyecto
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project: any) => (
              <div
                key={project.id}
                className="border border-cyan-500 rounded-lg overflow-hidden bg-slate-900 bg-opacity-50 hover:bg-opacity-75 transition-all hover:shadow-lg hover:shadow-cyan-500/50"
              >
                {/* Thumbnail placeholder */}
                <div className="w-full h-40 bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center border-b border-cyan-500">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-cyan-400 mb-2">{(project as any).sceneCount || 0}</div>
                    <p className="text-cyan-300 text-xs font-mono">ESCENAS</p>
                  </div>
                </div>

                {/* Contenido */}
                <div className="p-4">
                  <h3 className="text-lg font-bold text-cyan-300 mb-2 truncate">{project.name}</h3>

                  <div className="space-y-2 mb-4 text-sm">
                    <p className="text-gray-400">
                      <span className="text-cyan-400 font-mono">Estilo:</span> {(project as any).style || project.selectedStyle}
                    </p>
                    <p className="text-gray-400">
                      <span className="text-cyan-400 font-mono">Creado:</span>{" "}
                      {new Date(project.createdAt).toLocaleDateString("es-ES")}
                    </p>
                    {project.description && (
                      <p className="text-gray-500 text-xs line-clamp-2">{project.description}</p>
                    )}
                  </div>

                  {/* Acciones */}
                  <div className="flex gap-2">
                    <Button
                      onClick={() => navigate(`/storyboard/${project.id}`)}
                      size="sm"
                      className="flex-1 bg-cyan-600 hover:bg-cyan-700 text-black font-bold text-xs"
                    >
                      <Play className="w-3 h-3 mr-1" />
                      VER
                    </Button>

                    <Button
                      onClick={() => handleDuplicate(project.id)}
                      size="sm"
                      disabled={duplicateMutation.isPending}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      <Copy className="w-3 h-3" />
                    </Button>

                    <Button
                      onClick={() => setDeleteProjectId(project.id)}
                      size="sm"
                      className="bg-red-600 hover:bg-red-700 text-white"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Diálogo de confirmación de eliminación */}
      <AlertDialog open={deleteProjectId !== null} onOpenChange={(open) => {
        if (!open) setDeleteProjectId(null);
      }}>
        <AlertDialogContent className="bg-slate-900 border-red-500">
          <AlertDialogTitle className="text-red-400">Eliminar proyecto</AlertDialogTitle>
          <AlertDialogDescription className="text-gray-300">
            ¿Estás seguro de que deseas eliminar este proyecto? Esta acción no se puede deshacer.
          </AlertDialogDescription>
          <div className="flex gap-4 justify-end">
            <AlertDialogCancel className="bg-slate-700 hover:bg-slate-600 text-white">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Eliminar
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
