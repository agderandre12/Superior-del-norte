'use strict';

/**
 * certificateTemplateService.js — Instituto Superior del Norte LMS
 *
 * Centralized certificate template interpolation and management.
 *
 * Provides a single source of truth for the interpolation tags used across:
 *  - studentController.getCertificateDetail()  (on-screen rendering)
 *  - pdfService.generateCertificatePDF()       (PDF generation)
 *  - emailService.generateCertificatePDFBuffer() (email attachments)
 *
 * Supported interpolation tags:
 *   {{NOMBRE}}                  — Student full name
 *   {{CEDULA}}                  — Student national ID
 *   {{FECHA_EXPEDICION}}        — Cédula issue date
 *   {{MUNICIPIO_EXPEDICION}}    — Cédula issue municipality
 *   {{MUNICIPIO_NACIMIENTO}}    — Birth municipality
 *   {{ANIO_NACIMIENTO}}         — Birth year
 *   {{EMAIL}}                   — Student email
 *   {{CODIGO_VERIFICACION}}     — Unique certificate verification code
 *   {{FECHA_EMISION}}           — Certificate issue date
 *   {{CURSO_TITULO}}            — Course title
 *   {{CALIFICACION}}            — Grade obtained (percentage)
 *   {{NUMERO_CERTIFICADO}}      — Sequential registry number
 *   {{INTENSIDAD_HORARIA}}      — Course hours (defaults to 3)
 *   {{DEPARTAMENTO_EXPEDICION}} — Diploma expedition department
 *   {{CIUDAD_EXPEDICION}}       — Diploma expedition city
 *   {{MUNICIPIO}}               — Convenience alias for {{CIUDAD_EXPEDICION}}
 *   {{DEPARTAMENTO}}            — Convenience alias for {{DEPARTAMENTO_EXPEDICION}}
 *   {{LOGRO}}                   — Per-course dynamic achievement / competency text
 */

const TAG_PATTERNS = [
  ['{{NOMBRE}}', 'nombre_completo'],
  ['{{CEDULA}}', 'cedula'],
  ['{{FECHA_EXPEDICION}}', 'fecha_expedicion_cedula'],
  ['{{MUNICIPIO_EXPEDICION}}', 'municipio_expedicion_cedula'],
  ['{{MUNICIPIO_NACIMIENTO}}', 'municipio_nacimiento'],
  ['{{ANIO_NACIMIENTO}}', 'anio_nacimiento'],
  ['{{EMAIL}}', 'email'],
  ['{{CODIGO_VERIFICACION}}', 'codigo_verificacion'],
  ['{{FECHA_EMISION}}', 'fecha_emision'],
  ['{{CURSO_TITULO}}', 'curso_titulo'],
  ['{{CALIFICACION}}', 'calificacion_obtenida'],
  ['{{NUMERO_CERTIFICADO}}', 'numero_certificado'],
  ['{{DEPARTAMENTO_EXPEDICION}}', 'departamento_expedicion'],
  ['{{CIUDAD_EXPEDICION}}', 'ciudad_expedicion'],
  // Convenience aliases for the diploma expedition place (municipio/departamento),
  // matching the fields consumed by the native PDF/HTML renderers.
  ['{{MUNICIPIO}}', 'ciudad_expedicion'],
  ['{{DEPARTAMENTO}}', 'departamento_expedicion'],
  ['{{LOGRO}}', 'certificado_logro'],
];

/**
 * Interpolates a raw HTML template string with user + certificate data.
 * All tags are replaced with safe string values; missing values become empty strings.
 *
 * @param {string|null} template  - Raw HTML template (may contain {{TAG}} placeholders)
 * @param {Object} user           - User record from DB
 * @param {Object} cert           - Certificate record (codigo_verificacion, fecha_emision, etc.)
 * @param {Object} [course]       - Optional course record (curso_titulo, intensidad_horaria)
 * @returns {string}              - Interpolated HTML string, or '' if template is falsy
 */
function interpolateTemplate(template, user, cert, course) {
  if (!template) return '';

  const ctx = { ...(user || {}), ...(cert || {}), ...(course || {}) };

  let result = template;
  for (const [tag, key] of TAG_PATTERNS) {
    const val = ctx[key];
    const safe = (val !== undefined && val !== null) ? String(val) : '';
    result = result.split(tag).join(safe);
  }

  const intensidad = (course && course.intensidad_horaria) ? course.intensidad_horaria : '3';
  result = result.split('{{INTENSIDAD_HORARIA}}').join(intensidad);

  return result;
}

module.exports = {
  interpolateTemplate,
  TAG_PATTERNS
};
