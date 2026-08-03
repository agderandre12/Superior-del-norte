'use strict';

const db = require('../repositories/dbRepository');
const { normalizeToUtf8 } = require('../middleware/auth');

const VERIFICATION_CODE_REGEX = /^[A-Za-z0-9]{3,5}-[A-Za-z0-9]{3,6}-[A-Za-z0-9]{3,6}$/;
const MAX_CODE_LENGTH = 50;

/**
 * Public certificate verification endpoint.
 * Validates the verification code format, performs a DB lookup, and returns
 * the certificate's public metadata without exposing internal fields.
 *
 * @param {Object} req - Express request (req.params.codigo)
 * @param {Object} res - Express response
 * @param {Function} next - Express next middleware
 */
async function verifyCertificate(req, res, next) {
  const { codigo } = req.params;

  if (!codigo || codigo.length > MAX_CODE_LENGTH) {
    return res.status(400).json({
      valido: false,
      error: 'Formato de código de verificación inválido.'
    });
  }

  if (!VERIFICATION_CODE_REGEX.test(codigo)) {
    return res.status(400).json({
      valido: false,
      error: 'El código de verificación no cumple con el formato esperado.'
    });
  }

  try {
    // Verification codes are always generated in upper-case (ALIM-XXXX-XXXX).
    // The format regex above tolerates lower-case input, but the DB lookup is
    // case-sensitive, so normalize before querying — otherwise a lower-case
    // code (e.g. from a hand-typed or lower-cased link) would 404 spuriously.
    const cert = await db.getCertificate(codigo.toUpperCase());
    if (!cert) {
      return res.status(404).json({
        valido: false,
        error: 'Código de verificación no válido o certificado inexistente.'
      });
    }

    return res.json({
      valido: true,
      usuario: normalizeToUtf8(cert.nombre_completo),
      nombre_completo: normalizeToUtf8(cert.nombre_completo),
      cedula: cert.cedula,
      fecha_emision: cert.fecha_emision,
      codigo_verificacion: cert.codigo_verificacion,
      calificacion_obtenida: cert.calificacion_obtenida,
      numero_certificado: cert.numero_certificado,
      curso_titulo: normalizeToUtf8(cert.curso_titulo)
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  verifyCertificate
};
