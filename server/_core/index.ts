import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import * as trpcExpress from "@trpc/server/adapters/express";
import { appRouter } from "../routers.js"; // Retrocede un nivel para buscar routers.ts en 'server/'

const __filename = fileURLToPath(import.meta.url);
const _dirname = path.dirname(_filename);

const app = express();
const port = process.env.PORT || 10000;

app.use(express.json());

// 1. Integrar el adaptador de tRPC para tus rutas
app.use(
  "/api/trpc",
  trpcExpress.createExpressMiddleware({
    router: appRouter,
    createContext: () => ({}), 
  })
);

// 2. Servir los archivos estáticos del frontend de Vite
// Retrocedemos tres niveles: salimos de 'core', salimos de 'server' y entramos a 'client/dist'
const clientDistPath = path.resolve(__dirname, "../../../client/dist");
const fallbackPath = path.resolve(process.cwd(), "client/dist");

app.use(express.static(clientDistPath));
app.use(express.static(fallbackPath));

// 3. Cualquier otra ruta entrega el index.html del frontend
app.get("*", (req, res) => {
  res.sendFile(path.resolve(clientDistPath, "index.html"), (err) => {
    if (err) {
      res.sendFile(path.resolve(fallbackPath, "index.html"));
    }
  });
});

app.listen(port, () => {
  console.log(Servidor corriendo en el puerto ${port});
});
