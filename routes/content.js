import { Router } from "express";
import { getPublicContent } from "../db.js";

const router = Router();

// GET /api/content — contenido público del sitio (sin datos de admin).
router.get("/", async (_req, res) => {
  try {
    const content = await getPublicContent();
    res.json(content);
  } catch (err) {
    console.error("Error al obtener el contenido:", err);
    res.status(500).json({ error: "Error al obtener el contenido." });
  }
});

export default router;