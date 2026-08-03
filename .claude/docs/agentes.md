# Gobernanza de Agentes

Define la gobernanza de los agentes inteligentes del LMS del **Instituto Superior
del Norte** (proyecto `Superior-del-norte`, alias interno `AlimentosLMS`).

> **Nota histórica (Julio 2026):** la taxonomía de agentes vivía duplicada entre
> este archivo (agentes de contenido/visual) y el antiguo `antigravity.config.json`
> (agentes técnicos de orquestación). Al migrar la documentación a `.claude/`, se
> consolidó todo aquí y se eliminó `antigravity.config.json`. Los agentes técnicos
> quedan documentados en §2 como referencia de roles, no como configuración
> ejecutable.

---

## 1. Agentes de producto / contenido

### Agente Buscador y Redactor de Contenido Curricular
- **Objetivo:** investigar, estructurar, redactar y validar información académica
  real y verídica para transformarla en módulos educativos profesionales.
- **Responsabilidad:** asegurar la densidad académica para cubrir de 8 a 12
  módulos independientes por curso.

### Agente Diseñador de Identidad Visual y Material Gráfico
- **Objetivo:** conceptualizar y generar prompts de alta fidelidad para imágenes
  fotorrealistas que pueblen la landing pública y el catálogo de cursos.
- **Responsabilidad:** fotorrealismo estricto (cero estilos caricaturescos),
  coherencia cromática institucional (Azul `#0F2C59` y bases neutras) y confianza
  profesional en el sector de Manipulación Higiénica de Alimentos.

---

## 2. Roles técnicos (referencia de responsabilidades)

Roles heredados de la orquestación original. Útiles como guía de responsabilidades
al dividir tareas de desarrollo:

| Rol | Enfoque | Tareas típicas |
|---|---|---|
| `backend_architect` | API & DB | Auth por cédula, esquema de BD para cursos multimedia, lógica de examen y certificado. Reglas: Clean Code, KISS. |
| `frontend_artisan` | UI/UX | Login con validación, Home con curso asignado, reproductor multimedia, descarga de certificado. Reglas: KISS, Responsive UI. |
| `research_devops` | Documentación y despliegue | Librerías PDF, hosting y dominio, resolver bloqueos de integración. |

---

## 3. Reglas transversales de seguridad (todo agente que genere código)

- Cualquier HTML generado para `certificado_template` o `data_contenido` se
  renderiza en el cliente vía `dangerouslySetInnerHTML` **saneado con DOMPurify**
  (`utils/sanitize.ts`). No delegar la seguridad sólo al frontend: el backend
  también debe escapar/validar.
- **Nunca** introducir secretos (`JWT_SECRET`, credenciales SMTP, contraseñas) en
  el código ni en prompts. Usar variables de entorno (`.env`).
- Respetar el allowlist CORS (`ALLOWED_ORIGINS`) y el rate-limiting existente al
  proponer nuevos endpoints públicos.
- Ver [buenas-practicas.md](buenas-practicas.md) para el conjunto completo de
  reglas de código y seguridad.
