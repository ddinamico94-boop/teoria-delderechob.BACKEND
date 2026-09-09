#!/usr/bin/env node
// Crea o resetea el usuario/contraseña del panel de administración.
//
// Uso (desde la carpeta server/):
//   npm run create-admin -- <usuario> <contraseña>
//
// Ejemplo:
//   npm run create-admin -- comision4 "una-contraseña-larga-y-segura"

import bcrypt from "bcryptjs";
import { readDB, writeDB } from "../db.js";

const [, , username, password] = process.argv;

if (!username || !password) {
  console.log("Uso: npm run create-admin -- <usuario> <contraseña>");
  process.exit(1);
}

if (password.length < 6) {
  console.error("La contraseña debe tener al menos 6 caracteres.");
  process.exit(1);
}

const db = readDB();
db.admin = { username, passwordHash: bcrypt.hashSync(password, 10) };
writeDB(db);

console.log(`✅ Usuario admin "${username}" creado/actualizado. Ya podés entrar en /admin.`);
