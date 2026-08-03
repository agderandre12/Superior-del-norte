# API — Instituto Superior del Norte LMS

Contrato y especificación de endpoints entre frontend y backend.

---

## Convenciones transversales (aplican a todos los endpoints)

- **Base URL:** el frontend la resuelve desde `VITE_API_BASE_URL` (nunca
  hardcoded). Default dev: `http://localhost:5000/api`.
- **Content-Type:** `application/json; charset=utf-8` para JSON (fijado en
  `server.js`). Las descargas binarias (`/certificate/download`) devuelven
  `application/pdf`.
- **CORS:** allowlist server-side desde `ALLOWED_ORIGINS`. Orígenes no listados
  se rechazan. `credentials` permitido.
- **Security headers:** `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`,
  `Referrer-Policy: no-referrer`.
- **Body limit:** 1 MB (JSON / URL-encoded).
- **Rate limiting (en memoria, por IP):**
  | Grupo | Ventana | Máx | Al exceder |
  |---|---|---|---|
  | `POST /api/auth/login`, `POST /api/auth/register` | 60 s | 10 | `429` + `Retry-After` |
  | `GET /api/certificate/verify/:codigo` | 60 s | 30 | `429` + `Retry-After` |
- **Envelope de error estándar:**
  `{ "success": false, "error": { "code": "ERROR_CODE", "message": "..." } }`.
  En `5xx` con `NODE_ENV=production` el `message` se enmascara; los stack traces
  **nunca** se envían. Algunos endpoints legacy (login, verify público) devuelven
  formas más planas por compatibilidad (se indica abajo).
- **Auth:** JWT `HS256` firmado con `JWT_SECRET` (≥32 chars). Header
  `Authorization: Bearer <token>`. Expira en **8 horas**.

---

## Autenticación

### `POST /api/auth/login`
Autentica con cédula (usuario) y contraseña. Rate-limited (10/min/IP).
- **Body:** `{ "cedula": "123456789", "password": "password123" }`
- **200:** `{ "token": "eyJ...", "user": { "cedula", "nombre_completo", "rol" } }`
- **400/401 (forma legacy):** `{ "error": "Cédula o contraseña incorrectas" }`
- **429:** envelope estándar con `Retry-After: 60`.

### `POST /api/auth/register`
Auto-registro. Sin auth. Rate-limited (10/min/IP).
- **Body:** `{ "cedula", "nombre_completo", "password" }`
- **Validación:** cédula 6–12 dígitos; contraseña ≥8 chars con letra + número.
- **201:** `{ "message", "user": { cedula, nombre_completo, rol: "estudiante" } }`
- > Crea la cuenta únicamente — **no** matricula ni certifica.

---

## Contenido de curso y progreso (requiere `Bearer <token>`)

### `GET /api/course/content?courseId=X`
Lista dinámica de módulos del curso.
- **200:** `[ { id, titulo, descripcion, orden, tipo_recurso, contenido (HTML), url_recurso } ]`

### `GET /api/course/progress?courseId=X`
Progreso del estudiante logueado. Porcentaje = `completados / total_modulos * 100`.
- **200:** `{ "progreso_porcentaje": 50.0, "modulos_completados": [1,2,3,4] }`

### `POST /api/course/progress`
Marca un módulo como completado.
- **Body:** `{ "modulo_id": 1 }`
- **200:** `{ "message", "progreso_porcentaje", "modulos_completados": [...] }`

### `GET /api/student/courses`
Cursos matriculados del estudiante (con `progreso_porcentaje` y `fecha_matricula`).

---

## Examen y evaluación (requiere `Bearer <token>`)

### `GET /api/exam/questions?courseId=X`
Preguntas del examen (sin `respuesta_correcta` — filtrada server-side).
- **403** si el progreso no es 100%. **429** si hubo 3+ fallos en los últimos 10 min.
- **200:** `[ { id, pregunta, opciones: { A, B, C, D } } ]`

### `POST /api/exam/submit`
Evalúa respuestas contra `preguntas`, registra el intento y, si ≥80%, genera el
certificado y envía el PDF por email.
- **Body:** `{ "courseId": 1, "respuestas": { "1": "C", "2": "B" } }`
- **200:** `{ "puntaje": 90.0, "aprobado": true, "intentos": 1, "message": "..." }`
- **Efecto al aprobar:** email de felicitaciones con el PDF adjunto (async).

---

## Certificación

### `GET /api/certificate/detail?courseId=X` (requiere token)
Metadatos del certificado del estudiante autenticado.
- **200:** `{ codigo_verificacion, usuario_cedula, curso_id, fecha_emision, calificacion_obtenida, numero_certificado }`

### `GET /api/certificate/download?courseId=X` (requiere token)
Genera y hace stream del PDF.
- **200:** `application/pdf` (binario). **400** si no aprobó (≥80%).

### `GET /api/certificate/verify/:codigo` — **Público**
Verificación de autenticidad de un diploma por terceros. **Sin auth.**
- **Path param `codigo`:** formato `ALIM-XXXX-XXXX`, regex
  `^[A-Za-z0-9]{3,5}-[A-Za-z0-9]{3,6}-[A-Za-z0-9]{3,6}$`, máx 50 chars. El cliente
  debe `encodeURIComponent` el valor. El backend **normaliza a mayúsculas** antes
  de la búsqueda (la búsqueda en BD es case-sensitive; los códigos se generan en
  mayúsculas).
- **Rate limiting:** 30/min/IP (evita enumeración).
- **200:**
  ```json
  {
    "valido": true,
    "usuario": "Juan Pérez",
    "nombre_completo": "Juan Pérez",
    "cedula": "123456789",
    "fecha_emision": "2026-06-12",
    "codigo_verificacion": "ALIM-ABCD-1234",
    "calificacion_obtenida": 90.0,
    "curso_titulo": "Manipulación de Alimentos",
    "numero_certificado": "AS-2026-0001"
  }
  ```
  > `usuario` y `nombre_completo` se devuelven iguales por compatibilidad con los
  > dos consumidores: `HomePage` lee `nombre_completo`; `VerifyCertificate` lee
  > `usuario` con fallback a `nombre_completo`.
- **Errores (forma plana legacy):**
  - `400` — código ausente/>50 chars: `{ "valido": false, "error": "Formato de código de verificación inválido." }`
  - `400` — no cumple formato: `{ "valido": false, "error": "El código de verificación no cumple con el formato esperado." }`
  - `404` — formato válido sin match: `{ "valido": false, "error": "Código de verificación no válido o certificado inexistente." }`
  - `429` — rate limit (con `Retry-After`).
- **Enlaces de diploma:**
  - Diplomas **nuevos** imprimen la ruta canónica `{FRONTEND_URL}/#/verify/CÓDIGO`.
  - Diplomas **antiguos** imprimen `{FRONTEND_URL}/#verify=CÓDIGO`, normalizado por
    el bridge de `frontend/src/main.tsx` (ver [arquitectura.md](arquitectura.md)).
- **Estados de UI (obligatorios):** loading (spinner), success (renderizar los
  campos devueltos, **nunca** inventar valores), error/empty (mensaje 404).

---

## Administración (`/api/admin/*` — requiere `Bearer <token>` con rol admin)

### `POST /api/admin/users/create`
Crea estudiante, registra metadatos y estado de pago, matricula y, opcionalmente,
emite certificación inmediata (bypass) o entrega VIP.
- **Body (campos notables):**
  ```json
  {
    "cedula": "987654321", "nombre_completo": "María García", "password": "pass123",
    "email": "maria@correo.com", "cursos": [1],
    "fecha_expedicion_cedula": "2018-09-24", "municipio_expedicion_cedula": "Bucaramanga",
    "municipio_nacimiento": "Giron", "anio_nacimiento": 1996, "pago_realizado": 1,
    "certificar_inmediatamente": true, "vipass": false
  }
  ```
  - `email` (opcional): si se omite, deriva `${cedula}@institutosuperiordelnorte-student.co`.
  - `vipass` (default `false`): fuerza `certificar_inmediatamente = true` y dispara
    la entrega del certificado por email.
  - `certificar_inmediatamente` (default `false`): bypass de examen y progreso.
- **201:** `{ "message", "user": { ... } }`
- **Efecto bypass/VIP:** crea progreso 100%, examen aprobado, certificado y email
  con PDF, sin requerir examen.

### `POST /api/admin/courses`
Crea curso + módulos. Precio obligatorio.
- **Body:** `{ titulo, descripcion, imagen_url, precio, certificado_template?, modulos: [ { titulo_modulo, tipo_contenido, data_contenido } ] }`
  - `precio` (requerido, ≥0). `tipo_contenido`: `Texto` | `Video` | `Audio` | `Imagen`.
  - `certificado_template` (opcional): HTML con tags `{{NOMBRE}}`, `{{CEDULA}}`,
    `{{FECHA_EXPEDICION}}`, `{{MUNICIPIO_EXPEDICION}}`, `{{ANIO_NACIMIENTO}}`,
    `{{CODIGO_VERIFICACION}}`, `{{FECHA_EMISION}}`.
- **201:** `{ "message", "curso": { ... } }`

### `PUT /api/admin/courses/:id`
Actualiza título, descripción y precio. **200:** `{ "message" }`.

### `PUT /api/admin/courses/:courseId/modules/:moduleId`
Actualiza título, tipo y `data_contenido` del módulo. **200:** `{ "message" }`.

### `PUT /api/admin/users/:cedula`
Actualiza perfil del estudiante (nombre, documento, año nacimiento, `pago_realizado`).
**200:** `{ "message" }`.

### `GET /api/admin/certificate/download?cedula=X&courseId=Y`
Descarga el PDF de cualquier estudiante. **200:** `application/pdf`.

### `GET /api/admin/courses/list`
Lista simplificada. **200:** `[ { id, titulo } ]`.

### `GET /api/admin/financial-metrics`
Métricas de ingresos + matrículas pagadas. **Restringido a `rol: ingeniero_software`**
(el `administrador` recibe `403`). Devuelve PII — sólo auditoría interna.

Otros endpoints admin: `GET /api/admin/metrics`, `GET /api/admin/users`,
`GET /api/admin/courses`, `GET /api/admin/users/:cedula/courses`,
`PUT /api/admin/users/:cedula/courses` (matrícula).

---

## Variables de entorno (backend `.env`)

| Variable | Propósito |
|---|---|
| `PORT` | Puerto del servidor (default 5000). |
| `NODE_ENV` | `production` enmascara detalles de errores 5xx. |
| `JWT_SECRET` | Firma JWT — **requerido**, ≥32 chars. El servidor aborta si falta/placeholder. |
| `ALLOWED_ORIGINS` | Allowlist CORS (separada por comas). |
| `TRUST_PROXY_HOPS` | Valor de `trust proxy` para `req.ip`/rate-limiting tras un LB. |
| `FRONTEND_URL` | Base URL usada en enlaces de email/PDF. |
| `SMTP_*` | Config de email transaccional (host/port/secure/user/pass/from). |
| `EMAIL_INCLUDE_PASSWORD` | `true` embebe la contraseña provisional en el email (default `false`). |
