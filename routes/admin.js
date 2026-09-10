import { Router } from "express";
import bcrypt from "bcryptjs";
import {
  getAdmin,
  updateAdminPassword,
  getPublicContent,
  createItem,
  updateItem,
  deleteItem,
  reorderCollection,
  COLLECTIONS,
} from "../db.js";
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
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body || {};
    const admin = await getAdmin();

    if (!admin) {
      return res.status(400).json({
        error:
          "Todavía no hay un administrador configurado. En el servidor, corré: npm run create-admin -- <usuario> <contraseña>",
      });
    }

    if (
      typeof username !== "string" ||
      typeof password !== "string" ||
      username !== admin.username ||
      !bcrypt.compareSync(password, admin.passwordHash)
    ) {
      return res.status(401).json({ error: "Usuario o contraseña incorrectos." });
    }

    res.json({ token: signToken(username), username });
  } catch (err) {
    console.error("Error en login:", err);
    res.status(500).json({ error: "Error interno al iniciar sesión." });
  }
});

router.get("/me", requireAuth, (req, res) => {
  res.json({ username: req.user.username });
});

router.post("/change-password", requireAuth, async (req, res) => {
  const { newPassword } = req.body || {};
  if (typeof newPassword !== "string" || newPassword.length < 6) {
    return res.status(400).json({ error: "La contraseña debe tener al menos 6 caracteres." });
  }
  try {
    await updateAdminPassword(bcrypt.hashSync(newPassword, 10));
    res.json({ ok: true });
  } catch (err) {
    console.error("Error al cambiar la contraseña:", err);
    res.status(500).json({ error: "Error interno al cambiar la contraseña." });
  }
});

// ── Contenido (autenticado) ─────────────────────────────────────────────
router.get("/content", requireAuth, async (_req, res) => {
  try {
    const content = await getPublicContent();
    res.json(content);
  } catch (err) {
    console.error("Error al obtener el contenido:", err);
    res.status(500).json({ error: "Error al obtener el contenido." });
  }
});

function checkCollection(req, res, next) {
  if (!COLLECTIONS.includes(req.params.collection)) {
    return res.status(404).json({ error: "Colección desconocida." });
  }
  next();
}

// Crear
router.post("/:collection", requireAuth, checkCollection, async (req, res) => {
  const collection = req.params.collection;
  const fields = FIELDS[collection];
  const data = pick(req.body || {}, fields);

  for (const f of fields) {
    if (!data[f] && !OPTIONAL_FIELDS.has(f)) {
      return res.status(400).json({ error: `Falta el campo "${f}".` });
    }
  }

  try {
    const item = await createItem(collection, data);
    res.status(201).json(item);
  } catch (err) {
    console.error("Error al crear el elemento:", err);
    res.status(500).json({ error: "Error interno al crear el elemento." });
  }
});

// Editar
router.put("/:collection/:id", requireAuth, checkCollection, async (req, res) => {
  const collection = req.params.collection;
  const fields = FIELDS[collection];
  const data = pick(req.body || {}, fields);

  try {
    const updated = await updateItem(collection, req.params.id, data);
    if (!updated) return res.status(404).json({ error: "No encontrado." });
    res.json(updated);
  } catch (err) {
    console.error("Error al editar el elemento:", err);
    res.status(500).json({ error: "Error interno al editar el elemento." });
  }
});

// Borrar
router.delete("/:collection/:id", requireAuth, checkCollection, async (req, res) => {
  try {
    const removed = await deleteItem(req.params.collection, req.params.id);
    if (!removed) return res.status(404).json({ error: "No encontrado." });
    res.json(removed);
  } catch (err) {
    console.error("Error al borrar el elemento:", err);
    res.status(500).json({ error: "Error interno al borrar el elemento." });
  }
});

// Reordenar (arrastrar en la lista): recibe el array completo de ids en el
// nuevo orden deseado.
router.put("/:collection/reorder/all", requireAuth, checkCollection, async (req, res) => {
  const { order } = req.body || {};
  if (!Array.isArray(order)) return res.status(400).json({ error: 'Falta el array "order".' });

  try {
    const reordered = await reorderCollection(req.params.collection, order);
    if (!reordered) {
      return res.status(400).json({ error: "El orden enviado no coincide con los elementos existentes." });
    }
    res.json(reordered);
  } catch (err) {
    console.error("Error al reordenar:", err);
    res.status(500).json({ error: "Error interno al reordenar." });
  }
});

export default router;