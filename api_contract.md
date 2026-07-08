# API Contract - Instituto Superior del Norte LMS

This contract defines the interaction between the Frontend and Backend for the Instituto Superior del Norte LMS course platform.

---

## 🛡️ Cross-Cutting Security & Conventions

These rules apply to **every** endpoint in this contract.

- **Base URL:** Configurable. The frontend resolves it from `VITE_API_BASE_URL` (Vite env) — never hardcoded. Default dev URL: `http://localhost:5000/api`.
- **Content-Type:** `application/json; charset=utf-8` for all JSON responses (set centrally in `server.js`). Binary downloads (`/certificate/download`) return `application/pdf`.
- **CORS:** Origin allowlist enforced server-side from `ALLOWED_ORIGINS` (comma-separated). Requests from non-listed origins are rejected. Credentials are allowed.
- **Security headers:** `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: no-referrer` on all responses.
- **Request body limit:** `1 MB` (JSON / URL-encoded).
- **Rate limiting (in-memory, per IP):**
  | Endpoint group | Window | Max | HTTP on exceed |
  |---|---|---|---|
  | `POST /api/auth/login`, `POST /api/auth/register` | 60 s | 10 | `429` |
  | `GET /api/certificate/verify/:codigo` | 60 s | 30 | `429` |
- **Error envelope (standardized):** all errors returned by the centralized error handler use:
  ```json
  { "success": false, "error": { "code": "ERROR_CODE", "message": "Human-readable message" } }
  ```
  On `5xx` responses in production (`NODE_ENV=production`) the internal `message` is masked and replaced with a generic message; stack traces are **never** sent to clients.
  > Note: some legacy operational endpoints (auth/login, public verify) still return flatter error shapes (`{ "error": "..." }` or `{ "valido": false, "error": "..." }`) for backward compatibility with deployed clients. These are noted per-endpoint below.
- **Authentication:** JWT (`HS256`) signed with `JWT_SECRET` (>= 32 chars, configured in `.env`; the server refuses to boot if missing/placeholder). Sent as `Authorization: Bearer <token>`. Tokens expire in **8 hours**.

---

## 🔒 Authentication

### 1. User Login
Authenticates the student using their Cédula (national ID) as the username and password.

- **Endpoint:** `POST /api/auth/login`
- **Headers:** 
  - `Content-Type: application/json`
- **Request Body:**
  ```json
  {
    "cedula": "123456789",
    "password": "password123"
  }
  ```
- **Success Response (200 OK):**
  ```json
  {
    "token": "eyJhbGciOi...",
    "user": {
      "cedula": "123456789",
      "nombre_completo": "Juan Pérez",
      "rol": "estudiante"
    }
  }
  ```
- **Error Response (400 Bad Request / 401 Unauthorized / 429 Too Many Requests):**
  - 400/401 (legacy flat shape, kept for client compatibility):
    ```json
    { "error": "Cédula o contraseña incorrectas" }
    ```
  - 429 (rate-limited, standardized envelope):
    ```json
    { "success": false, "error": { "code": "RATE_LIMITED", "message": "Demasiadas solicitudes. Intente nuevamente en 60 segundos." } }
    ```
    The response includes a `Retry-After: 60` header. Login is rate-limited to **10 attempts/minute/IP** to mitigate brute-force / credential-stuffing.

---

## 📚 Course Content & Progress

All endpoints below require the JWT token in the `Authorization` header:
`Authorization: Bearer <token>`

### 2. Fetch Course Modules
Returns the dynamic list of modules for the specified course. The number of modules is not fixed — it depends on how many modules were configured for that course in the database.

- **Endpoint:** `GET /api/course/content?courseId=X`
- **Success Response (200 OK):**
  ```json
  [
    {
      "id": 1,
      "titulo": "Módulo 1: Inocuidad alimentaria y BPM",
      "descripcion": "Descripción breve...",
      "orden": 1,
      "tipo_recurso": "video",
      "contenido": "<h3>Contenido HTML...</h3>",
      "url_recurso": "https://example.com/video.mp4"
    }
  ]
  ```

### 3. Fetch User Progress
Returns the progression percentage and a list of completed module IDs for the logged-in student. The percentage is calculated dynamically: `completados / total_modulos_del_curso * 100`.

- **Endpoint:** `GET /api/course/progress?courseId=X`
- **Success Response (200 OK):**
  ```json
  {
    "progreso_porcentaje": 50.0,
    "modulos_completados": [1, 2, 3, 4]
  }
  ```

### 4. Mark Module as Completed
Marks a specific module as read/completed.

- **Endpoint:** `POST /api/course/progress`
- **Request Body:**
  ```json
  {
    "modulo_id": 1
  }
  ```
- **Success Response (200 OK):**
  ```json
  {
    "message": "Progreso actualizado con éxito",
    "progreso_porcentaje": 50.0,
    "modulos_completados": [1]
  }
  ```

---

## 📝 Exam & Evaluation

Requires `Authorization: Bearer <token>`.

### 5. Fetch Exam Questions
Fetches the exam questions from the `preguntas` table in the database for the specified course (excluding correct answers for security).

Access is blocked with HTTP 403 if the student has not completed 100% of the course modules.
If the student has failed 3+ times in the last 10 minutes, returns HTTP 429 with remaining wait time.

- **Endpoint:** `GET /api/exam/questions?courseId=X`
- **Success Response (200 OK):**
  ```json
  [
    {
      "id": 1,
      "pregunta": "¿Cuál es la temperatura mínima segura para cocinar pollo?",
      "opciones": {
        "A": "60°C (140°F)",
        "B": "70°C (158°F)",
        "C": "74°C (165°F)",
        "D": "80°C (176°F)"
      }
    }
  ]
  ```
- **Note:** The `respuesta_correcta` field is NEVER included in this response — it is filtered server-side.

### 6. Submit Exam
Submits the student's answers. The backend fetches correct answers from the `preguntas` table, calculates the score, records the attempt, and if the score is ≥ 80%, generates a certificate and sends it via email with the PDF attached.

- **Endpoint:** `POST /api/exam/submit`
- **Request Body:**
  ```json
  {
    "courseId": 1,
    "respuestas": {
      "1": "C",
      "2": "B",
      "3": "C"
    }
  }
  ```
- **Success Response (200 OK):**
  ```json
  {
    "puntaje": 90.0,
    "aprobado": true,
    "intentos": 1,
    "message": "¡Felicidades! Has aprobado con 90%. Tu certificado ya está disponible."
  }
  ```
- **Side Effect on Approval:** The backend asynchronously sends a congratulations email with the official PDF certificate attached to the student's registered email.

---

## 🎓 Certification

Requires `Authorization: Bearer <token>`.

### 7. Get Certificate Detail
Returns certificate metadata for the authenticated student and specified course.

- **Endpoint:** `GET /api/certificate/detail?courseId=X`
- **Success Response (200 OK):**
  ```json
  {
    "codigo_verificacion": "ALIM-ABCD-1234",
    "usuario_cedula": "123456789",
    "curso_id": 1,
    "fecha_emision": "2026-06-12",
    "calificacion_obtenida": 90.0,
    "numero_certificado": "AS-2026-0001"
  }
  ```

### 8. Download Certificate
Generates and streams the PDF certificate for approved students.

- **Endpoint:** `GET /api/certificate/download?courseId=X`
- **Success Response (200 OK):**
  - Content-Type: `application/pdf`
  - Binary Stream (PDF)
- **Error Response (400 Bad Request):**
  ```json
  {
    "error": "Debe completar y aprobar el examen final con al menos un 80% para descargar su certificado."
  }
  ```

### 9. Verify Certificate (Public Route)
Allows anyone — including unauthenticated third parties such as employers or health authorities — to verify the authenticity of a diploma using its verification code. Does **not** require authentication.

- **Endpoint:** `GET /api/certificate/verify/:codigo`
- **Auth:** None (public).
- **Path param:** `codigo` — the verification code, format `ALIM-XXXX-XXXX` (regex `^[A-Za-z0-9]{3,5}-[A-Za-z0-9]{3,6}-[A-Za-z0-9]{3,6}$`, max 50 chars). The client should `encodeURIComponent` the value.
- **Rate limiting:** **30 requests/minute/IP** to prevent enumeration of codes. Exceeding returns `429`.
- **Success Response (200 OK):**
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
  > Both `usuario` and `nombre_completo` are returned (same value) for compatibility with the two frontend consumers (`HomePage` reads `nombre_completo`; `VerifyCertificate` reads `usuario` with a `nombre_completo` fallback). No internal/non-public certificate columns are exposed.
- **Error Responses:**
  - `400 Bad Request` — code missing or over 50 chars:
    ```json
    { "valido": false, "error": "Formato de código de verificación inválido." }
    ```
  - `400 Bad Request` — code does not match the expected format:
    ```json
    { "valido": false, "error": "El código de verificación no cumple con el formato esperado." }
    ```
  - `404 Not Found` — format valid but no matching certificate:
    ```json
    { "valido": false, "error": "Código de verificación no válido o certificado inexistente." }
    ```
  - `429 Too Many Requests` — rate limit exceeded (includes `Retry-After` header).

> **Frontend states (required):** the consuming UI must explicitly handle **loading** (spinner while awaiting response), **success** (render the returned fields — never invent values), and **error/empty** (the 404 message above). The frontend must not fall back to hardcoded placeholder values (e.g. `|| 100`, `|| 'AS-2026-0001'`) since that would fabricate plausible-looking but fake data on a verification screen.

---

## 👤 Student Management & Course Creation (Admin Only)

All `/api/admin/*` endpoints require `Authorization: Bearer <token>` with `rol: administrador`.

### 10. Create Student
Creates a student account, records their metadata, registers their payment status, assigns them to courses, and optionally issues immediate certification (bypass flow) or VIP auto-delivery.

- **Endpoint:** `POST /api/admin/users/create`
- **Request Body:**
  ```json
  {
    "cedula": "987654321",
    "nombre_completo": "María García",
    "password": "pass123",
    "email": "maria@correo.com",
    "cursos": [1],
    "fecha_expedicion_cedula": "2018-09-24",
    "municipio_expedicion_cedula": "Bucaramanga",
    "municipio_nacimiento": "Giron",
    "anio_nacimiento": 1996,
    "pago_realizado": 1,
    "certificar_inmediatamente": true,
    "vipass": false
  }
  ```
- **Field Notes:**
  - `email` (string, optional): Real corporate email for certificate delivery. If omitted, the system derives `${cedula}@institutosuperiordelnorte-student.co`.
  - `vipass` (boolean, optional, default `false`): VIP access flag. When `true`, automatically triggers immediate certification (implies `certificar_inmediatamente = true`) and dispatches the certificate via the corporate email service. Only settable by administrators.
  - `certificar_inmediatamente` (boolean, optional, default `false`): Bypass exam and progress. Automatically forced to `true` when `vipass` is `true`.
- **Success Response (201 Created):**
  ```json
  {
    "message": "Estudiante creado y matriculado con éxito.",
    "user": {
      "cedula": "987654321",
      "nombre_completo": "María García",
      "rol": "estudiante",
      "fecha_registro": "2026-06-17",
      "fecha_expedicion_cedula": "2018-09-24",
      "municipio_expedicion_cedula": "Bucaramanga",
      "municipio_nacimiento": "Giron",
      "anio_nacimiento": 1996,
      "pago_realizado": 1,
      "email": "maria@correo.com",
      "vipass": 0
    }
  }
  ```
- **Bypass/VIP flow side effect:** If `certificar_inmediatamente` or `vipass` is `true`, it automatically creates progress at 100%, records an approved exam attempt, generates a certificate, and triggers a congratulations email with the PDF attachment (using the course's custom HTML template if available) without requiring the student to take the exam.

### 11. Create Course formativo
Creates a new course along with its modules. A course requires a mandatory price.

- **Endpoint:** `POST /api/admin/courses`
- **Request Body:**
  ```json
  {
    "titulo": "Buenas Prácticas de Higiene para Lácteos",
    "descripcion": "Curso intensivo de inocuidad...",
    "imagen_url": "https://images.unsplash.com/photo-...",
    "precio": 120000,
    "certificado_template": "<html>... plantilla HTML opcional con etiquetas {{NOMBRE}}, {{CEDULA}}, {{FECHA_EMISION}}, {{CODIGO_VERIFICACION}} ...</html>",
    "modulos": [
      {
        "titulo_modulo": "Introducción",
        "tipo_contenido": "Texto",
        "data_contenido": "Contenido del módulo..."
      }
    ]
  }
  ```
- **Field Notes:**
  - `precio` (number, required): Must be a non-negative number.
  - `certificado_template` (string, optional): Raw HTML template for the course's printable certificate. Supports the interpolation tags `{{NOMBRE}}`, `{{CEDULA}}`, `{{FECHA_EXPEDICION}}`, `{{MUNICIPIO_EXPEDICION}}`, `{{ANIO_NACIMIENTO}}`, `{{CODIGO_VERIFICACION}}`, `{{FECHA_EMISION}}`. When omitted, the default institutional template is used.
  - `modulos` (array, required, min length 1): Each module requires `titulo_modulo`, `tipo_contenido` (`Texto` | `Video` | `Audio` | `Imagen`), and `data_contenido` (HTML body for `Texto`, direct resource URL otherwise).
- **Success Response (201 Created):**
  ```json
  {
    "message": "Curso creado con éxito junto con sus módulos.",
    "curso": {
      "id": 2,
      "titulo": "Buenas Prácticas de Higiene para Lácteos",
      "descripcion": "Curso intensivo de inocuidad...",
      "imagen_url": "https://images.unsplash.com/photo-...",
      "precio": 120000,
      "certificado_template": "<html>...</html>",
      "creado_en": "2026-06-17"
    }
  }
  ```

### 12. Download Student Certificate
Allows the administrator to directly download the PDF certificate of any student.

- **Endpoint:** `GET /api/admin/certificate/download?cedula=X&courseId=Y`
- **Success Response (200 OK):**
  - Content-Type: `application/pdf`
  - Binary Stream (PDF)

### 13. Update Course
Updates the basic metadata (title, description, mandatory price) of an existing course.

- **Endpoint:** `PUT /api/admin/courses/:id`
- **Request Body:**
  ```json
  {
    "titulo": "Manipulación de Alimentos Premium",
    "descripcion": "Curso actualizado con regulaciones 2026...",
    "precio": 130000
  }
  ```
- **Success Response (200 OK):**
  ```json
  {
    "message": "Curso actualizado con éxito."
  }
  ```

### 14. Update Course Module
Updates the metadata (title, content type) and interactive HTML data of an existing module.

- **Endpoint:** `PUT /api/admin/courses/:courseId/modules/:moduleId`
- **Request Body:**
  ```json
  {
    "titulo_modulo": "Módulo 1: Inocuidad y BPM (Edición 2026)",
    "tipo_contenido": "Texto",
    "data_contenido": "{\"url\":\"https://example.com/audio.mp3\",\"text\":\"## Nuevo Contenido BPM\"}"
  }
  ```
- **Success Response (200 OK):**
  ```json
  {
    "message": "Módulo de curso actualizado con éxito."
  }
  ```

### 15. Update Student Profile
Updates the profile information of a student, including name, document details, birth year, and course payment status.

- **Endpoint:** `PUT /api/admin/users/:cedula`
- **Request Body:**
  ```json
  {
    "nombre_completo": "Juan Pérez Modificado",
    "fecha_expedicion_cedula": "2015-05-12",
    "municipio_expedicion_cedula": "Medellín",
    "municipio_nacimiento": "Itagüí",
    "anio_nacimiento": 1993,
    "pago_realizado": 1
  }
  ```
- **Success Response (200 OK):**
  ```json
  {
    "message": "Perfil del estudiante actualizado con éxito."
  }
  ```

---

## 📋 Additional Endpoints (Reference)

These endpoints exist in the backend and are consumed by the frontend but were not detailed above.

### 16. Self-Register
- **Endpoint:** `POST /api/auth/register`
- **Auth:** None. Rate-limited (10/min/IP).
- **Request Body:** `{ "cedula": "...", "nombre_completo": "...", "password": "..." }`
- **Validation:** `cedula` must be 6–12 digits; `password` must be >= 8 chars with at least one letter and one number.
- **Success (201):** `{ "message": "Usuario registrado con éxito", "user": { cedula, nombre_completo, rol: "estudiante" } }`
- > Note: creates the account only — does **not** enroll in any course or issue certificates.

### 17. List Enrolled Courses (Student)
- **Endpoint:** `GET /api/student/courses`
- **Auth:** `Bearer <token>` (student).
- **Success (200):** array of courses with `progreso_porcentaje` and `fecha_matricula` (see `api_docs.md` §B).

### 18. List Courses (Admin, simplified)
- **Endpoint:** `GET /api/admin/courses/list`
- **Auth:** `Bearer <token>` (admin).
- **Success (200):** `[ { "id": 1, "titulo": "Manipulación de Alimentos" }, ... ]`

### 19. Financial Metrics
- **Endpoint:** `GET /api/admin/financial-metrics`
- **Auth:** `Bearer <token>` — **restricted to `rol: ingeniero_software` only** (enforced server-side; `administrador` receives `403`).
- **Success (200):** aggregate revenue + paid enrollments. Returns PII (cedula/name) — intended for internal audit only.

---

## 🔐 Environment Variables (Backend `.env`)

| Variable | Purpose |
|---|---|
| `PORT` | Server port (default 5000). |
| `NODE_ENV` | `production` masks 5xx error details. |
| `JWT_SECRET` | JWT signing key — **required**, >= 32 chars (64 recommended). Server aborts on placeholder/missing. |
| `ALLOWED_ORIGINS` | Comma-separated CORS allowlist. |
| `TRUST_PROXY_HOPS` | `trust proxy` value for `req.ip`/rate-limiting behind a load balancer. |
| `FRONTEND_URL` | Base URL used in email/PDF links. |
| `SMTP_*` | Transactional email config (host/port/secure/user/pass/from). |
| `EMAIL_INCLUDE_PASSWORD` | `true` to embed the provisional password in the welcome email (default `false` — disabled for security). |


