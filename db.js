// Capa de datos contra PostgreSQL.
//
// Reemplaza al viejo esquema de "un archivo JSON en disco": ahora los datos
// viven en una base Postgres, lo cual es necesario en hosting con sistema
// de archivos efímero (Render, Railway, Vercel, etc.) donde un archivo
// local se perdería en cada reinicio/deploy.
//
// La forma de usar este módulo desde las rutas se mantuvo lo más parecida
// posible a como usaban readDB()/writeDB() antes, para minimizar cambios.

import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pg;

export const pool = process.env.DATABASE_URL
  ? new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.DB_SSL === "false" ? false : { rejectUnauthorized: false },
    })
  : new Pool({
      host: process.env.DB_HOST || "localhost",
      port: parseInt(process.env.DB_PORT || "5432"),
      user: process.env.DB_USER || "postgres",
      password: process.env.DB_PASSWORD || "",
      database: process.env.DB_NAME || "teoria_delderechob",
    });

pool.on("error", (err) => {
  console.error("Error inesperado en el cliente de PostgreSQL", err);
});

// ── Configuración de colecciones ────────────────────────────────────────
// Mapea el nombre de colección (el mismo que usan las rutas /api/admin/:collection)
// a su tabla real y a la correspondencia entre el nombre de campo que usan
// las rutas (igual que antes, ej. "desc") y el nombre real de columna en la
// base (ej. "description", porque "desc" es un nombre incómodo para SQL).
const COLLECTIONS_CONFIG = {
  docentes: {
    table: "docentes",
    columns: { name: "name", role: "role" },
  },
  auxiliares: {
    table: "auxiliares",
    columns: { name: "name" },
  },
  links: {
    table: "links",
    columns: { label: "label", url: "url", desc: "description", icon: "icon" },
  },
  timeline: {
    table: "timeline",
    columns: { icon: "icon", color: "color", title: "title", badge: "badge", text: "text" },
  },
};

export const COLLECTIONS = Object.keys(COLLECTIONS_CONFIG);

function selectColumnsSQL(collection) {
  const cfg = COLLECTIONS_CONFIG[collection];
  return Object.entries(cfg.columns)
    .map(([jsField, sqlColumn]) => `${sqlColumn} AS "${jsField}"`)
    .join(", ");
}

// ── Contenido público / administrado ────────────────────────────────────

export async function getPublicContent() {
  const [docentes, auxiliares, links, timeline] = await Promise.all(
    COLLECTIONS.map((c) => getCollection(c))
  );
  return { docentes, auxiliares, links, timeline };
}

export async function getCollection(collection) {
  const cfg = COLLECTIONS_CONFIG[collection];
  const { rows } = await pool.query(
    `SELECT id, ${selectColumnsSQL(collection)} FROM ${cfg.table} ORDER BY position ASC`
  );
  return rows;
}

export async function getItemById(collection, id) {
  const cfg = COLLECTIONS_CONFIG[collection];
  const { rows } = await pool.query(
    `SELECT id, ${selectColumnsSQL(collection)} FROM ${cfg.table} WHERE id = $1`,
    [id]
  );
  return rows[0] || null;
}

export async function createItem(collection, data) {
  const cfg = COLLECTIONS_CONFIG[collection];
  const jsFields = Object.keys(data);
  const sqlColumns = jsFields.map((f) => cfg.columns[f]);
  const values = jsFields.map((f) => data[f]);

  const { rows: posRows } = await pool.query(
    `SELECT COALESCE(MAX(position), -1) + 1 AS next FROM ${cfg.table}`
  );
  const nextPosition = posRows[0].next;

  const insertColumns = [...sqlColumns, "position"];
  const placeholders = insertColumns.map((_, i) => `$${i + 1}`);

  const { rows } = await pool.query(
    `INSERT INTO ${cfg.table} (${insertColumns.join(", ")})
     VALUES (${placeholders.join(", ")})
     RETURNING id, ${selectColumnsSQL(collection)}`,
    [...values, nextPosition]
  );
  return rows[0];
}

export async function updateItem(collection, id, data) {
  const cfg = COLLECTIONS_CONFIG[collection];
  const jsFields = Object.keys(data);
  if (jsFields.length === 0) {
    return getItemById(collection, id);
  }

  const setClauses = jsFields.map((f, i) => `${cfg.columns[f]} = $${i + 1}`);
  const values = jsFields.map((f) => data[f]);

  const { rows } = await pool.query(
    `UPDATE ${cfg.table} SET ${setClauses.join(", ")}
     WHERE id = $${values.length + 1}
     RETURNING id, ${selectColumnsSQL(collection)}`,
    [...values, id]
  );
  return rows[0] || null;
}

export async function deleteItem(collection, id) {
  const cfg = COLLECTIONS_CONFIG[collection];
  const { rows } = await pool.query(
    `DELETE FROM ${cfg.table} WHERE id = $1 RETURNING id, ${selectColumnsSQL(collection)}`,
    [id]
  );
  return rows[0] || null;
}

export async function reorderCollection(collection, order) {
  const cfg = COLLECTIONS_CONFIG[collection];

  const { rows: existing } = await pool.query(`SELECT id FROM ${cfg.table}`);
  const existingIds = new Set(existing.map((r) => r.id));

  const isValidOrder =
    order.length === existingIds.size && order.every((id) => existingIds.has(id));

  if (!isValidOrder) {
    return null; // el llamador interpreta null como "orden inválido"
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    for (let i = 0; i < order.length; i++) {
      await client.query(`UPDATE ${cfg.table} SET position = $1 WHERE id = $2`, [i, order[i]]);
    }
    await client.query("COMMIT");
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }

  return getCollection(collection);
}

// ── Administrador ────────────────────────────────────────────────────────

export async function getAdmin() {
  const { rows } = await pool.query(
    `SELECT username, password_hash AS "passwordHash" FROM admin LIMIT 1`
  );
  return rows[0] || null;
}

// Crea (o reemplaza por completo) el único admin permitido.
export async function setAdmin(username, passwordHash) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await client.query("DELETE FROM admin");
    await client.query(
      "INSERT INTO admin (username, password_hash) VALUES ($1, $2)",
      [username, passwordHash]
    );
    await client.query("COMMIT");
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

export async function updateAdminPassword(passwordHash) {
  await pool.query("UPDATE admin SET password_hash = $1", [passwordHash]);
}