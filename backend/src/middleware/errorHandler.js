'use strict';

const isProd = process.env.NODE_ENV === 'production';

// Centralized Express error handler. Mounted as the last middleware.
// SECURITY: never leak internal error details (DB messages, stack traces) to
// clients on 5xx responses — that reveals schema/internals. In development we
// surface the message for debugging; in production we return a generic message.
function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || 500;
  const errorCode = err.code || (statusCode >= 500 ? 'INTERNAL_SERVER_ERROR' : 'ERROR');

  // Always log the full error server-side for observability.
  if (statusCode >= 500) {
    console.error(`[Error ${statusCode}] ${err.message}`, err.stack);
  } else {
    console.warn(`[Client Error ${statusCode}] ${err.message}`);
  }

  // Operational errors (4xx, explicitly thrown ApiErrors) can safely expose
  // their message. Unexpected 5xx errors must be masked in production.
  const safeMessage = statusCode < 500 || !isProd
    ? err.message
    : 'Ocurrió un error interno en el servidor. El equipo técnico ha sido notificado.';

  res.status(statusCode).json({
    success: false,
    error: {
      code: errorCode,
      message: safeMessage
    }
  });
}

module.exports = errorHandler;
