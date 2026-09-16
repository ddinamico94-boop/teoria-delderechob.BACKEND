import { useEffect, useState, type FormEvent } from "react";
import { ICON_OPTIONS } from "../icons";
import "./admin.css";

const TOKEN_KEY = "catedra_admin_token";

type FieldType = "text" | "textarea" | "select";
type FieldConfig = {
  key: string;
  label: string;
  type: FieldType;
  options?: { key: string; label: string }[];
  optional?: boolean;
};

type Item = { id: string; [key: string]: string };

const COLLECTION_FIELDS: Record<string, FieldConfig[]> = {
  docentes: [
    { key: "name", label: "Nombre completo", type: "text" },
    { key: "role", label: "Rol / cargo", type: "text" },
  ],
  auxiliares: [{ key: "name", label: "Nombre completo", type: "text" }],
  links: [
    { key: "label", label: "Título del link", type: "text" },
    { key: "url", label: "URL", type: "text" },
    { key: "desc", label: "Descripción breve", type: "text" },
    { key: "icon", label: "Ícono", type: "select", options: ICON_OPTIONS },
  ],
  timeline: [
    { key: "title", label: "Título del hito", type: "text" },
    { key: "text", label: "Descripción", type: "textarea" },
    { key: "badge", label: "Etiqueta (opcional, ej. un N° de resolución)", type: "text", optional: true },
    {
      key: "color",
      label: "Color",
      type: "select",
      options: [
        { key: "cyan", label: "Cian" },
        { key: "magenta", label: "Magenta" },
      ],
    },
    { key: "icon", label: "Ícono", type: "select", options: ICON_OPTIONS },
  ],
};

const TABS: { key: string; label: string }[] = [
  { key: "docentes", label: "Cuerpo Docente" },
  { key: "auxiliares", label: "Auxiliares" },
  { key: "links", label: "Links" },
  { key: "timeline", label: "Proyectos (línea de tiempo)" },
];

function emptyDraft(fields: FieldConfig[]): Record<string, string> {
  const d: Record<string, string> = {};
  for (const f of fields) d[f.key] = f.type === "select" ? f.options?.[0]?.key ?? "" : "";
  return d;
}

async function apiFetch(path: string, token: string | null, options: RequestInit = {}) {
  const res = await fetch(path, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Error ${res.status}`);
  return data;
}

// ── Login ────────────────────────────────────────────────────────────────

function Login({ onLogin }: { onLogin: (token: string) => void }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const data = await apiFetch("/api/admin/login", null, {
        method: "POST",
        body: JSON.stringify({ username, password }),
      });
      onLogin(data.token);
    } catch (err: any) {
      setError(err.message || "No se pudo iniciar sesión.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-wrap">
      <form className="admin-card admin-login-card" onSubmit={submit}>
        <h1 className="admin-title">Panel de administración</h1>
        <p className="admin-subtitle">Comisión 4 — Teoría del Derecho y la Justicia "B"</p>

        <label className="admin-label">Usuario</label>
        <input className="admin-input" value={username} onChange={(e) => setUsername(e.target.value)} autoFocus />

        <label className="admin-label">Contraseña</label>
        <input className="admin-input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />

        {error && <p className="admin-error">{error}</p>}

        <button className="admin-btn-primary" type="submit" disabled={loading}>
          {loading ? "Ingresando..." : "Ingresar"}
        </button>

        <a className="admin-back-link" href="/">
          ← Volver al sitio
        </a>
      </form>
    </div>
  );
}

// ── Editor genérico de una colección ────────────────────────────────────

function CollectionEditor({
  collection,
  fields,
  items,
  token,
  onChanged,
}: {
  collection: string;
  fields: FieldConfig[];
  items: Item[];
  token: string;
  onChanged: () => void;
}) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<Record<string, string>>({});
  const [newDraft, setNewDraft] = useState<Record<string, string>>(emptyDraft(fields));
  const [adding, setAdding] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startEdit = (item: Item) => {
    setEditingId(item.id);
    setEditDraft(Object.fromEntries(fields.map((f) => [f.key, item[f.key] || ""])));
    setError(null);
  };

  const saveEdit = async (id: string) => {
    setBusy(true);
    setError(null);
    try {
      await apiFetch(`/api/admin/${collection}/${id}`, token, {
        method: "PUT",
        body: JSON.stringify(editDraft),
      });
      setEditingId(null);
      onChanged();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const remove = async (id: string) => {
    if (!confirm("¿Borrar este elemento? No se puede deshacer.")) return;
    setBusy(true);
    setError(null);
    try {
      await apiFetch(`/api/admin/${collection}/${id}`, token, { method: "DELETE" });
      onChanged();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const addNew = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const payload = { ...newDraft };
      await apiFetch(`/api/admin/${collection}`, token, {
        method: "POST",
        body: JSON.stringify(payload),
      });
      setNewDraft(emptyDraft(fields));
      setAdding(false);
      onChanged();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const renderField = (f: FieldConfig, value: string, onChange: (v: string) => void) => {
    if (f.type === "textarea") {
      return <textarea className="admin-input" rows={4} value={value} onChange={(e) => onChange(e.target.value)} />;
    }
    if (f.type === "select") {
      return (
        <select className="admin-input" value={value} onChange={(e) => onChange(e.target.value)}>
          {f.options?.map((o) => (
            <option key={o.key} value={o.key}>
              {o.label}
            </option>
          ))}
        </select>
      );
    }
    return <input className="admin-input" value={value} onChange={(e) => onChange(e.target.value)} />;
  };

  return (
    <div>
      {error && <p className="admin-error">{error}</p>}

      <div className="admin-list">
        {items.map((item) => (
          <div className="admin-card admin-row" key={item.id}>
            {editingId === item.id ? (
              <div className="admin-row-form">
                {fields.map((f) => (
                  <div key={f.key} className="admin-field">
                    <label className="admin-label">{f.label}</label>
                    {renderField(f, editDraft[f.key] ?? "", (v) => setEditDraft((d) => ({ ...d, [f.key]: v })))}
                  </div>
                ))}
                <div className="admin-row-actions">
                  <button className="admin-btn-primary" disabled={busy} onClick={() => saveEdit(item.id)}>
                    Guardar
                  </button>
                  <button className="admin-btn-ghost" disabled={busy} onClick={() => setEditingId(null)}>
                    Cancelar
                  </button>
                </div>
              </div>
            ) : (
              <div className="admin-row-view">
                <div className="admin-row-text">
                  {fields.map((f) => (
                    <div key={f.key} className="admin-row-field">
                      <span className="admin-row-field-label">{f.label}: </span>
                      <span>{item[f.key] || <em>—</em>}</span>
                    </div>
                  ))}
                </div>
                <div className="admin-row-actions">
                  <button className="admin-btn-ghost" onClick={() => startEdit(item)}>
                    Editar
                  </button>
                  <button className="admin-btn-danger" disabled={busy} onClick={() => remove(item.id)}>
                    Borrar
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
        {items.length === 0 && <p className="admin-subtitle">Todavía no hay elementos cargados.</p>}
      </div>

      {adding ? (
        <form className="admin-card admin-row-form" onSubmit={addNew}>
          {fields.map((f) => (
            <div key={f.key} className="admin-field">
              <label className="admin-label">{f.label}</label>
              {renderField(f, newDraft[f.key] ?? "", (v) => setNewDraft((d) => ({ ...d, [f.key]: v })))}
            </div>
          ))}
          <div className="admin-row-actions">
            <button className="admin-btn-primary" type="submit" disabled={busy}>
              Agregar
            </button>
            <button className="admin-btn-ghost" type="button" onClick={() => setAdding(false)} disabled={busy}>
              Cancelar
            </button>
          </div>
        </form>
      ) : (
        <button className="admin-btn-primary admin-add-btn" onClick={() => setAdding(true)}>
          + Agregar {TABS.find((t) => t.key === collection)?.label.toLowerCase()}
        </button>
      )}
    </div>
  );
}

// ── Cambio de contraseña ─────────────────────────────────────────────────

function ChangePassword({ token }: { token: string }) {
  const [newPassword, setNewPassword] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setMsg(null);
    setBusy(true);
    try {
      await apiFetch("/api/admin/change-password", token, {
        method: "POST",
        body: JSON.stringify({ newPassword }),
      });
      setMsg("Contraseña actualizada correctamente.");
      setNewPassword("");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <form className="admin-card admin-row-form" onSubmit={submit}>
      <div className="admin-field">
        <label className="admin-label">Nueva contraseña (mínimo 6 caracteres)</label>
        <input
          className="admin-input"
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />
      </div>
      {msg && <p className="admin-success">{msg}</p>}
      {error && <p className="admin-error">{error}</p>}
      <div className="admin-row-actions">
        <button className="admin-btn-primary" type="submit" disabled={busy}>
          Cambiar contraseña
        </button>
      </div>
    </form>
  );
}

// ── App principal del panel ──────────────────────────────────────────────

type Content = {
  docentes: Item[];
  auxiliares: Item[];
  links: Item[];
  timeline: Item[];
};

export default function AdminApp() {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY));
  const [checking, setChecking] = useState(true);
  const [content, setContent] = useState<Content | null>(null);
  const [tab, setTab] = useState("docentes");
  const [showPassword, setShowPassword] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Verifica el token guardado al entrar.
  useEffect(() => {
    if (!token) {
      setChecking(false);
      return;
    }
    apiFetch("/api/admin/me", token)
      .then(() => setChecking(false))
      .catch(() => {
        localStorage.removeItem(TOKEN_KEY);
        setToken(null);
        setChecking(false);
      });
  }, [token]);

  const loadContent = () => {
    if (!token) return;
    apiFetch("/api/admin/content", token)
      .then((data) => {
        setContent(data);
        setLoadError(null);
      })
      .catch((err) => setLoadError(err.message));
  };

  useEffect(() => {
    if (token && !checking) loadContent();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, checking]);

  const handleLogin = (t: string) => {
    localStorage.setItem(TOKEN_KEY, t);
    setToken(t);
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setContent(null);
  };

  if (checking) return <div className="admin-shell admin-center">Cargando…</div>;
  if (!token) return <Login onLogin={handleLogin} />;

  return (
    <div className="admin-shell">
      <header className="admin-header">
        <div>
          <h1 className="admin-title admin-title-sm">Panel de administración</h1>
          <p className="admin-subtitle">Comisión 4 — Teoría del Derecho y la Justicia "B"</p>
        </div>
        <div className="admin-header-actions">
          <a className="admin-back-link" href="/">
            Ver sitio
          </a>
          <button className="admin-btn-ghost" onClick={() => setShowPassword((s) => !s)}>
            Contraseña
          </button>
          <button className="admin-btn-danger" onClick={logout}>
            Salir
          </button>
        </div>
      </header>

      {showPassword && (
        <div className="admin-section">
          <ChangePassword token={token} />
        </div>
      )}

      <nav className="admin-tabs">
        {TABS.map((t) => (
          <button key={t.key} className={`admin-tab ${tab === t.key ? "active" : ""}`} onClick={() => setTab(t.key)}>
            {t.label}
          </button>
        ))}
      </nav>

      <main className="admin-section">
        {loadError && <p className="admin-error">{loadError}</p>}
        {!content && !loadError && <p className="admin-subtitle">Cargando contenido…</p>}
        {content && (
          <CollectionEditor
            collection={tab}
            fields={COLLECTION_FIELDS[tab]}
            items={content[tab as keyof Content]}
            token={token}
            onChanged={loadContent}
          />
        )}
      </main>
    </div>
  );
}
