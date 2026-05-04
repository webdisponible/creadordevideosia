import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import routers from "./routers.js"; // Importa tus rutas actuales de la API

const __filename = fileURLToPath(import.meta.url);
const _dirname = path.dirname(_filename);

const app = express();
const port = process.env.PORT || 10000;

app.use(express.json());

// 1. Usar tus rutas de la API existentes
app.use("/api", routers);

// 2. Servir los archivos estáticos del frontend de Vite
// Cuando Vite compila, deja todo en 'client/dist'
const clientDistPath = path.resolve(__dirname, "../client/dist");
app.use(express.static(clientDistPath));

// 3. Cualquier otra ruta entrega el index.html del frontend
app.get("*", (req, res) => {
  res.sendFile(path.resolve(clientDistPath, "index.html"));
});

app.listen(port, () => {
  console.log(Servidor corriendo perfectamente en el puerto ${port});
});
