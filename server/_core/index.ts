import "dotenv/config";
import express from "express";
import { createServer } from "http";
import path from "path";
import { fileURLToPath } from "url";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth.js";
import { registerStorageProxy } from "./storageProxy.js";
import { appRouter } from "../routers.js";
import { createContext } from "./context.js";

const __filename = fileURLToPath(import.meta.url);
const _dirname = path.dirname(_filename);

const app = express();
const port = process.env.PORT || 10000;

app.use(express.json());

// 1. Registrar rutas originales del backend
registerOAuthRoutes(app);
registerStorageProxy(app);

// 2. Conectar las rutas de tRPC
app.use(
  "/api/trpc",
  createExpressMiddleware({
    router: appRouter,
    createContext,
  })
);

// 3. Servir el frontend compilado en producción
// Buscamos la carpeta dist del cliente desde la raíz del proyecto
const clientDistPath = path.resolve(process.cwd(), "client/dist");
app.use(express.static(clientDistPath));

// Cualquier otra ruta que no sea de la API entrega el index.html de Vite
app.get("*", (req, res) => {
  res.sendFile(path.resolve(clientDistPath, "index.html"), (err) => {
    if (err) {
      // Si falla en producción, enviamos un mensaje simple de fallback
      res.status(404).send("Frontend dist folder not found. Please check your build process.");
    }
  });
});

const server = createServer(app);

server.listen(port, () => {
  console.log(Servidor corriendo en el puerto ${port});
});
