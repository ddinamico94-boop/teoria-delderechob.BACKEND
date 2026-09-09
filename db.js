// Base de datos muy simple: un único archivo JSON en disco.
// No usamos SQLite/Mongo/etc a propósito: el sitio es de bajo tráfico
// (una cátedra), lo importante es que sea fácil de entender, respaldar
// (es un solo archivo) y mover a otro servidor.

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { randomUUID } from "crypto";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const DB_PATH = path.join(__dirname, "data", "db.json");

function seed() {
  return {
    // Se crea vacío: hay que ejecutar `npm run create-admin` una vez
    // (ver server/README.md) para poder entrar al panel.
    admin: null,

    docentes: [
      { id: randomUUID(), name: "Dr. Fabricio Falcucci", role: "Profesor Adjunto Int." },
      { id: randomUUID(), name: "Dra. Margarita Vázquez", role: "Auxiliar Docente Regular" },
      { id: randomUUID(), name: "Dr. Evaristo Ulivarri", role: "Auxiliar Graduado" },
    ],

    auxiliares: [
      { id: randomUUID(), name: "Cristian Sebastián" },
      { id: randomUUID(), name: "Facundo Sánchez" },
      { id: randomUUID(), name: "Ignacio Sosa" },
      { id: randomUUID(), name: "Leonel López Hyrycz" },
      { id: randomUUID(), name: "Felipe Cano" },
      { id: randomUUID(), name: "Joaquín Flores Arias" },
      { id: randomUUID(), name: "Guadalupe Farías" },
      { id: randomUUID(), name: "Lourdes Chávez" },
    ],

    links: [
      { id: randomUUID(), label: "Aula Virtual — SIU Guaraní", url: "#", desc: "Sistema de gestión académica de la facultad", icon: "graduate" },
      { id: randomUUID(), label: "Biblioteca Digital Jurídica", url: "#", desc: "Acceso a recursos bibliográficos y revistas especializadas", icon: "book" },
      { id: randomUUID(), label: "Programa de la Materia 2026", url: "#", desc: "Contenidos mínimos, bibliografía y cronograma de cursado", icon: "doc" },
      { id: randomUUID(), label: "Plataforma Moodle", url: "#", desc: "Materiales de estudio, foros y entregas de trabajos", icon: "monitor" },
      { id: randomUUID(), label: "Canal de YouTube — Clases Grabadas", url: "#", desc: "Registro audiovisual de las clases teóricas", icon: "play" },
      { id: randomUUID(), label: "Grupo de WhatsApp", url: "#", desc: "Canal oficial de comunicación de la comisión", icon: "message" },
      { id: randomUUID(), label: "Reglamento Académico", url: "#", desc: "Normativa vigente de la facultad", icon: "clipboard" },
      { id: randomUUID(), label: "Contacto Docente", url: "#", desc: "Mail institucional para consultas académicas", icon: "mail" },
    ],

    timeline: [
      {
        id: randomUUID(),
        icon: "bulb",
        color: "cyan",
        title: "Origen en la Cátedra",
        badge: "",
        text: 'La iniciativa surgió como un trabajo de profundización temática enfocado en el análisis de los "Nuevos Sujetos de Derecho" en el marco de la asignatura Teoría del Derecho y la Justicia "B".',
      },
      {
        id: randomUUID(),
        icon: "leaf",
        color: "magenta",
        title: "Trabajo de Campo e Interdisciplina (El Manantial)",
        badge: "",
        text: "El equipo realizó un abordaje de campo territorial e interdisciplinario en la sede de El Manantial, articulando conocimientos prácticos junto a docentes y estudiantes de la Facultad de Agronomía, Zootecnia y Veterinaria (FAZYV-UNT).",
      },
      {
        id: randomUUID(),
        icon: "building",
        color: "cyan",
        title: "Gestión e Intercambio Institucional",
        badge: "",
        text: "Con las conclusiones y diagnósticos recabados en el territorio, el equipo mantuvo reuniones institucionales con las autoridades académicas para fundamentar la necesidad de incorporar este nuevo paradigma jurídico no antropocéntrico a la oferta académica de grado.",
      },
      {
        id: randomUUID(),
        icon: "clipboard",
        color: "magenta",
        title: "Tratamiento y Aprobación en el HCD",
        badge: "RES-DER-CD-11448/2024",
        text: "Elevado bajo el Expediente EXP-DER-ME-2945/2024, el proyecto obtuvo dictamen favorable de la Comisión de Enseñanza el 3 de julio de 2024. El Honorable Consejo Directivo aprobó la creación de la asignatura en Sesión Ordinaria el 24 de julio de 2024 mediante la Resolución RES-DER-CD-11448/2024.",
      },
      {
        id: randomUUID(),
        icon: "graduate",
        color: "cyan",
        title: "Puesta en Vigencia",
        badge: "Desde 2025",
        text: "La materia comenzó a dictarse por extensión docente a partir del primer semestre del Ciclo Lectivo 2025.",
      },
    ],
  };
}

export function readDB() {
  if (!fs.existsSync(DB_PATH)) {
    fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
    fs.writeFileSync(DB_PATH, JSON.stringify(seed(), null, 2));
  }
  return JSON.parse(fs.readFileSync(DB_PATH, "utf-8"));
}

export function writeDB(data) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

export const COLLECTIONS = ["docentes", "auxiliares", "links", "timeline"];
