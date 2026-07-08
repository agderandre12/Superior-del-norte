# Buenas Prácticas y Reglas de Desarrollo - Instituto Superior del Norte LMS

Este documento establece las reglas de desarrollo que **todos los agentes y desarrolladores deben cumplir rigurosamente**. Leerlo antes de realizar cualquier cambio.

---

## 1. Principios de Diseño

- **KISS:** Si hay una solución directa y legible, darle prioridad sobre abstracciones adicionales.
- **DRY:** La lógica de negocio (cálculo de progreso, validación de roles) debe residir en un único punto. No duplicar bloques similares en distintos controladores.
- **Responsabilidad Única:** Funciones pequeñas con una sola tarea. Componentes que no mezclan lógica de red con lógica de presentación.
- **Separación Estado/Presentación:** Las llamadas de red van en `AppContext.jsx` (o futuros custom hooks). Los componentes de vista reciben datos y llaman funciones del contexto, pero no hacen `fetch` directamente.

---

## 2. Reglas Críticas del Frontend (React)

### Regla #1 — Nunca usar `setCurrentView` para navegar
La navegación se realiza exclusivamente con `useNavigate()` de `react-router-dom`. `setCurrentView` es estado legacy mantenido por compatibilidad.

```jsx
// ✅ CORRECTO
const navigate = useNavigate();
navigate('/dashboard');

// ❌ INCORRECTO
setCurrentView('dashboard'); // No hace routing real
```

### Regla #2 — Dependencias primitivas en useEffect
Cuando un `useEffect` depende de un objeto del estado (como `user`), usar sus propiedades primitivas como dependencias, no el objeto completo.

```jsx
// ✅ CORRECTO — user?.cedula y user?.rol son strings (primitivos)
useEffect(() => {
  if (token && user?.rol === 'estudiante') fetchStudentCourses();
}, [token, user?.cedula, user?.rol, fetchStudentCourses]);

// ❌ INCORRECTO — user es un objeto nuevo en cada render = loop infinito
useEffect(() => {
  if (token && user) fetchStudentCourses();
}, [token, user]);
```

### Regla #3 — Estabilizar fetch functions con useCallback
Las funciones de fetch en `AppContext.jsx` se declaran con `useCallback` para que su referencia sea estable entre renders. Esto permite incluirlas en deps de `useEffect` sin disparar loops.

```jsx
// ✅ CORRECTO
const fetchStudentCourses = useCallback(async () => {
  // ...
}, [token]); // token es string (primitivo) → referencia estable
```

### Regla #4 — Nunca re-inicializar user desde un useEffect([token])
El `user` se inicializa sincrónicamente con lazy `useState`. No agregar un `useEffect([token])` que llame `setUser()`, ya que crea un nuevo objeto en cada ejecución y dispara el loop de deps.

```jsx
// ✅ CORRECTO — inicialización sincrónica, corre una sola vez
const [user, setUser] = useState(() => {
  const token = localStorage.getItem('token');
  if (token) {
    const payload = decodeJWTPayload(token);
    return payload ? { cedula: payload.cedula, ... } : null;
  }
  return null;
});

// ❌ INCORRECTO — crea nuevo objeto user en cada render con token
useEffect(() => {
  if (token) {
    const payload = decodeJWTPayload(token);
    setUser({ cedula: payload.cedula, ... }); // Dispara re-render → loop
  }
}, [token]);
```

### Regla #5 — No llamar fetchStudentCourses en useEffect de componentes
`AppContext` ya llama `fetchStudentCourses()` al inicializar la sesión. Los componentes no deben replicar esta llamada en su propio `useEffect` (causa duplicación de peticiones en cada montaje).

```jsx
// ❌ INCORRECTO en Dashboard.jsx — llamada duplicada en cada montaje
useEffect(() => {
  fetchStudentCourses(); // AppContext ya lo hizo
}, []);
```

---

## 3. Estándares de Código

### Backend (Node.js + Express)
- `camelCase` para variables y funciones. `snake_case` para columnas SQL y rutas de API.
- Respuesta exitosa: `{ success: true, data: {...} }` con HTTP 200/201.
- Error: `{ success: false, error: { code: 'CODIGO', message: '...' } }` con HTTP 4xx/5xx.
- Nunca exponer stack traces de BD en producción (el `errorHandler.js` centralizado lo maneja).
- Todos los endpoints de admin requieren los dos middlewares: `authenticateToken` + `requireAdmin`.

### Backend — Regla de BD (CRÍTICA)
- **NUNCA** usar `DROP TABLE IF EXISTS` en `setupSqliteDB()`. Las tablas se crean con `CREATE TABLE IF NOT EXISTS`.
- Todo seeding usa `INSERT OR IGNORE` para ser idempotente y no destruir datos existentes en cada arranque.

### Backend — Patrón Fire-and-Forget para Emails
Los emails se disparan sin `await` para no bloquear la respuesta HTTP. Siempre encadenar `.catch()` para loguear errores sin propagar excepciones.

```js
// ✅ CORRECTO — no bloquea la respuesta HTTP
sendWelcomeEmail(studentData).catch((err) => {
  console.error('[controller] Error de email:', err.message);
});

// ❌ INCORRECTO — si el servidor SMTP falla, el endpoint retorna 500
await sendWelcomeEmail(studentData);
```

### Frontend (React + CSS)
- Estilos globales en `index.css` con tokens CSS (`:root`). Evitar estilos en línea salvo propiedades dinámicas (ancho de barra de progreso, etc.).
- Si un bloque JSX se repite más de 2 veces, extraerlo a un componente en `/components/ui/`.
- Toda llamada de red va en `AppContext.jsx` o en un servicio dedicado, nunca con `fetch` crudo en el cuerpo de un componente de vista.
- **Sistema de Identidad Visual (Modernización UI/UX)**:
  * **Paleta de Colores**:
    - *Azul Predominante*: Usar Azul Corporativo (`--isn-blue`, `#0F2C59`) como color principal. El naranja queda prohibido.
    - *Dorado Sutil*: Dorado Premium (`--isn-gold`, `#D4AF37`) para microinteracciones, bordes activos muy delgados, e iconos destacados.
    - *Verde de Acento Exclusivo*: Verde Esmeralda (`#10B981`) **exclusiva y únicamente** para el botón de "Ver programas académicos" en la Landing Page.
    - *Base Neutral*: Fondos blancos y neutros claros (`#F7F9FA`) para priorizar el espacio en blanco y la legibilidad.
  * **Botones Grounded Pill**: Todos los botones de acción deben tener forma de píldora completamente redondeada (`border-radius: 9999px`) sin bordes ni trazos de contorno rígidos. La jerarquía se determina únicamente con el relleno.
  * **Estructura Orgánica (Adiós a la Card Fatigue)**: Reemplazar bordes duros y líneas divisorias por espacios en blanco, variaciones de color de fondo y sombras suaves y difuminadas (`box-shadow: var(--shadow-card)`). Las esquinas de los paneles principales deben usar radios fluidos (`border-radius: 20px` o `24px`).

---

## 4. Seguridad

### Integridad del Examen
1. **Validación de requisitos en servidor:** El backend bloquea el acceso al examen si el progreso del estudiante no es 100% en DB (calculado dinámicamente por número de módulos del curso).
2. **Respuestas correctas ocultas:** El endpoint `/api/exam/questions` usa `SELECT` sin columna `respuesta_correcta`. El campo nunca llega al cliente.
3. **Calificación en backend:** El cliente solo envía `{ preguntaId: 'A', ... }`. El backend consulta `preguntas` en BD y calcula el puntaje.
4. **Control de intentos con cooldown:** Registrado en tabla `examenes`. Tras 3 intentos fallidos, el estudiante debe esperar 10 minutos (`fecha_ultimo_intento` + cooldown).

### Aislamiento de Datos por Rol
- Un `estudiante` solo puede consultar sus propios datos (cédula extraída del JWT en `req.user.cedula`). Cualquier intento de acceso a datos de otro usuario → `HTTP 403`.
- Contraseñas hasheadas con `bcryptjs` (mínimo 10 saltos). Nunca texto plano en BD.
- **Política de contraseña:** `POST /api/auth/register` exige mínimo 8 caracteres con al menos una letra y un número (`PASSWORD_POLICY`).
- **Rate limiting:** `/auth/login`, `/auth/register` (10/min/IP) y `/certificate/verify` (30/min/IP) para mitigar fuerza bruta y enumeración. Detrás de un proxy, configurar `TRUST_PROXY_HOPS`.

### Emails con Credenciales
- **Por defecto (`EMAIL_INCLUDE_PASSWORD` no definido o `false`):** el email de bienvenida **NO** incluye la contraseña — sólo la cédula y un mensaje indicando que la contraseña se entrega por canal seguro. Esto evita filtrar credenciales en texto plano a través de SMTP (OWASP A02:2021) y su persistencia en el buzón del destinatario.
- La contraseña se hashea en BD antes de cualquier envío. El texto plano nunca se persiste.
- Si se habilita `EMAIL_INCLUDE_PASSWORD=true` (transición), el email debe recordar al usuario cambiarla tras el primer ingreso. La meta es reemplazarlo por un flujo de "establecer contraseña" con token de un solo uso.

### Sanitización de HTML (XSS) — OBLIGATORIO
- Cualquier contenido HTML proveniente del backend (plantillas de certificado `certificado_template`, contenido de módulos `data_contenido`) que se inyecte al DOM vía `dangerouslySetInnerHTML` **debe** pasar antes por `sanitizeHtml()` de `utils/sanitize.ts` (envoltorio sobre DOMPurify).
- Esto previene XSS almacenado y la cadena de robo de JWT desde `localStorage`.
- Reglas paralelas en el backend: `certificateTemplateService.interpolateTemplate` interpola valores en HTML crudo — escapar los valores interpolados o migrar a un motor de plantillas con auto-escaping (Handlebars).

### Gestión del JWT_SECRET
- El servidor **se niega a arrancar** si `JWT_SECRET` falta, es un placeholder conocido (`your_jwt_secret_key_here`, `fallback_secret_key_123`, etc.) o mide < 32 caracteres.
- Generar con: `node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"`.
- El secreto **no se exporta** desde `middleware/auth.js`; la firma de tokens está centralizada en `signToken()`.

---

## 5. Brechas de Buenas Prácticas Pendientes

> [!WARNING]
> **Brechas Conocidas:**
> 1. **Mojibake como Parche:** `decodeMojibake` en el frontend y `normalizeToUtf8` en el backend son correcciones sintomáticas. La causa raíz es la codificación de la conexión SQLite. Requiere configurar `pragma encoding = 'UTF-8'` y retirar los helpers progresivamente.
> 2. **Validación de Payloads Débil:** No se valida el esquema completo de los cuerpos de petición (crear usuario, enviar examen). Integrar `zod` en el backend para sanear los inputs antes de operar en BD.
> 3. **Inline Styles Masivos:** Los componentes usan extensamente `style={{}}` en línea. Migrar progresivamente a clases CSS en `index.css`.
> 4. **JWT en `localStorage`:** expuesto a XSS. Migrar a cookie `HttpOnly; Secure; SameSite=Strict`.
> 5. **Verificación IDOR de matrícula:** falta middleware `requireEnrollment` en rutas de estudiante.

> [!TIP]
> **Mejoras Prioritarias:**
> - Agregar `zod` para validación de inputs en endpoints de admin y exámenes.
> - Resolver el encoding UTF-8 en la inicialización de SQLite para eliminar los helpers de mojibake.
> - Implementar cookie HttpOnly para el JWT + endpoint de revocación (`/auth/logout`).
> - Agregar `requireEnrollment` que valide la matrícula antes de servir contenido de un curso.
