// Script de migración: crea la tabla "parciales" si no existe.
//
// Uso (igual patrón que create-admin.js):
//   DATABASE_URL="tu_external_database_url" node scripts/create-parciales-table.js
//
// Es seguro correrlo más de una vez: usa "IF NOT EXISTS", así que si la
// tabla ya existe, no hace nada y no borra datos.

import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pg;

const pool = process.env.DATABASE_URL
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

async function main() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS parciales (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        date TEXT NOT NULL,
        position INTEGER NOT NULL DEFAULT 0
      );
    `);
    console.log('✅ Tabla "parciales" creada (o ya existía). Lista para usar.');
  } catch (err) {
    console.error("❌ Error al crear la tabla parciales:", err);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

main();