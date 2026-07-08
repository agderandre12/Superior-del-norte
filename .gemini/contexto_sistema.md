# Contexto del Sistema - Instituto Superior del Norte LMS

Este documento es la **Fuente de la Verdad** sobre el contexto de negocio, el flujo de usuario, el estado de implementación y la visión futura del LMS del Instituto Superior del Norte. Leerlo es obligatorio antes de cualquier cambio al proyecto.

---

## 1. Descripción General del Negocio

El **Instituto Superior del Norte** cuenta con una plataforma LMS orientada a la certificación oficial en **Manipulación Higiénica de Alimentos**. El estudiante paga una matrícula, accede a contenidos formativos en línea, presenta un examen y obtiene un certificado PDF con código de verificación público.

---

## 2. Flujos de Usuario y Gestión Administrativa

### Flujo Estándar del Estudiante
```
Acceso (Login) → Dashboard (mis cursos) → CourseDetail (progreso y estado)
→ CourseViewer (módulos dinámicos) → Exam (≥80% para aprobar) → Certificate (descarga PDF)
```

1. **Matrícula Manual:** El admin crea la cuenta del estudiante y lo matricula en cursos desde el panel `/admin/dashboard`. Al crear la cuenta, el estudiante recibe un **email automático de bienvenida** con sus credenciales de acceso.
2. **Consumo de Módulos:** El número de módulos es dinámico por curso (configurable desde el panel admin). El simulador multimedia del frontend avanza el progreso. El **100% de módulos completados** (calculado dinámicamente contra la tabla `modulos`) desbloquea el examen.
3. **Examen Final:** Preguntas de opción múltiple almacenadas en la tabla `preguntas`. Mínimo 80% para aprobar. Calificación y validación son 100% en el backend. Cooldown de 10 minutos tras 3 intentos fallidos.
4. **Certificado:** PDF generado por `pdfkit` con número correlativo (`AS-YYYY-####`), código único (`ALIM-XXXX-XXXX`) y URL de verificación pública (`/verify/:code`). Al aprobar, el sistema envía automáticamente un **email de felicitaciones** con el certificado PDF adjunto. Cada curso puede definir su propia plantilla HTML de diploma (`cursos.certificado_template`) interpolada con los datos del estudiante; si no se define, se usa la plantilla institucional por defecto.

### Sub-Flujo Alternativo: Certificación Inmediata (Bypass de Examen y Progreso)
Para casos especiales o matriculas que ya cuenten con validaciones comerciales externas, el administrador puede otorgar la **Certificación Inmediata** al crear un estudiante:
- Se omite la lectura manual de módulos y la presentación del examen.
- El sistema inserta atómicamente el progreso al 100% para todos los módulos, crea un registro de examen aprobado (100%) y genera el diploma oficial en la tabla `certificados`.
- Se genera el certificado PDF y se dispara el envío de correo con el diploma de manera automática.

### Control de Precios y Pagos
- **Precios Obligatorios:** Cada curso formativo tiene un precio obligatorio (`precio`) persistido en la base de datos, el cual debe ser ingresado obligatoriamente por el administrador al crear el curso.
- **Estado de Pago:** Los estudiantes tienen un campo `pago_realizado` (0 o 1) que determina si ya pagaron el último curso matriculado. Este estado se muestra en el dashboard de administración para control financiero y habilitación de diplomas.

---

## 3. Estado Actual del Proyecto (Julio 2026)

### Backend (`/backend`)
- **Stack:** Node.js + Express.
- **Arquitectura:** Capas separadas — `routes/`, `controllers/`, `services/`, `repositories/`. El servidor `server.js` solo configura Express y registra los routers.
- **Base de Datos:** SQLite3 (`database.sqlite`) con fallback JSON. Tablas: `usuarios`, `cursos`, `matriculas`, `modulos`, `progreso`, `examenes`, `certificados`, `preguntas`.
- **Autenticación:** JWT firmado con `jsonwebtoken`. Tres roles soportados: `estudiante`, `administrador` y `ingeniero_software`. Los dos últimos son roles privilegiados (`ADMIN_ROLES`) aceptados por el middleware `requireAdmin`; `ingeniero_software` además es el único autorizado para `/api/admin/financial-metrics`. La lista canónica de roles privilegiados vive en `middleware/auth.js` (backend) y en `context/AppContext.tsx` (frontend, `ADMIN_ROLES`/`isAdmin`). El `JWT_SECRET` debe configurarse en `.env` con >= 32 caracteres; el servidor **se niega a arrancar** si falta o es un placeholder. Tokens expiran en 8h.
- **Hardening de Seguridad (Julio 2026):** CORS con allowlist de orígenes (`ALLOWED_ORIGINS`), headers de seguridad (`nosniff`, `DENY`, `no-referrer`), límite de body 1MB, `trust proxy`, rate-limiting en `/auth/login`, `/auth/register` (10/min) y `/certificate/verify` (30/min), error handler centralizado que **enmascara** mensajes 5xx en producción, y cese del envío de contraseña en texto plano por email (gate `EMAIL_INCLUDE_PASSWORD`, default off).
- **Generación PDF:** `pdfkit` en `src/services/pdfService.js`. Orientación horizontal, logotipo, firma del Comité. URL de verificación configurable vía `FRONTEND_URL` en `.env`.
- **Contenido:** El curso de Manipulación de Alimentos tiene **8 módulos** sembrados en DB con contenido HTML estructurado (migrado desde `Información curso de manipulación.txt`). Nuevos cursos pueden tener cualquier número de módulos.
- **Examen:** Las preguntas están en la tabla `preguntas` en BD. El endpoint `GET /api/exam/questions?courseId=X` filtra `respuesta_correcta`. La calificación se hace consultando la BD con `getExamQuestionsWithAnswers()`.
- **Notificaciones Email:** `src/services/emailService.js` usa Nodemailer. En desarrollo (sin SMTP configurado), usa Ethereal Email y muestra el URL de previsualización en consola. El destinatario usa la columna `email` de `usuarios`; si es `NULL`, deriva `${cedula}@institutosuperiordelnorte-student.co`.
- **Endpoints Clave:**
  - `POST /api/auth/login` — JWT para estudiante y admin.
  - `GET /api/student/courses` — Cursos matriculados del estudiante.
  - `GET /api/course/content?courseId=` — Módulos del curso.
  - `GET /api/course/progress?courseId=` — Progreso del estudiante.
  - `POST /api/course/progress` — Marcar módulo completado.
  - `GET /api/exam/questions?courseId=` — Preguntas del examen (sin respuestas).
  - `POST /api/exam/submit` — Evalúa respuestas, emite certificado y envía email con PDF adjunto.
  - `GET /api/certificate/detail?courseId=` — Datos del certificado.
  - `GET /api/certificate/download?courseId=` — PDF del certificado.
  - `GET /api/certificate/verify/:code` — Verificación pública (no requiere auth).
  - `GET/POST /api/admin/*` — Métricas, CRUD de estudiantes (con email bienvenida), matrícula, creación de cursos.

### Frontend (`/frontend`)
- **Stack:** React 19 + Vite 8 + TypeScript.
- **Hardening de Seguridad (Julio 2026):** el `API_BASE_URL` se resuelve desde `VITE_API_BASE_URL` (variable de entorno Vite) en lugar de estar hardcoded. `index.html` referencia `/src/main.tsx`. El HTML administrativo (plantillas de certificado y contenido de módulos) se sanea con **DOMPurify** (`utils/sanitize.ts`) antes de inyectarse vía `dangerouslySetInnerHTML`, mitigando XSS almacenado y la cadena de robo de JWT desde `localStorage`. Se eliminaron los banners de credenciales-demo de las pantallas de login.
- **Enrutamiento:** React Router DOM (`HashRouter`). Las rutas declarativas son la fuente de verdad de la navegación.
  - `/login`, `/admin/login` — Autenticación.
  - `/dashboard` — Vista del estudiante con la lista de cursos matriculados.
  - `/course/:courseId/detail` — Vista individual del curso con progreso y estado.
  - `/course/:courseId` — CourseViewer con módulos dinámicos.
  - `/course/:courseId/exam` — Examen final.
  - `/certificate/:courseId` — Vista del diploma.
  - `/admin/dashboard`, `/admin/create-course` — Panel administrativo.
  - `/verify`, `/verify/:code` — Verificación pública de certificados (portal público: el botón "Volver" regresa a `/`, no a `/login`).
- **Estado Global:** `AppContext.jsx` (Context API). Centraliza autenticación, cursos del estudiante, módulos, progreso, examen y operaciones de admin.
- **Inicialización de Estado:** El `user` y `currentView` se inicializan sincrónicamente con lazy `useState` (decodificando el JWT del `localStorage`). **No hay `useEffect` de re-decodificación JWT** para evitar loops de renderizado.
- **Fetch Functions:** Estabilizadas con `useCallback` para que sus referencias no cambien en cada render.
- **Vistas Implementadas:** `Login`, `AdminLogin`, `Dashboard`, `CourseViewer`, `Exam`, `Certificate`, `AdminDashboard`, `CreateCourseScreen`, `VerifyCertificate`.

---

## 4. Correcciones Críticas Históricas

> [!IMPORTANT]
> **Bucle Infinito de Peticiones API (Resuelto):**
> Se resolvió un bucle donde `useEffect([token])` recreaba el objeto `user` en cada render, desencadenando `fetchStudentCourses()` cientos de veces/segundo.
>
> **Correcciones aplicadas:**
> - Eliminado el `useEffect([token])` de re-decodificación JWT.
> - `useEffect` usa `user?.cedula` y `user?.rol` (primitivos) en las dependencias.
> - Funciones de fetch estabilizadas con `useCallback`.
> - Eliminada la sincronización bidireccional en `App.jsx`.
> - Todos los componentes usan `useNavigate()`. **`setCurrentView` ya no navega.**

> [!IMPORTANT]
> **Bug DROP TABLE en Arranque (Resuelto):**
> `setupSqliteDB()` ejecutaba `DROP TABLE IF EXISTS` antes de crear las tablas, borrando todos los datos en cada reinicio del servidor.
>
> **Corrección aplicada:**
> - Eliminados todos los `DROP TABLE`.
> - Se usa `CREATE TABLE IF NOT EXISTS` + `INSERT OR IGNORE` para seeding idempotente.
> - Los datos de usuarios, matrículas, progreso y certificados persisten entre reinicios.

---

## 5. Visión de Negocio Futura

### Landing Page Pública
- Diseño premium orientado a conversión, con información del curso, testimonios y botón de matrícula.
- Flujo: Landing → Checkout (Mercado Pago) → Registro de credenciales → Acceso al LMS.

### Integración de Pagos
- **Mercado Pago (Checkout Pro/API):** Pagos locales con tarjetas, PSE (Colombia), Pix (Brasil).
- **Webhooks Post-Pago:** Endpoint en backend para escuchar `payment.approved` → matricular automáticamente → enviar credenciales por email.

---

## 6. Brechas Activas (Restantes)

> [!WARNING]
> **Brechas Conocidas:**
> 1. **Matrícula Solo Manual:** No existe flujo de auto-registro comercial. Los estudiantes solo se crean desde el panel del admin. El endpoint `POST /api/auth/register` existe pero sólo crea la cuenta sin matricular ni certificar (valida cédula 6–12 dígitos y contraseña >= 8 chars con letra+número).
> 2. **Mojibake Residual:** Los correctores `decodeMojibake` en frontend y `normalizeToUtf8` en backend son parches. La causa raíz es la codificación de la conexión SQLite. Requiere configurar `pragma encoding = 'UTF-8'` y retirar los helpers progresivamente.
> 3. **Cooldown de Examen:** Implementado (10 min / 3 fallos), pero sin feedback visual del tiempo restante en el frontend.
> 4. **PDF no respeta plantillas HTML personalizadas:** `pdfService.js` siempre genera el layout institucional por defecto. Las plantillas HTML por curso (`certificado_template`) sólo se renderizan en pantalla (vía `Certificate.tsx`, saneadas con DOMPurify), no en el PDF descargable/empleado.
> 5. **Verificación IDOR de matrícula (P0 pendiente):** los endpoints de estudiante (`/api/course/*`, `/api/exam/*`, `/api/certificate/*`) confían en `?courseId=` sin verificar que el estudiante esté matriculado en ese curso. Cualquier estudiante autenticado podría leer contenido/exámenes de cursos ajenos. Mitigación recomendada: middleware `requireEnrollment` que valide la fila en `matriculas`.
> 6. **Almacenamiento de JWT en `localStorage`:** expone el token a XSS. DOMPurify mitiga el vector activo, pero la mitigación definitiva es mover el JWT a una cookie `HttpOnly; Secure; SameSite=Strict`.

> [!NOTE]
> **Resueltas en la auditoría de Julio 2026 (ya NO son brechas):**
> - ~~Email de estudiante hardcodeado~~ → la columna `email` existe en `usuarios` y se usa en `emailService.js`.
> - ~~Validación de códigos de verificación débil~~ → el endpoint público `/api/certificate/verify/:codigo` ahora valida formato (regex), limita a 50 chars, tiene rate-limiting (30/min), y el frontend ya no usa valores fallback falsos (`|| 100`, `|| 'AS-2026-0001'`).
> - ~~Contraseña en texto plano por email~~ → deshabilitado por defecto (gate `EMAIL_INCLUDE_PASSWORD`).
> - ~~Secreto JWT fallback hardcoded~~ → el servidor se niega a arrancar sin un `JWT_SECRET` fuerte.
> - ~~Backdoor de reseteo de contraseña del ingeniero en cada arranque~~ → eliminado.
