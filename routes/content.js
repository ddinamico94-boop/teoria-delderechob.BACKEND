import { Router } from "express";
import { readDB } from "../db.js";

const router = Router();

// GET /api/content — contenido público del sitio (sin datos de admin).
router.get("/", (_req, res) => {
  const db = readDB();
  res.json({
    docentes: db.docentes,
    auxiliares: db.auxiliares,
    links: db.links,
    timeline: db.timeline,
  });
});

export default router;
