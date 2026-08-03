# Contexto del Sistema — Instituto Superior del Norte LMS

**Fuente de la verdad** sobre el contexto de negocio, el flujo de usuario, el
estado de implementación y la visión futura. Leerlo es obligatorio antes de
cualquier cambio al proyecto.

---

## 1. Descripción general del negocio

El **Instituto Superior del Norte** opera un LMS orientado a la certificación
oficial en **Manipulación Higiénica de Alimentos** y otros programas (Bachiller
Académico, Primeros Auxilios, Manejo Defensivo, Manejo 4x4, Mecánica Básica,
Atención al Cliente). El estudiante paga una matrícula, accede a contenidos
formativos en línea, presenta un examen y obtiene un certificado PDF con código
de verificación público.

---

## 2. Flujos de usuario y gestión administrativa

### Flujo estándar del estudiante
```
Login → Dashboard (mis cursos) → CourseDetail (progreso y estado)
→ CourseViewer (módulos dinámicos) → Exam (≥80% para aprobar) → Certificate (PDF)
```

1. **Matrícula manual:** el admin crea la cuenta del estudiante y lo matricula
   desde `/admin/dashboard`. Al crearla, el estudiante recibe un **email de
   bienvenida** con sus credenciales.
2. **Consumo de módulos:** el número de módulos es dinámico por curso. El **100%
   de módulos completados** (calculado contra la tabla `modulos`) desbloquea el
   examen.
3. **Examen final:** preguntas de opción múltiple en la tabla `preguntas`. Mínimo
   80% para aprobar. Calificación y validación **100% en el backend**. Cooldown
   de 10 minutos tras 3 intentos fallidos.
4. **Certificado:** PDF generado por `pdfkit` con número correlativo
   (`AS-YYYY-####`), código único (`ALIM-XXXX-XXXX`) y URL de verificación pública.
   Al aprobar, se envía un **email de felicitaciones** con el PDF adjunto. Cada
   curso puede definir su plantilla HTML de diploma (`cursos.certificado_template`);
   si no, se usa la plantilla institucional por defecto.

### Sub-flujo: Certificación inmediata (bypass de examen y progreso)
Para casos con validaciones comerciales externas, el admin puede otorgar
**Certificación Inmediata** (o `vipass`) al crear un estudiante:
- Se omite la lectura de módulos y el examen.
- El sistema inserta atómicamente el progreso al 100%, crea un examen aprobado
  (100%) y genera el diploma en `certificados`.
- Se genera el PDF y se dispara el email con el diploma automáticamente.

### Control de precios y pagos
- **Precio obligatorio** (`cursos.precio`) al crear cada curso.
- **Estado de pago** (`usuarios.pago_realizado`, 0/1) por estudiante, visible en
  el dashboard de administración.

---

## 3. Estado actual del proyecto (Julio 2026)

### Backend (`/backend`)
- **Stack:** Node.js + Express.
- **Arquitectura:** capas — `routes/`, `controllers/`, `services/`,
  `repositories/`. `server.js` sólo configura Express y registra routers.
- **Base de datos:** SQLite3 (`src/database.sqlite`) con fallback JSON. Tablas:
  `usuarios`, `cursos`, `matriculas`, `modulos`, `progreso`, `examenes`,
  `certificados`, `preguntas`.
- **Autenticación:** JWT (`jsonwebtoken`). Tres roles: `estudiante`,
  `administrador`, `ingeniero_software`. Los dos últimos son `ADMIN_ROLES`;
  `ingeniero_software` es el único autorizado para `/api/admin/financial-metrics`.
  Lista canónica en `middleware/auth.js` (backend) y `context/AppContext.tsx`
  (frontend). El servidor **se niega a arrancar** sin `JWT_SECRET` fuerte
  (≥32 chars). Tokens expiran en 8h.
- **Hardening de seguridad:** CORS con allowlist (`ALLOWED_ORIGINS`), headers de
  seguridad (`nosniff`, `DENY`, `no-referrer`), límite de body 1MB, `trust proxy`,
  rate-limiting en `/auth/login`, `/auth/register` (10/min) y
  `/certificate/verify` (30/min), error handler que enmascara 5xx en producción,
  y cese del envío de contraseña en texto plano por email (gate
  `EMAIL_INCLUDE_PASSWORD`, default off).
- **Generación PDF:** `pdfkit` en `src/services/pdfService.js`. Orientación
  horizontal, logotipo, firma del Comité. URL de verificación configurable vía
  `FRONTEND_URL`.
- **Servicios de plantilla:** `certificateTemplateService.js` y
  `academicTemplateService.js` interpolan las plantillas HTML por curso.
- **Notificaciones email:** `src/services/emailService.js` (Nodemailer). En
  desarrollo (sin SMTP) usa Ethereal Email y muestra el URL de previsualización
  en consola. Destinatario: columna `email` de `usuarios`; si es `NULL`, deriva
  `${cedula}@institutosuperiordelnorte-student.co`.
- **Endpoints clave:** ver [api.md](api.md).

### Frontend (`/frontend`)
- **Stack:** React 19 + Vite 8 + TypeScript. **Todos los componentes son `.tsx`.**
- **Hardening:** `API_BASE_URL` se resuelve desde `VITE_API_BASE_URL`. El HTML
  administrativo (plantillas de certificado, contenido de módulos) se sanea con
  **DOMPurify** (`utils/sanitize.ts`) antes de `dangerouslySetInnerHTML`.
- **Enrutamiento:** React Router DOM (`HashRouter`). Rutas declarativas en
  `App.tsx` (ver [arquitectura.md](arquitectura.md)):
  - `/` — **HomePage** (landing pública + verificador embebido).
  - `/login`, `/admin/login` — autenticación.
  - `/dashboard` — vista del estudiante.
  - `/course/:courseId/detail`, `/course/:courseId`, `/course/:courseId/exam`,
    `/certificate/:courseId` — flujo del curso.
  - `/admin/dashboard`, `/admin/create-course` — panel administrativo.
  - `/verify`, `/verify/:code` — verificación pública.
- **Bridge de hash legacy:** `main.tsx` normaliza `#verify=CÓDIGO` y `#admin` a
  las rutas canónicas antes de montar el router (ver §4).
- **Estado global:** `AppContext.tsx` (Context API). Centraliza autenticación,
  cursos, módulos, progreso, examen y operaciones de admin.
- **Inicialización:** `user` y `currentView` se inicializan sincrónicamente con
  lazy `useState` (decodificando el JWT). **No hay `useEffect` de re-decodificación.**
- **Vistas:** `HomePage`, `Login`, `AdminLogin`, `Dashboard`, `CourseDetail`,
  `CourseViewer`, `Exam`, `Certificate`, `BachillerCertificate`, `AdminDashboard`,
  `CreateCourseScreen`, `VerifyCertificate`.

---

## 4. Correcciones críticas históricas

> [!IMPORTANT]
> **Enlace de verificación de diploma roto (Resuelto — Julio 2026):**
> La URL impresa en cada PDF (`{FRONTEND_URL}/#verify=CÓDIGO`) caía en la
> HomePage en vez de verificar. Causa: con `HashRouter`, el fragmento
> `verify=CÓDIGO` no matchea ninguna ruta → la ruta comodín `*` (`Navigate to "/"`)
> reescribía el hash a `#/` durante el **primer render**, antes de que el handler
> `hashchange` pudiera leer el código original.
>
> **Corrección:** `frontend/src/main.tsx` normaliza el hash legacy
> (`#verify=CÓDIGO` → `#/verify/CÓDIGO`, `#admin` → `#/admin/login`) **antes** de
> `createRoot().render()`, de modo que el router sólo ve rutas válidas. Se eliminó
> el `useEffect` racy de `App.tsx`. Los PDFs nuevos imprimen ya la ruta canónica
> `#/verify/CÓDIGO`.

> [!IMPORTANT]
> **Verificación case-sensitive (Resuelto — Julio 2026):**
> El regex del código admitía minúsculas pero la búsqueda en BD es sensible a
> mayúsculas (los códigos se generan en mayúsculas). Un código en minúsculas
> pasaba validación y devolvía 404. **Corrección:** `publicController.js`
> normaliza el código a mayúsculas antes de consultar la BD.

> [!IMPORTANT]
> **Bucle infinito de peticiones API (Resuelto):**
> `useEffect([token])` recreaba el objeto `user` en cada render, disparando
> `fetchStudentCourses()` cientos de veces/segundo. Se eliminó ese efecto, se
> usan deps primitivas (`user?.cedula`, `user?.rol`) y las funciones de fetch se
> estabilizaron con `useCallback`. `setCurrentView` ya no navega.

> [!IMPORTANT]
> **Bug DROP TABLE en arranque (Resuelto):**
> `setupSqliteDB()` ejecutaba `DROP TABLE IF EXISTS` antes de crear tablas,
> borrando todos los datos en cada reinicio. Se eliminó; ahora usa
> `CREATE TABLE IF NOT EXISTS` + `INSERT OR IGNORE` (seeding idempotente).

---

## 5. Visión de negocio futura

### Landing page pública
- Diseño premium orientado a conversión (ya implementado en `HomePage.tsx`).
- Flujo objetivo: Landing → Checkout (Mercado Pago) → Registro → Acceso al LMS.

### Integración de pagos
- **Mercado Pago (Checkout Pro/API):** tarjetas, PSE (Colombia), Pix (Brasil).
- **Webhooks post-pago:** endpoint para escuchar `payment.approved` → matricular
  automáticamente → enviar credenciales por email.

---

## 6. Brechas activas (restantes)

> [!WARNING]
> 1. **Verificación IDOR de matrícula (P0):** los endpoints de estudiante
>    (`/api/course/*`, `/api/exam/*`, `/api/certificate/*`) confían en `?courseId=`
>    sin verificar que el estudiante esté matriculado. Mitigación: middleware
>    `requireEnrollment` que valide la fila en `matriculas`.
> 2. **JWT en `localStorage`:** expone el token a XSS. DOMPurify mitiga el vector
>    activo; la solución definitiva es una cookie `HttpOnly; Secure; SameSite=Strict`.
> 3. **`JWT_SECRET` de ejemplo en uso:** `backend/.env` trae el placeholder de
>    ejemplo (`REPLACE_WITH_A_LONG_RANDOM_SECRET...`). Pasa la validación por
>    longitud pero es público. **Regenerar antes de producción.**
> 4. **PDF no respeta plantillas HTML personalizadas:** `pdfService.js` siempre
>    genera el layout institucional. Las plantillas por curso sólo se renderizan
>    en pantalla (vía `Certificate.tsx`, saneadas con DOMPurify).
> 5. **Matrícula solo manual:** no existe auto-registro comercial. `POST
>    /api/auth/register` sólo crea la cuenta (valida cédula 6–12 dígitos y
>    contraseña ≥8 chars con letra+número); no matricula ni certifica.
> 6. **Mojibake residual:** `decodeMojibake` (frontend) y `normalizeToUtf8`
>    (backend) son parches. Causa raíz: encoding de la conexión SQLite. Requiere
>    `pragma encoding = 'UTF-8'` y retirar los helpers.
> 7. **Cooldown de examen:** implementado (10 min / 3 fallos) pero sin feedback
>    visual del tiempo restante en el frontend.
