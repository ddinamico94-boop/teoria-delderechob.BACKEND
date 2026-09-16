// Script de migración: agrega la columna "icon_image" a la tabla "links",
// para guardar la URL de una imagen subida a Cloudinary como ícono
// alternativo al ícono de texto/select que ya existía.
//
// Uso (mismo patrón que los scripts anteriores):
//   DATABASE_URL="tu_external_database_url" node scripts/add-link-icon-image-column.js
//
// Es seguro correrlo más de una vez: usa "IF NOT EXISTS".

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
      ALTER TABLE links
      ADD COLUMN IF NOT EXISTS icon_image TEXT;
    `);
    console.log('✅ Columna "icon_image" agregada a la tabla links (o ya existía).');
  } catch (err) {
    console.error("❌ Error al agregar la columna icon_image:", err);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

main();