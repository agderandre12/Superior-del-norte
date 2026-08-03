# Buenas Prácticas y Reglas de Desarrollo — Instituto Superior del Norte LMS

Reglas que **todos los desarrolladores (humanos y agentes) deben cumplir**.
Leerlo antes de cualquier cambio.

---

## 1. Principios de diseño

- **KISS:** priorizar la solución directa y legible sobre abstracciones extra.
- **DRY:** la lógica de negocio (cálculo de progreso, validación de roles) vive en
  un único punto. No duplicar bloques entre controladores.
- **Responsabilidad única:** funciones pequeñas; componentes que no mezclan red
  con presentación.
- **Separación estado/presentación:** las llamadas de red van en `AppContext.tsx`
  (o custom hooks). Los componentes de vista reciben datos y llaman funciones del
  contexto; no hacen `fetch` directamente.

---

## 2. Reglas críticas del frontend (React)

### Regla #1 — Nunca usar `setCurrentView` para navegar
La navegación se hace exclusivamente con `useNavigate()`. `setCurrentView` es
estado legacy por compatibilidad.

```tsx
// ✅ CORRECTO
const navigate = useNavigate();
navigate('/dashboard');

// ❌ INCORRECTO
setCurrentView('dashboard'); // No hace routing real
```

### Regla #2 — Dependencias primitivas en useEffect
```tsx
// ✅ CORRECTO — user?.cedula y user?.rol son strings
useEffect(() => {
  if (token && user?.rol === 'estudiante') fetchStudentCourses();
}, [token, user?.cedula, user?.rol, fetchStudentCourses]);

// ❌ INCORRECTO — user es objeto nuevo en cada render = loop infinito
useEffect(() => {
  if (token && user) fetchStudentCourses();
}, [token, user]);
```

### Regla #3 — Estabilizar fetch functions con useCallback
```tsx
const fetchStudentCourses = useCallback(async () => {
  // ...
}, [token]); // token es primitivo → referencia estable
```

### Regla #4 — Nunca re-inicializar user desde un useEffect([token])
`user` se inicializa sincrónicamente con lazy `useState`. No agregar un
`useEffect([token])` que llame `setUser()` (crea nuevo objeto en cada ejecución
→ loop).

### Regla #5 — No llamar fetchStudentCourses en useEffect de componentes
`AppContext` ya lo llama al inicializar la sesión. No replicarlo en el `useEffect`
de un componente (duplica peticiones en cada montaje).

### Regla #6 — No mover el bridge de hash legacy a un efecto
La normalización de `#verify=CÓDIGO` / `#admin` vive en `main.tsx`, **antes** de
montar el router. Hacerlo en un `useEffect` de `App.tsx` es racy: la ruta comodín
`*` reescribe el hash a `#/` durante el primer render antes de que el efecto lo
lea. (Ver la corrección histórica en [contexto-sistema.md](contexto-sistema.md).)

---

## 3. Estándares de código

### Backend (Node.js + Express)
- `camelCase` para variables/funciones. `snake_case` para columnas SQL y rutas.
- Éxito: `{ success: true, data: {...} }` con HTTP 200/201.
- Error: `{ success: false, error: { code, message } }` con HTTP 4xx/5xx.
  (Algunos endpoints legacy — login, verify público — devuelven formas más planas
  por compatibilidad; ver [api.md](api.md).)
- Nunca exponer stack traces de BD en producción (lo maneja `errorHandler.js`).
- Endpoints de admin: siempre `authenticateToken` + `requireAdmin`.

### Backend — Regla de BD (CRÍTICA)
- **NUNCA** `DROP TABLE IF EXISTS` en `setupSqliteDB()`. `CREATE TABLE IF NOT EXISTS`.
- Seeding con `INSERT OR IGNORE` (idempotente, no destruye datos).

### Backend — Patrón fire-and-forget para emails
```js
// ✅ CORRECTO — no bloquea la respuesta HTTP
sendWelcomeEmail(studentData).catch((err) => {
  console.error('[controller] Error de email:', err.message);
});
// ❌ INCORRECTO — si SMTP falla, el endpoint retorna 500
await sendWelcomeEmail(studentData);
```

### Frontend (React + CSS)
- Estilos globales en `index.css` con tokens CSS (`:root`). Evitar estilos en
  línea salvo propiedades dinámicas (ancho de barra de progreso, etc.).
- Si un bloque JSX se repite más de 2 veces, extraerlo a `/components/ui/`.
- Toda llamada de red va en `AppContext.tsx` o un servicio dedicado.
- **Identidad visual:**
  - *Azul predominante:* `--isn-blue` `#0F2C59` como color principal (el naranja
    queda prohibido).
  - *Dorado sutil:* `--isn-gold` `#D4AF37` para microinteracciones y bordes activos.
  - *Verde de acento:* `#10B981` **exclusivo** para el botón "Ver programas
    académicos" en la landing.
  - *Base neutral:* fondos blancos y claros (`#F7F9FA`).
  - *Botones "grounded pill":* `border-radius: 9999px`, sin bordes; jerarquía por
    relleno.
  - *Estructura orgánica:* sombras suaves (`box-shadow: var(--shadow-card)`) y
    radios fluidos (`20px`/`24px`) en paneles principales.

---

## 4. Seguridad

### Integridad del examen
1. **Validación de requisitos en servidor:** el backend bloquea el examen si el
   progreso no es 100% en BD (calculado por número de módulos del curso).
2. **Respuestas correctas ocultas:** `/api/exam/questions` hace `SELECT` sin
   `respuesta_correcta`. El campo nunca llega al cliente.
3. **Calificación en backend:** el cliente sólo envía `{ preguntaId: 'A', ... }`;
   el backend consulta `preguntas` y calcula el puntaje.
4. **Cooldown:** tras 3 intentos fallidos, esperar 10 min (`fecha_ultimo_intento`).

### Aislamiento de datos por rol
- Un `estudiante` sólo consulta sus propios datos (cédula del JWT en
  `req.user.cedula`). Acceso a datos ajenos → `HTTP 403`.
  > ⚠️ Excepción conocida (brecha IDOR P0): las rutas de curso confían en
  > `?courseId=` sin validar matrícula. Ver [contexto-sistema.md](contexto-sistema.md).
- Contraseñas con `bcryptjs` (≥10 saltos). Nunca texto plano en BD.
- **Política de contraseña:** `POST /api/auth/register` exige ≥8 chars con al
  menos una letra y un número.
- **Rate limiting:** `/auth/login`, `/auth/register` (10/min/IP) y
  `/certificate/verify` (30/min/IP). Detrás de proxy, configurar `TRUST_PROXY_HOPS`.

### Verificación de certificados
- El código se valida contra el regex `^[A-Za-z0-9]{3,5}-[A-Za-z0-9]{3,6}-[A-Za-z0-9]{3,6}$`
  (máx 50 chars) y se **normaliza a mayúsculas** antes de la búsqueda en BD.
- El endpoint público sólo devuelve campos públicos (nombre, cédula, curso,
  fecha, calificación, número y código). No exponer columnas internas.
- El frontend **nunca** debe inventar valores fallback (`|| 100`,
  `|| 'AS-2026-0001'`) en la pantalla de verificación.

### Emails con credenciales
- **Por defecto (`EMAIL_INCLUDE_PASSWORD` off):** el email de bienvenida **NO**
  incluye la contraseña — sólo la cédula y aviso de canal seguro (OWASP A02:2021).
- La contraseña se hashea antes de cualquier envío; el texto plano nunca se persiste.

### Sanitización de HTML (XSS) — OBLIGATORIO
- Todo HTML del backend (plantillas `certificado_template`, contenido de módulos
  `data_contenido`) inyectado vía `dangerouslySetInnerHTML` **debe** pasar por
  `sanitizeHtml()` (`utils/sanitize.ts`, DOMPurify). Previene XSS almacenado y el
  robo de JWT desde `localStorage`.
- Regla paralela en backend: `interpolateTemplate` interpola en HTML crudo —
  escapar los valores o migrar a un motor con auto-escaping.

### Gestión del JWT_SECRET
- El servidor **se niega a arrancar** si `JWT_SECRET` falta, es un placeholder
  conocido o mide < 32 caracteres.
- Generar con: `node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"`.
- El secreto **no se exporta** desde `middleware/auth.js`; la firma está
  centralizada en `signToken()`.
- ⚠️ **Deuda activa:** el `.env` actual usa el placeholder de ejemplo (pasa la
  validación por longitud pero es público). Regenerar antes de producción.

---

## 5. Brechas de buenas prácticas pendientes

> [!WARNING]
> 1. **Mojibake como parche:** `decodeMojibake` (frontend) y `normalizeToUtf8`
>    (backend) son sintomáticos. Causa raíz: encoding de la conexión SQLite.
>    Requiere `pragma encoding = 'UTF-8'` y retirar los helpers.
> 2. **Validación de payloads débil:** no se valida el esquema completo de los
>    cuerpos (crear usuario, enviar examen). Integrar `zod`.
> 3. **Inline styles masivos:** migrar progresivamente a clases CSS en `index.css`.
> 4. **JWT en `localStorage`:** migrar a cookie `HttpOnly; Secure; SameSite=Strict`.
> 5. **Verificación IDOR de matrícula:** falta `requireEnrollment` en rutas de
>    estudiante.
