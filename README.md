# Backend — Comisión 4 (Teoría del Derecho y la Justicia "B")

API + panel de administración para editar docentes, auxiliares, links y la
línea de tiempo del sitio sin tocar código.

## 1. Instalar dependencias

```bash
cd server
npm install
```

## 2. Configurar el secreto de sesión

```bash
cp .env.example .env
```

Editá `.env` y poné un `JWT_SECRET` largo y aleatorio (podés generarlo con
`node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`).
Si no lo hacés, el servidor arranca igual pero **cada reinicio cierra la
sesión de todos los admins**.

## 3. Crear el usuario administrador

La primera vez no hay ningún admin creado. Corré:

```bash
npm run create-admin -- <usuario> <contraseña>
```

Ejemplo:

```bash
npm run create-admin -- comision4 "una-contraseña-larga-y-segura"
```

Podés volver a correr este comando cuando quieras para cambiar la contraseña.

## 4. Levantar el servidor

```bash
npm start
```

Por defecto queda escuchando en `http://localhost:4000`.

## 5. Desarrollo (frontend + backend juntos)

- Backend: `npm run dev` (dentro de `server/`, con auto-reload).
- Frontend: `npm run dev` (en la raíz del proyecto). Ya está configurado para
  redirigir las llamadas a `/api` hacia `http://localhost:4000`.

Entrá a `http://localhost:8443/admin` (o el puerto que use Vite) para
loguearte con el usuario que creaste en el paso 3.

## 6. Producción (un solo servidor)

```bash
# en la raíz del proyecto
npm run build

# en server/
npm start
```

El backend sirve automáticamente el sitio ya compilado (`../dist`), incluida
la ruta `/admin`. No hace falta ningún servidor web aparte.

## Cómo funciona

- Los datos se guardan en `server/data/db.json` (se crea solo). Es un único
  archivo de texto: para respaldarlo alcanza con copiarlo.
- El sitio público (`/api/content`) es de lectura libre, sin login.
- Todo lo que modifica datos (`/api/admin/...`) requiere haber iniciado
  sesión en `/admin`, que guarda un token por 12 horas.
- Si en algún momento te olvidás la contraseña, volvé a correr
  `npm run create-admin -- <usuario> <contraseña-nueva>` directamente en el
  servidor.
