-- Ejecutá este script UNA VEZ contra tu base PostgreSQL para crear las
-- tablas y cargar los mismos datos iniciales que tenía server/data/db.json.
--
-- Ejemplo local:
--   psql -d teoria_delderechob -f schema.sql

CREATE EXTENSION IF NOT EXISTS pgcrypto; -- necesaria para gen_random_uuid()

-- ── Administrador del panel ────────────────────────────────────────────
-- Se crea vacía a propósito: seguís usando `npm run create-admin -- <user> <pass>`
-- para dar de alta al admin la primera vez.
CREATE TABLE IF NOT EXISTS admin (
  id SERIAL PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL
);

-- ── Colecciones de contenido ─────────────────────────────────────────────
-- Cada una tiene una columna "position" para poder mantener el orden que
-- se define con el drag-and-drop del panel (antes era el orden del array).

CREATE TABLE IF NOT EXISTS docentes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  position INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS auxiliares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  position INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  label TEXT NOT NULL,
  url TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  position INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS timeline (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  icon TEXT,
  color TEXT,
  title TEXT NOT NULL,
  badge TEXT DEFAULT '',
  text TEXT NOT NULL,
  position INTEGER NOT NULL DEFAULT 0
);

-- ── Datos iniciales (misma semilla que tenía db.js) ─────────────────────

INSERT INTO docentes (name, role, position) VALUES
  ('Dr. Fabricio Falcucci', 'Profesor Adjunto Int.', 0),
  ('Dra. Margarita Vázquez', 'Auxiliar Docente Regular', 1),
  ('Dr. Evaristo Ulivarri', 'Auxiliar Graduado', 2);

INSERT INTO auxiliares (name, position) VALUES
  ('Cristian Sebastián', 0),
  ('Facundo Sánchez', 1),
  ('Ignacio Sosa', 2),
  ('Leonel López Hyrycz', 3),
  ('Felipe Cano', 4),
  ('Joaquín Flores Arias', 5),
  ('Guadalupe Farías', 6),
  ('Lourdes Chávez', 7);

INSERT INTO links (label, url, description, icon, position) VALUES
  ('Aula Virtual — SIU Guaraní', '#', 'Sistema de gestión académica de la facultad', 'graduate', 0),
  ('Biblioteca Digital Jurídica', '#', 'Acceso a recursos bibliográficos y revistas especializadas', 'book', 1),
  ('Programa de la Materia 2026', '#', 'Contenidos mínimos, bibliografía y cronograma de cursado', 'doc', 2),
  ('Plataforma Moodle', '#', 'Materiales de estudio, foros y entregas de trabajos', 'monitor', 3),
  ('Canal de YouTube — Clases Grabadas', '#', 'Registro audiovisual de las clases teóricas', 'play', 4),
  ('Grupo de WhatsApp', '#', 'Canal oficial de comunicación de la comisión', 'message', 5),
  ('Reglamento Académico', '#', 'Normativa vigente de la facultad', 'clipboard', 6),
  ('Contacto Docente', '#', 'Mail institucional para consultas académicas', 'mail', 7);

INSERT INTO timeline (icon, color, title, badge, text, position) VALUES
  ('bulb', 'cyan', 'Origen en la Cátedra', '',
   'La iniciativa surgió como un trabajo de profundización temática enfocado en el análisis de los "Nuevos Sujetos de Derecho" en el marco de la asignatura Teoría del Derecho y la Justicia "B".', 0),
  ('leaf', 'magenta', 'Trabajo de Campo e Interdisciplina (El Manantial)', '',
   'El equipo realizó un abordaje de campo territorial e interdisciplinario en la sede de El Manantial, articulando conocimientos prácticos junto a docentes y estudiantes de la Facultad de Agronomía, Zootecnia y Veterinaria (FAZYV-UNT).', 1),
  ('building', 'cyan', 'Gestión e Intercambio Institucional', '',
   'Con las conclusiones y diagnósticos recabados en el territorio, el equipo mantuvo reuniones institucionales con las autoridades académicas para fundamentar la necesidad de incorporar este nuevo paradigma jurídico no antropocéntrico a la oferta académica de grado.', 2),
  ('clipboard', 'magenta', 'Tratamiento y Aprobación en el HCD', 'RES-DER-CD-11448/2024',
   'Elevado bajo el Expediente EXP-DER-ME-2945/2024, el proyecto obtuvo dictamen favorable de la Comisión de Enseñanza el 3 de julio de 2024. El Honorable Consejo Directivo aprobó la creación de la asignatura en Sesión Ordinaria el 24 de julio de 2024 mediante la Resolución RES-DER-CD-11448/2024.', 3),
  ('graduate', 'cyan', 'Puesta en Vigencia', 'Desde 2025',
   'La materia comenzó a dictarse por extensión docente a partir del primer semestre del Ciclo Lectivo 2025.', 4);