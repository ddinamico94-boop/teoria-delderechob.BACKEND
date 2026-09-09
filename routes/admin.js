import { Router } from "express";
import { randomUUID } from "crypto";
import bcrypt from "bcryptjs";
import { readDB, writeDB, COLLECTIONS } from "../db.js";
import { signToken, requireAuth } from "../auth.js";

const router = Router();

// Campos permitidos por colección: cualquier otro campo enviado se ignora,
// así el panel no puede escribir cosas inesperadas en la base.
const FIELDS = {
  docentes: ["name", "role"],
  auxiliares: ["name"],
  links: ["label", "url", "desc", "icon"],
  timeline: ["title", "text", "badge", "color", "icon"],
};

// Campos que, aunque se guardan, no son obligatorios al crear un elemento.
const OPTIONAL_FIELDS = new Set(["badge"]);

function pick(obj, fields) {
  const out = {};
  for (const f of fields) {
    if (obj[f] !== undefined) out[f] = String(obj[f]).slice(0, 4000);
  }
  return out;
}

// ── Login ────────────────────────────────────────────────────────────────
router.post("/login", (req, res) => {
  const { username, password } = req.body || {};
  const db = readDB();

  if (!db.admin) {
    return res.status(400).json({
      error:
        "Todavía no hay un administrador configurado. En el servidor, corré: npm run create-admin -- <usuario> <contraseña>",
    });
  }

  if (
    typeof username !== "string" ||
    typeof password !== "string" ||
    username !== db.admin.username ||
    !bcrypt.compareSync(password, db.admin.passwordHash)
  ) {
    return res.status(401).json({ error: "Usuario o contraseña incorrectos." });
  }

  res.json({ token: signToken(username), username });
});

router.get("/me", requireAuth, (req, res) => {
  res.json({ username: req.user.username });
});

router.post("/change-password", requireAuth, (req, res) => {
  const { newPassword } = req.body || {};
  if (typeof newPassword !== "string" || newPassword.length < 6) {
    return res.status(400).json({ error: "La contraseña debe tener al menos 6 caracteres." });
  }
  const db = readDB();
  db.admin.passwordHash = bcrypt.hashSync(newPassword, 10);
  writeDB(db);
  res.json({ ok: true });
});

// ── Contenido (autenticado) ─────────────────────────────────────────────
router.get("/content", requireAuth, (_req, res) => {
  const db = readDB();
  res.json({
    docentes: db.docentes,
    auxiliares: db.auxiliares,
    links: db.links,
    timeline: db.timeline,
  });
});

function checkCollection(req, res, next) {
  if (!COLLECTIONS.includes(req.params.collection)) {
    return res.status(404).json({ error: "Colección desconocida." });
  }
  next();
}

// Crear
router.post("/:collection", requireAuth, checkCollection, (req, res) => {
  const collection = req.params.collection;
  const fields = FIELDS[collection];
  const data = pick(req.body || {}, fields);

  for (const f of fields) {
    if (!data[f] && !OPTIONAL_FIELDS.has(f)) {
      return res.status(400).json({ error: `Falta el campo "${f}".` });
    }
  }

  const db = readDB();
  const item = { id: randomUUID(), ...data };
  db[collection].push(item);
  writeDB(db);
  res.status(201).json(item);
});

// Editar
router.put("/:collection/:id", requireAuth, checkCollection, (req, res) => {
  const collection = req.params.collection;
  const fields = FIELDS[collection];
  const data = pick(req.body || {}, fields);

  const db = readDB();
  const list = db[collection];
  const idx = list.findIndex((i) => i.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "No encontrado." });

  list[idx] = { ...list[idx], ...data, id: list[idx].id };
  writeDB(db);
  res.json(list[idx]);
});

// Borrar
router.delete("/:collection/:id", requireAuth, checkCollection, (req, res) => {
  const db = readDB();
  const list = db[req.params.collection];
  const idx = list.findIndex((i) => i.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "No encontrado." });

  const [removed] = list.splice(idx, 1);
  writeDB(db);
  res.json(removed);
});

// Reordenar (arrastrar en la lista): recibe el array completo de ids en el
// nuevo orden deseado.
router.put("/:collection/reorder/all", requireAuth, checkCollection, (req, res) => {
  const { order } = req.body || {};
  if (!Array.isArray(order)) return res.status(400).json({ error: "Falta el array \"order\"." });

  const db = readDB();
  const list = db[req.params.collection];
  const byId = new Map(list.map((i) => [i.id, i]));
  const reordered = order.map((id) => byId.get(id)).filter(Boolean);

  // Si algún id se perdió en el camino, no tocamos nada (evita perder datos).
  if (reordered.length !== list.length) {
    return res.status(400).json({ error: "El orden enviado no coincide con los elementos existentes." });
  }

  db[req.params.collection] = reordered;
  writeDB(db);
  res.json(reordered);
});

export default router;
