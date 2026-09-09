import "dotenv/config";
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import contentRoutes from "./routes/content.js";
import adminRoutes from "./routes/admin.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

app.use(cors());
app.use(express.json({ limit: "1mb" }));

app.use("/api/content", contentRoutes);
app.use("/api/admin", adminRoutes);

// En desarrollo el frontend corre aparte con `npm run dev` (Vite) y le pega
// a este server via proxy en /api. En producción, buildeás el frontend
// (`npm run build` en la raíz del proyecto) y este server sirve ese `dist/`
// directamente, incluyendo la ruta /admin (fallback a index.html porque es
// una sola página que decide internamente qué mostrar).
const distPath = path.join(__dirname, "..", "dist");
app.use(express.static(distPath));
app.get("*", (_req, res) => {
  res.sendFile(path.join(distPath, "index.html"), (err) => {
    if (err) {
      res
        .status(404)
        .send("No se encontró el build del frontend. Corré `npm run build` en la raíz del proyecto primero.");
    }
  });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Backend de la cátedra escuchando en http://localhost:${PORT}`);
});
