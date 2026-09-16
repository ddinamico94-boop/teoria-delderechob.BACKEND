import { useEffect, useState } from "react";
import logoImg from "@/imports/WhatsApp_Image_2026-08-26_at_23.21.12.jpeg";
import {
  IconScale,
  IconSearch,
  IconBook,
  IconHandshake,
  IconBulb,
  IconDoc,
  IconPaw,
  IconArrow,
  IconSun,
  IconMoon,
  ICONS,
} from "./icons";

type Section = "inicio" | "equipo" | "proyectos" | "links";

type Docente = { id: string; name: string; role: string };
type Auxiliar = { id: string; name: string };
type LinkItem = { id: string; label: string; url: string; desc: string; icon: string };
type TimelineStep = { id: string; icon: string; color: "cyan" | "magenta"; title: string; text: string; badge?: string };

// ── Datos por defecto ────────────────────────────────────────────────────
// Se muestran mientras se carga el contenido real desde el backend (o si el
// backend no está disponible), para que el sitio nunca se vea vacío. El
// contenido "de verdad" ahora se administra desde /admin y vive en
// server/data/db.json.

const defaultDocentes: Docente[] = [
  { id: "d1", name: "Dr. Fabricio Falcucci", role: "Profesor Adjunto Int." },
  { id: "d2", name: "Dra. Margarita Vázquez", role: "Auxiliar Docente Regular" },
  { id: "d3", name: "Dr. Evaristo Ulivarri", role: "Auxiliar Graduado" },
];

const defaultAuxiliares: Auxiliar[] = [
  "Cristian Sebastián",
  "Facundo Sánchez",
  "Ignacio Sosa",
  "Leonel López Hyrycz",
  "Felipe Cano",
  "Joaquín Flores Arias",
  "Guadalupe Farías",
  "Lourdes Chávez",
].map((name, i) => ({ id: `a${i}`, name }));

const defaultLinks: LinkItem[] = [
  { id: "l1", label: "Aula Virtual — SIU Guaraní", url: "#", desc: "Sistema de gestión académica de la facultad", icon: "graduate" },
  { id: "l2", label: "Biblioteca Digital Jurídica", url: "#", desc: "Acceso a recursos bibliográficos y revistas especializadas", icon: "book" },
  { id: "l3", label: "Programa de la Materia 2026", url: "#", desc: "Contenidos mínimos, bibliografía y cronograma de cursado", icon: "doc" },
  { id: "l4", label: "Plataforma Moodle", url: "#", desc: "Materiales de estudio, foros y entregas de trabajos", icon: "monitor" },
  { id: "l5", label: "Canal de YouTube — Clases Grabadas", url: "#", desc: "Registro audiovisual de las clases teóricas", icon: "play" },
  { id: "l6", label: "Grupo de WhatsApp", url: "#", desc: "Canal oficial de comunicación de la comisión", icon: "message" },
  { id: "l7", label: "Reglamento Académico", url: "#", desc: "Normativa vigente de la facultad", icon: "clipboard" },
  { id: "l8", label: "Contacto Docente", url: "#", desc: "Mail institucional para consultas académicas", icon: "mail" },
];

const defaultTimeline: TimelineStep[] = [
  {
    id: "t1",
    icon: "bulb",
    title: "Origen en la Cátedra",
    color: "cyan",
    text: 'La iniciativa surgió como un trabajo de profundización temática enfocado en el análisis de los "Nuevos Sujetos de Derecho" en el marco de la asignatura Teoría del Derecho y la Justicia "B".',
  },
  {
    id: "t2",
    icon: "leaf",
    title: "Trabajo de Campo e Interdisciplina (El Manantial)",
    color: "magenta",
    text: "El equipo realizó un abordaje de campo territorial e interdisciplinario en la sede de El Manantial, articulando conocimientos prácticos junto a docentes y estudiantes de la Facultad de Agronomía, Zootecnia y Veterinaria (FAZYV-UNT).",
  },
  {
    id: "t3",
    icon: "building",
    title: "Gestión e Intercambio Institucional",
    color: "cyan",
    text: "Con las conclusiones y diagnósticos recabados en el territorio, el equipo mantuvo reuniones institucionales con las autoridades académicas para fundamentar la necesidad de incorporar este nuevo paradigma jurídico no antropocéntrico a la oferta académica de grado.",
  },
  {
    id: "t4",
    icon: "clipboard",
    title: "Tratamiento y Aprobación en el HCD",
    color: "magenta",
    text: "Elevado bajo el Expediente EXP-DER-ME-2945/2024, el proyecto obtuvo dictamen favorable de la Comisión de Enseñanza el 3 de julio de 2024. El Honorable Consejo Directivo aprobó la creación de la asignatura en Sesión Ordinaria el 24 de julio de 2024 mediante la Resolución RES-DER-CD-11448/2024.",
    badge: "RES-DER-CD-11448/2024",
  },
  {
    id: "t5",
    icon: "graduate",
    title: "Puesta en Vigencia",
    color: "cyan",
    text: "La materia comenzó a dictarse por extensión docente a partir del primer semestre del Ciclo Lectivo 2025.",
    badge: "Desde 2025",
  },
];

// ── Component ─────────────────────────────────────────────────────────────

export default function App() {
  const [active, setActive] = useState<Section>("inicio");
  const [menuOpen, setMenuOpen] = useState(false);
  const [lightMode, setLightMode] = useState(false);

  // Contenido administrable: arranca con los valores por defecto de arriba
  // y se reemplaza en cuanto responde el backend.
  const [docentesCuerpo, setDocentesCuerpo] = useState<Docente[]>(defaultDocentes);
  const [auxiliaresEstudiantiles, setAuxiliaresEstudiantiles] = useState<Auxiliar[]>(defaultAuxiliares);
  const [links, setLinks] = useState<LinkItem[]>(defaultLinks);
  const [timelineSteps, setTimelineSteps] = useState<TimelineStep[]>(defaultTimeline);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/content")
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((data) => {
        if (cancelled) return;
        if (Array.isArray(data.docentes) && data.docentes.length) setDocentesCuerpo(data.docentes);
        if (Array.isArray(data.auxiliares) && data.auxiliares.length) setAuxiliaresEstudiantiles(data.auxiliares);
        if (Array.isArray(data.links) && data.links.length) setLinks(data.links);
        if (Array.isArray(data.timeline) && data.timeline.length) setTimelineSteps(data.timeline);
      })
      .catch(() => {
        // Si el backend no responde, se queda con el contenido por defecto.
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const nav = (section: Section) => {
    setActive(section);
    setMenuOpen(false);
  };

  return (
    <div className={`min-h-full mesh-bg${lightMode ? " light-mode" : ""}`}>
      {/* NAV */}
      <header
        className="sticky top-0 z-50 border-b"
        style={{ borderColor: "var(--nav-border)", backgroundColor: "var(--nav-bg)", backdropFilter: "blur(16px)" }}
      >
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between h-16">
          {/* Left: logo + title + theme toggle */}
          <div className="flex items-center gap-3">
            <button onClick={() => nav("inicio")} className="flex items-center gap-3">
              <img src={logoImg} alt="Logo Comisión 4" className="w-10 h-10 rounded-full object-cover" />
              <span className="font-display text-lg tracking-widest hidden sm:block" style={{ color: "var(--cyan)" }}>
                COMISIÓN 4
              </span>
            </button>

            {/* Theme toggle */}
            <button
              onClick={() => setLightMode(!lightMode)}
              className="flex items-center justify-center w-8 h-8 rounded-full transition-all"
              style={{
                backgroundColor: lightMode ? "rgba(255,45,155,0.12)" : "rgba(0,212,212,0.12)",
                border: lightMode ? "1px solid rgba(255,45,155,0.35)" : "1px solid rgba(0,212,212,0.35)",
                color: lightMode ? "var(--magenta)" : "var(--cyan)",
              }}
              aria-label={lightMode ? "Cambiar a modo oscuro" : "Cambiar a modo claro"}
            >
              {lightMode ? <IconSun size={15} /> : <IconMoon size={15} />}
            </button>
          </div>

          <nav className="hidden md:flex items-center gap-8">
            {(["inicio", "equipo", "proyectos", "links"] as Section[]).map((s) => (
              <button key={s} onClick={() => nav(s)} className={`nav-link ${active === s ? "active" : ""}`}>
                {s === "inicio" ? "Inicio" : s === "equipo" ? "Nuestro Equipo" : s === "proyectos" ? "Proyectos" : "Links"}
              </button>
            ))}
          </nav>

          <button
            className="md:hidden flex flex-col gap-1.5 p-2"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Abrir menú"
          >
            <span className="block w-6 h-0.5" style={{ backgroundColor: "var(--cyan)" }} />
            <span className="block w-6 h-0.5" style={{ backgroundColor: "var(--magenta)" }} />
            <span className="block w-4 h-0.5" style={{ backgroundColor: "var(--cyan)" }} />
          </button>
        </div>

        {menuOpen && (
          <div className="md:hidden border-t px-6 py-4 flex flex-col gap-4" style={{ borderColor: "var(--nav-border)", backgroundColor: "var(--nav-bg)" }}>
            {(["inicio", "equipo", "proyectos", "links"] as Section[]).map((s) => (
              <button key={s} onClick={() => nav(s)} className={`nav-link text-left ${active === s ? "active" : ""}`}>
                {s === "inicio" ? "Inicio" : s === "equipo" ? "Nuestro Equipo" : s === "proyectos" ? "Proyectos" : "Links"}
              </button>
            ))}
          </div>
        )}
      </header>

      <main>
        {/* ── INICIO ── */}
        {active === "inicio" && (
          <div>
            {/* Hero */}
            <section className="relative overflow-hidden">
              <div
                className="absolute inset-0 pointer-events-none"
                style={{ background: "radial-gradient(ellipse at 70% 40%, rgba(0,212,212,0.12) 0%, transparent 55%), radial-gradient(ellipse at 20% 70%, rgba(255,45,155,0.12) 0%, transparent 55%)" }}
              />
              <div className="max-w-6xl mx-auto px-6 py-24 md:py-36 grid md:grid-cols-2 gap-16 items-center">
                <div>
                  <div
                    className="inline-block mb-4 px-3 py-1 rounded text-xs font-semibold tracking-widest uppercase"
                    style={{ backgroundColor: "rgba(0,212,212,0.12)", color: "var(--cyan)", border: "1px solid rgba(0,212,212,0.3)" }}
                  >
                    Facultad de Derecho
                  </div>
                  <h1 className="section-title mb-4" style={{ color: "#fff" }}>
                    TEORÍA DEL<br />
                    <span className="gradient-text">DERECHO</span><br />
                    Y LA JUSTICIA
                  </h1>
                  <p className="text-base md:text-lg mb-2 font-semibold" style={{ color: "var(--magenta)" }}>
                    Comisión 4 — Turno "B"
                  </p>
                  <p className="mb-8 leading-relaxed" style={{ color: "var(--text-secondary)", maxWidth: "440px" }}>
                    Exploramos los fundamentos filosóficos, epistemológicos y axiológicos del fenómeno jurídico. Un espacio de pensamiento crítico sobre el derecho, la norma y la justicia.
                  </p>
                  <div className="flex flex-wrap gap-4">
                    <button className="btn-primary" onClick={() => nav("equipo")}>
                      Conocer el equipo
                    </button>
                    <button
                      className="px-6 py-3 rounded text-sm font-semibold uppercase tracking-widest transition-colors"
                      style={{ border: "1px solid rgba(255,45,155,0.4)", color: "var(--magenta)" }}
                      onClick={() => nav("proyectos")}
                      onMouseOver={(e) => { e.currentTarget.style.backgroundColor = "rgba(255,45,155,0.08)"; }}
                      onMouseOut={(e) => { e.currentTarget.style.backgroundColor = "transparent"; }}
                    >
                      Ver proyectos
                    </button>
                  </div>
                </div>

                <div className="flex justify-center">
                  <div
                    className="gradient-border rounded-full p-1 shadow-2xl"
                    style={{ boxShadow: "0 0 60px rgba(0,212,212,0.2), 0 0 100px rgba(255,45,155,0.1)" }}
                  >
                    <img
                      src={logoImg}
                      alt="Logo Comisión 4 — Teoría del Derecho y la Justicia B"
                      className="w-56 h-56 md:w-72 md:h-72 rounded-full object-cover"
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* Stats strip */}
            <section style={{ borderTop: "1px solid var(--strip-border)", borderBottom: "1px solid var(--strip-border)", backgroundColor: "var(--strip-bg)" }}>
              <div className="max-w-6xl mx-auto px-6 py-10 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                {[
                  { value: "2026", label: "Ciclo lectivo" },
                  { value: "11", label: "Integrantes" },
                  { value: "1", label: "Proyecto institucional" },
                  { value: "4ª", label: "Comisión" },
                ].map((s) => (
                  <div key={s.label}>
                    <div className="font-display text-4xl md:text-5xl gradient-text">{s.value}</div>
                    <div className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </section>

            {/* Welcome message */}
            <section className="max-w-6xl mx-auto px-6 py-20">
              <div
                className="gradient-border rounded-2xl p-8 md:p-12"
                style={{ backgroundColor: "var(--bg-card)" }}
              >
                <div className="grid md:grid-cols-[1fr_2px_1fr] gap-10 md:gap-0 items-start">
                  <div className="md:pr-10">
                    <div className="mb-4" style={{ color: "var(--cyan)" }}>
                      <IconScale size={36} color="var(--cyan)" />
                    </div>
                    <h2
                      className="font-display text-3xl md:text-4xl leading-tight mb-4"
                      style={{ color: "#fff", letterSpacing: "0.03em" }}
                    >
                      ¡BIENVENIDOS A LA<br />
                      <span className="gradient-text">COMISIÓN 4</span><br />
                      DE DERECHO Y<br />JUSTICIA B!
                    </h2>
                    <div className="h-1 w-16 rounded" style={{ background: "linear-gradient(90deg, var(--cyan), var(--magenta))" }} />
                  </div>

                  <div
                    className="hidden md:block h-full w-px mx-auto"
                    style={{ background: "linear-gradient(180deg, transparent, rgba(255,45,155,0.4) 30%, rgba(0,212,212,0.4) 70%, transparent)" }}
                  />

                  <div className="md:pl-10 flex flex-col gap-5">
                    <p style={{ color: "var(--text-primary)", lineHeight: 1.85, fontSize: "1rem" }}>
                      Les damos la más cordial bienvenida a la página oficial de la Comisión 4 de Derecho y Justicia B. Este sitio web nace como un <span style={{ color: "var(--cyan)", fontWeight: 600 }}>espacio institucional de encuentro</span>, diseñado para brindarles un acceso ágil y directo a la bibliografía oficial, programas, material de estudio, avisos y canales directos de contacto con nuestro equipo.
                    </p>
                    <p style={{ color: "var(--text-secondary)", lineHeight: 1.85, fontSize: "0.95rem" }}>
                      Entendemos este sitio no solo como un soporte a nuestras clases presenciales, sino también como un punto de <span style={{ color: "var(--magenta)", fontWeight: 600 }}>difusión e impulso para el desarrollo integral de la cátedra</span>. A lo largo del cursado, llevamos adelante actividades curriculares y extracurriculares, así como proyectos y jornadas de extensión universitaria que buscan conectar el conocimiento académico con la práctica profesional y la realidad social.
                    </p>
                    <div className="flex flex-wrap gap-3 mt-2">
                      {["Bibliografía oficial", "Material de estudio", "Extensión universitaria", "Contacto docente"].map((tag) => (
                        <span
                          key={tag}
                          className="text-xs px-3 py-1 rounded-full font-medium"
                          style={{ backgroundColor: "rgba(0,212,212,0.1)", color: "var(--cyan)", border: "1px solid rgba(0,212,212,0.25)" }}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Feature cards */}
            <section className="max-w-6xl mx-auto px-6 pb-20">
              <div className="grid md:grid-cols-3 gap-6">
                {[
                  { Icon: IconScale, title: "Teoría General", text: "Estudiamos los conceptos fundamentales del derecho: norma, ordenamiento, validez, eficacia y justicia desde una perspectiva crítica." },
                  { Icon: IconSearch, title: "Epistemología Jurídica", text: "Analizamos el conocimiento jurídico, sus métodos y presupuestos filosóficos desde las grandes corrientes del pensamiento occidental." },
                  { Icon: IconBook, title: "Hermenéutica", text: "Profundizamos en la interpretación y argumentación jurídica, con especial atención a la práctica judicial contemporánea." },
                ].map((c) => (
                  <div
                    key={c.title}
                    className="card-hover rounded-lg p-6"
                    style={{ backgroundColor: "rgba(22,22,31,0.7)", border: "1px solid rgba(0,212,212,0.12)" }}
                  >
                    <div className="mb-4" style={{ color: "var(--cyan)" }}>
                      <c.Icon size={28} color="var(--cyan)" />
                    </div>
                    <h3 className="font-semibold text-base mb-2" style={{ color: "var(--cyan)" }}>{c.title}</h3>
                    <p style={{ color: "var(--text-muted)", lineHeight: 1.75, fontSize: "0.875rem" }}>{c.text}</p>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}

        {/* ── NUESTRO EQUIPO ── */}
        {active === "equipo" && (
          <section className="max-w-5xl mx-auto px-6 py-20">
            <div className="mb-14">
              <p className="text-xs uppercase tracking-widest mb-2" style={{ color: "var(--magenta)" }}>Comisión 4</p>
              <h2 className="section-title gradient-text">Nuestro Equipo</h2>
            </div>

            {/* Cuerpo Docente */}
            <div className="mb-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-px flex-1" style={{ background: "linear-gradient(90deg, rgba(0,212,212,0.5), transparent)" }} />
                <span className="text-xs font-semibold uppercase tracking-widest px-3" style={{ color: "var(--cyan)" }}>Cuerpo Docente</span>
                <div className="h-px flex-1" style={{ background: "linear-gradient(90deg, transparent, rgba(0,212,212,0.5))" }} />
              </div>
              <div className="grid sm:grid-cols-3 gap-5">
                {docentesCuerpo.map((d) => (
                  <div
                    key={d.id}
                    className="card-hover rounded-xl p-6 text-center"
                    style={{ backgroundColor: "var(--bg-card)", border: "1px solid rgba(0,212,212,0.2)" }}
                  >
                    <div
                      className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center font-display text-2xl"
                      style={{
                        background: "linear-gradient(135deg, rgba(0,212,212,0.2), rgba(0,212,212,0.05))",
                        color: "var(--cyan)",
                        border: "1.5px solid rgba(0,212,212,0.35)",
                      }}
                    >
                      {d.name.replace(/^(Dr|Dra)\.\s+/, "").split(" ").map((n) => n[0]).slice(0, 2).join("")}
                    </div>
                    <h3 className="font-semibold text-base mb-1">{d.name}</h3>
                    <p className="text-xs font-medium uppercase tracking-wide" style={{ color: "var(--cyan)" }}>{d.role}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Auxiliares Estudiantiles */}
            <div className="mb-12">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-px flex-1" style={{ background: "linear-gradient(90deg, rgba(255,45,155,0.5), transparent)" }} />
                <span className="text-xs font-semibold uppercase tracking-widest px-3" style={{ color: "var(--magenta)" }}>Equipo de Auxiliares Estudiantiles</span>
                <div className="h-px flex-1" style={{ background: "linear-gradient(90deg, transparent, rgba(255,45,155,0.5))" }} />
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {auxiliaresEstudiantiles.map((aux) => (
                  <div
                    key={aux.id}
                    className="card-hover rounded-lg px-4 py-4 flex items-center gap-3"
                    style={{ backgroundColor: "var(--bg-card)", border: "1px solid rgba(255,45,155,0.15)" }}
                  >
                    <div
                      className="w-8 h-8 rounded-full shrink-0 flex items-center justify-center text-xs font-bold"
                      style={{
                        background: "linear-gradient(135deg, rgba(255,45,155,0.25), rgba(255,45,155,0.08))",
                        color: "var(--magenta)",
                        border: "1px solid rgba(255,45,155,0.3)",
                      }}
                    >
                      {aux.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                    </div>
                    <span className="text-sm font-medium leading-tight" style={{ color: "var(--text-primary)" }}>{aux.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Nuestro Compromiso */}
            <div
              className="rounded-2xl p-8 md:p-10 relative overflow-hidden"
              style={{ backgroundColor: "var(--bg-card)", border: "1px solid rgba(255,45,155,0.2)" }}
            >
              <div className="absolute top-0 right-0 w-64 h-64 rounded-full pointer-events-none" style={{ background: "radial-gradient(circle, rgba(0,212,212,0.07) 0%, transparent 70%)", transform: "translate(30%, -30%)" }} />
              <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full pointer-events-none" style={{ background: "radial-gradient(circle, rgba(255,45,155,0.07) 0%, transparent 70%)", transform: "translate(-30%, 30%)" }} />

              <div className="relative">
                <div className="flex items-center gap-3 mb-6">
                  <IconHandshake size={28} color="var(--magenta)" />
                  <h3 className="font-display text-2xl md:text-3xl tracking-wide" style={{ color: "#fff" }}>
                    NUESTRO <span className="gradient-text">COMPROMISO</span>
                  </h3>
                </div>

                <div className="space-y-5 mb-8">
                  <p style={{ color: "var(--text-primary)", lineHeight: 1.85, fontSize: "0.975rem" }}>
                    Refrendamos nuestro compromiso con toda la comunidad educativa, sustentado en el ejercicio responsable de nuestra labor docente, académica y de extensión. Promovemos una visión de la educación <span style={{ color: "var(--cyan)", fontWeight: 600 }}>integral, armónica y basada en competencias</span> que no solo abarquen la excelencia técnica, sino también la formación sólida en valores para el ejercicio profesional y el compromiso ciudadano.
                  </p>
                  <p style={{ color: "var(--text-secondary)", lineHeight: 1.85, fontSize: "0.95rem" }}>
                    Expresamos nuestro reconocimiento al esfuerzo y dedicación constante de cada estudiante, y los invitamos a sumarse activamente a las distintas propuestas de la comisión con el desafío de superarnos día a día: para que aquello que ayer y hoy hicimos bien, <span style={{ color: "var(--magenta)", fontWeight: 600 }}>mañana lo hagamos aún mejor</span>.
                  </p>
                </div>

                <div
                  className="inline-block px-6 py-3 rounded-lg font-semibold text-sm"
                  style={{ background: "linear-gradient(135deg, rgba(0,212,212,0.15), rgba(255,45,155,0.15))", border: "1px solid rgba(255,255,255,0.1)", color: "#fff" }}
                >
                  ¡Les deseamos un excelente trayecto académico!
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ── PROYECTOS ── */}
        {active === "proyectos" && (
          <section className="max-w-5xl mx-auto px-6 py-20">
            <div className="mb-14">
              <p className="text-xs uppercase tracking-widest mb-2" style={{ color: "var(--cyan)" }}>Investigación y Docencia</p>
              <h2 className="section-title gradient-text">Proyectos</h2>
            </div>

            <div
              className="rounded-2xl overflow-hidden mb-10"
              style={{ backgroundColor: "var(--bg-card)", border: "1px solid rgba(0,212,212,0.25)" }}
            >
              {/* Header banner */}
              <div
                className="px-8 py-6"
                style={{ background: "linear-gradient(135deg, rgba(0,212,212,0.15) 0%, rgba(255,45,155,0.12) 100%)", borderBottom: "1px solid rgba(0,212,212,0.2)" }}
              >
                <div className="flex flex-wrap items-start gap-4">
                  <div style={{ color: "var(--cyan)", marginTop: 4 }}>
                    <IconPaw size={36} color="var(--cyan)" />
                  </div>
                  <div>
                    <span
                      className="inline-block text-xs px-3 py-1 rounded-full font-semibold uppercase tracking-widest mb-2"
                      style={{ backgroundColor: "rgba(0,212,212,0.15)", color: "var(--cyan)", border: "1px solid rgba(0,212,212,0.3)" }}
                    >
                      Asignatura Optativa — Plan 2018
                    </span>
                    <h3 className="font-display text-2xl md:text-3xl tracking-wide" style={{ color: "#fff" }}>
                      Derecho de los Animales<br className="hidden sm:block" /> No Humanos
                    </h3>
                    <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
                      Facultad de Derecho y Ciencias Sociales — UNT · Bloque III, IV y V
                    </p>
                  </div>
                </div>
              </div>

              {/* Body */}
              <div className="px-8 py-8">
                <p className="mb-8 text-base" style={{ color: "var(--text-secondary)", lineHeight: 1.85 }}>
                  Uno de los principales proyectos académicos e institucionales impulsados por la comisión fue la creación de esta materia optativa perteneciente al <span style={{ color: "var(--cyan)", fontWeight: 600 }}>Plan de Estudios 2018</span> de la carrera de Abogacía en la Facultad de Derecho y Ciencias Sociales (UNT).
                </p>

                <p className="text-xs font-semibold uppercase tracking-widest mb-6" style={{ color: "var(--magenta)" }}>
                  Trayectoria y Proceso de Institucionalización
                </p>

                <div className="relative">
                  <div
                    className="absolute left-5 top-2 bottom-2 w-px hidden sm:block"
                    style={{ background: "linear-gradient(180deg, var(--cyan), var(--magenta))" }}
                  />

                  <div className="space-y-6">
                    {timelineSteps.map((step) => {
                      const StepIcon = ICONS[step.icon] || IconBulb;
                      return (
                      <div key={step.id} className="sm:pl-14 relative flex flex-col sm:flex-row gap-4 sm:gap-0">
                        <div
                          className="hidden sm:flex absolute left-0 w-10 h-10 rounded-full items-center justify-center shrink-0"
                          style={{
                            backgroundColor: step.color === "cyan" ? "rgba(0,212,212,0.15)" : "rgba(255,45,155,0.15)",
                            border: `1.5px solid ${step.color === "cyan" ? "rgba(0,212,212,0.5)" : "rgba(255,45,155,0.5)"}`,
                            zIndex: 1,
                          }}
                        >
                          <StepIcon size={18} color={step.color === "cyan" ? "var(--cyan)" : "var(--magenta)"} />
                        </div>

                        <div
                          className="flex-1 rounded-xl p-5"
                          style={{
                            backgroundColor: step.color === "cyan" ? "rgba(0,212,212,0.05)" : "rgba(255,45,155,0.05)",
                            border: `1px solid ${step.color === "cyan" ? "rgba(0,212,212,0.15)" : "rgba(255,45,155,0.15)"}`,
                          }}
                        >
                          <div className="flex flex-wrap items-center gap-3 mb-2">
                            <div className="sm:hidden">
                              <StepIcon size={18} color={step.color === "cyan" ? "var(--cyan)" : "var(--magenta)"} />
                            </div>
                            <h4 className="font-semibold text-sm" style={{ color: step.color === "cyan" ? "var(--cyan)" : "var(--magenta)" }}>
                              {step.title}
                            </h4>
                            {step.badge && (
                              <span
                                className="text-xs px-2 py-0.5 rounded font-mono"
                                style={{
                                  backgroundColor: step.color === "cyan" ? "rgba(0,212,212,0.12)" : "rgba(255,45,155,0.12)",
                                  color: step.color === "cyan" ? "var(--cyan)" : "var(--magenta)",
                                }}
                              >
                                {step.badge}
                              </span>
                            )}
                          </div>
                          <p className="text-sm" style={{ color: "var(--text-secondary)", lineHeight: 1.8 }}>{step.text}</p>
                        </div>
                      </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ── LINKS ── */}
        {active === "links" && (
          <section className="max-w-5xl mx-auto px-6 py-20">
            <div className="mb-14">
              <p className="text-xs uppercase tracking-widest mb-2" style={{ color: "var(--magenta)" }}>Recursos</p>
              <h2 className="section-title gradient-text">Links Útiles</h2>
              <p className="mt-4 max-w-xl" style={{ color: "var(--text-muted)", lineHeight: 1.8 }}>
                Accesos directos a plataformas, materiales y canales de comunicación de la cátedra.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              {links.map((link, i) => {
                const LinkIcon = ICONS[link.icon] || IconDoc;
                return (
                <a
                  key={link.id}
                  href={link.url}
                  className="card-hover flex items-start gap-4 p-5 rounded-lg group"
                  style={{
                    backgroundColor: "var(--bg-card)",
                    border: `1px solid ${i % 2 === 0 ? "rgba(0,212,212,0.18)" : "rgba(255,45,155,0.18)"}`,
                    textDecoration: "none",
                  }}
                >
                  <div
                    className="w-10 h-10 flex items-center justify-center rounded shrink-0"
                    style={{ backgroundColor: i % 2 === 0 ? "rgba(0,212,212,0.1)" : "rgba(255,45,155,0.1)" }}
                  >
                    <LinkIcon size={18} color={i % 2 === 0 ? "var(--cyan)" : "var(--magenta)"} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div
                      className="font-semibold text-sm mb-1"
                      style={{ color: i % 2 === 0 ? "var(--cyan)" : "var(--magenta)" }}
                    >
                      {link.label}
                    </div>
                    <div className="text-xs leading-relaxed" style={{ color: "var(--text-muted)" }}>
                      {link.desc}
                    </div>
                  </div>
                  <div className="shrink-0 opacity-40 group-hover:opacity-80 transition-opacity mt-0.5" style={{ color: i % 2 === 0 ? "var(--cyan)" : "var(--magenta)" }}>
                    <IconArrow size={15} color={i % 2 === 0 ? "var(--cyan)" : "var(--magenta)"} />
                  </div>
                </a>
                );
              })}
            </div>
          </section>
        )}
      </main>

      <footer
        className="mt-auto border-t py-8 text-center"
        style={{ borderColor: "rgba(255,45,155,0.15)", backgroundColor: "rgba(10,10,15,0.8)" }}
      >
        <p className="font-display tracking-widest text-sm" style={{ color: "var(--text-muted)" }}>
          COMISIÓN 4 — TEORÍA DEL DERECHO Y LA JUSTICIA "B" — 2026
        </p>
      </footer>
    </div>
  );
}
