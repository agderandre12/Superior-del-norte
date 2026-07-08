# Gobernanza de Agentes

Este archivo define y documenta la gobernanza de los agentes inteligentes dentro del LMS del **Instituto Superior del Norte** (proyecto `Superior-del-norte`, alias interno `AlimentosLMS`).

> **Nota de alineación (Julio 2026):** la nomenclatura de agentes vivía duplicada entre este archivo (2 agentes de contenido/visual) y `antigravity.config.json` (3 agentes técnicos: `backend_architect`, `frontend_artisan`, `research_devops`). Este archivo es la **fuente canónica** para agentes de producto/contenido; `antigravity.config.json` describe agentes de orquestación técnica de CI/CD. No mezclar ambos taxonomías.

## Agentes Registrados

### Agente Buscador y Redactor de Contenido Curricular
- **Nombre:** Agente Buscador y Redactor de Contenido Curricular
- **Objetivo:** Investigar, estructurar, redactar y validar información académica real y verídica en internet para transformarla en módulos educativos de alta calidad profesional.
- **Responsabilidad:** Asegurar la densidad académica indispensable para cubrir de 8 a 12 módulos independientes por cada curso asignado.

### Agente Diseñador de Identidad Visual y Material Gráfico
- **Nombre:** Agente Diseñador de Identidad Visual y Material Gráfico (Creative Agent)
- **Objetivo:** Conceptualizar, estructurar y generar prompts de alta fidelidad visual para la creación de imágenes fotorrealistas mediante el servicio Nano Banana, destinadas a poblar y embellecer la interfaz pública (Landing Page) y el catálogo de cursos del LMS.
- **Responsabilidad:** Garantizar el cumplimiento estricto del fotorrealismo (cero estilos caricaturescos), mantener la coherencia cromática institucional (Azul Corporativo #0F2C59 y bases neutras), y evocar confianza profesional en el sector de la Manipulación Higiénica de Alimentos.

## Reglas Transversales de Seguridad (aplican a todo agente que genere código)
- Cualquier HTML generado para `certificado_template` o `data_contenido` se renderiza en el cliente vía `dangerouslySetInnerHTML` saneado con DOMPurify (`utils/sanitize.ts`). No delegar la seguridad al frontend únicamente: el backend también debe escapar/validar.
- Nunca introducir secretos (`JWT_SECRET`, credenciales SMTP, contraseñas) en el código o en prompts. Usar variables de entorno (`.env`).
- Respetar el allowlist CORS (`ALLOWED_ORIGINS`) y el rate-limiting existente al proponer nuevos endpoints públicos.
