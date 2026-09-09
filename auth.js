import jwt from "jsonwebtoken";

// En producción SIEMPRE definí JWT_SECRET en el .env (ver .env.example).
// Este valor por defecto solo evita que el server explote en desarrollo,
// pero cambia en cada reinicio: no lo uses para nada real.
const FALLBACK_SECRET = "dev-secret-cambiar-en-.env-" + Math.random().toString(36).slice(2);
export const JWT_SECRET = process.env.JWT_SECRET || FALLBACK_SECRET;

if (!process.env.JWT_SECRET) {
  console.warn(
    "⚠️  JWT_SECRET no está definido en .env — usando un secreto temporal.\n" +
      "   Las sesiones de admin se cerrarán cada vez que reinicies el servidor.\n" +
      "   Copiá server/.env.example a server/.env y definí uno fijo."
  );
}

export function signToken(username) {
  return jwt.sign({ username }, JWT_SECRET, { expiresIn: "12h" });
}

export function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ error: "No autorizado. Iniciá sesión en /admin." });
  }

  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: "Sesión inválida o expirada. Volvé a iniciar sesión." });
  }
}
