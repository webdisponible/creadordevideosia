import "dotenv/config";
import express from "express";
import { createServer } from "http";
import path from "path";
import { fileURLToPath } from "url";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "../_core/oauth.js"; // Ajusta la extensión a .js para la compilación
import { registerStorageProxy } from "../_core/storageProxy.js";
import { appRouter } from "../routers.js";
import { createContext } from "../_core/context.js";

const __filename = fileURLToPath(import.meta.url);
const _dirname = path.dirname(_filename);

const app = express();
const port = process.env.PORT || 10000;

app.use(express.json());

// Registra tus utilidades originales del servidor
registerOAuthRoutes(app);
registerStorageProxy(app);

// Conectar las rutas de tRPC
app.use(
  "/api/trpc",
  createExpressMiddleware({
    router: appRouter,
    createContext,
  })
);

// Servir archivos estáticos del frontend en producción
// Salimos de '_core' y 'server' para llegar a 'client/dist'
const clientDistPath = path.resolve(__dirname, "../../client/dist");
const fallbackPath = path.resolve(process.cwd(), "client/dist");

app.use(express.static(clientDistPath));
app.use(express.static(fallbackPath));

// Cualquier otra ruta entrega el index.html de la interfaz
app.get("*", (req, res) => {
  res.sendFile(path.resolve(clientDistPath, "index.html"), (err) => {
    if (err) {
      res.sendFile(path.resolve(fallbackPath, "index.html"));
    }
  });
});

const server = createServer(app);

server.listen(port, () => {
  console.log(Servidor corriendo en el puerto ${port});
});
