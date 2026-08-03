# CLAUDE.md — Instituto Superior del Norte LMS

Guía raíz para trabajar en este repositorio. Claude Code carga este archivo
automáticamente. La documentación detallada vive en [`.claude/docs/`](.claude/docs/);
**léela antes de cualquier cambio no trivial.**

> Alias interno del proyecto: `AlimentosLMS`. Nombre de negocio: **Instituto
> Superior del Norte**.

---

## 1. Qué es

Plataforma LMS para certificación en **Manipulación Higiénica de Alimentos** (y
otros cursos: Bachiller Académico, Primeros Auxilios, Manejo Defensivo, etc.). El
estudiante accede a contenidos, presenta un examen (≥80% para aprobar) y obtiene
un **certificado PDF** con código de verificación público (`ALIM-XXXX-XXXX`).

Flujo estándar del estudiante:

```
Login → Dashboard → CourseDetail → CourseViewer (módulos) → Exam (≥80%) → Certificate (PDF)
```

Existe además un **portal público de verificación** (`/verify`) para que
terceros (empleadores, autoridades sanitarias) validen un diploma sin autenticarse.

---

## 2. Stack y estructura

Monorepo con dos apps independientes:

| App | Stack | Puerto dev |
|---|---|---|
| `backend/` | Node.js + Express + SQLite3 (fallback JSON) | `5000` |
| `frontend/` | React 19 + Vite 8 + TypeScript + React Router (HashRouter) | `5173` |

Backend en capas: `routes/ → controllers/ → services/ → repositories/`.
Frontend centrado en `context/AppContext.tsx` (Context API) + rutas declarativas
en `App.tsx`.

---

## 3. Cómo ejecutar

```bash
# Backend (desde backend/)
node src/server.js            # requiere backend/.env con JWT_SECRET válido

# Frontend (desde frontend/)
npm run dev                   # Vite en http://localhost:5173
```

- El frontend resuelve la API desde `VITE_API_BASE_URL` (default
  `http://localhost:5000/api`). CORS restringe orígenes vía `ALLOWED_ORIGINS`.
- **El backend se niega a arrancar** si `JWT_SECRET` falta, es un placeholder
  conocido o mide < 32 caracteres.

> ⚠️ **Deuda de seguridad activa:** `backend/.env` trae por defecto el secreto de
> ejemplo (`REPLACE_WITH_A_LONG_RANDOM_SECRET...`). Pasa la validación por longitud
> pero es público. **Regenerar antes de producción:**
> `node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"`.

---

## 4. Convenciones que NO se rompen

Reglas con historial de bugs detrás. Detalle en
[`.claude/docs/buenas-practicas.md`](.claude/docs/buenas-practicas.md).

- **React Router es la única fuente de verdad de navegación.** Usar
  `useNavigate()`. Nunca navegar con `setCurrentView` (estado legacy).
- **Deps primitivas en `useEffect`** (`user?.cedula`, `user?.rol`), nunca el
  objeto `user` completo → evita loops de render infinitos.
- **Fetch functions envueltas en `useCallback`** con `[token]`.
- **Nunca `useEffect([token])` que llame `setUser()`** (recrea `user` → loop).
- **Base de datos: nunca `DROP TABLE`.** Tablas con `CREATE TABLE IF NOT EXISTS`
  y seeding idempotente con `INSERT OR IGNORE`.
- **HTML del backend inyectado con `dangerouslySetInnerHTML` debe pasar por
  `sanitizeHtml()`** (`utils/sanitize.ts`, DOMPurify).
- **Emails fire-and-forget** (sin `await`, con `.catch()`).
- **Roles privilegiados:** la lista canónica es `ADMIN_ROLES` en
  `backend/src/middleware/auth.js` y su espejo en `frontend/src/context/AppContext.tsx`.
  Cambiar ambos a la vez.

---

## 5. Verificación de certificados (área sensible)

Hay **dos** consumidores del endpoint público `GET /api/certificate/verify/:codigo`:
la página `/verify` (`VerifyCertificate.tsx`) y el verificador embebido en la
Home (`HomePage.tsx`).

- Los diplomas **antiguos** imprimen el enlace legacy `.../#verify=CÓDIGO`. Ese
  formato se normaliza a la ruta canónica en
  [`frontend/src/main.tsx`](frontend/src/main.tsx) **antes** de montar el router
  (si no, la ruta comodín `*` redirige a `/` y la verificación nunca corre).
- Los diplomas **nuevos** imprimen la ruta canónica `.../#/verify/CÓDIGO`.
- La búsqueda del código es **case-insensitive** (se normaliza a mayúsculas en
  `publicController.js`).

---

## 6. Documentación detallada

| Documento | Contenido |
|---|---|
| [contexto-sistema.md](.claude/docs/contexto-sistema.md) | Negocio, flujos de usuario, estado actual, brechas |
| [arquitectura.md](.claude/docs/arquitectura.md) | Patrón por capas, estructura de directorios, esquema de BD, roles |
| [buenas-practicas.md](.claude/docs/buenas-practicas.md) | Reglas de código y seguridad (obligatorio) |
| [api.md](.claude/docs/api.md) | Contrato y especificación de endpoints |
| [agentes.md](.claude/docs/agentes.md) | Gobernanza de agentes de contenido/diseño |

---

## 7. Brechas conocidas (prioridad)

1. **IDOR (P0):** los endpoints de estudiante confían en `?courseId=` sin
   verificar matrícula. Falta middleware `requireEnrollment`.
2. **JWT en `localStorage`** → migrar a cookie `HttpOnly; Secure; SameSite=Strict`.
3. **PDF no respeta plantillas HTML por curso** — `pdfService.js` siempre usa el
   layout institucional; las plantillas sólo se ven en pantalla.
4. **Mojibake** parcheado con `normalizeToUtf8`/`decodeMojibake` — resolver en el
   origen (`pragma encoding = 'UTF-8'`).
5. **Validación de payloads** sin `zod` en el backend.
