/**
 * emailService.js — Instituto Superior del Norte LMS
 *
 * Capa de servicio para envío de emails transaccionales.
 *
 * Modo de operación:
 *  - Si SMTP_USER y SMTP_PASS están vacíos en .env → usa Ethereal Email (pruebas).
 *    El link de previsualización se imprime en consola. No se envían emails reales.
 *  - Si SMTP_USER y SMTP_PASS están configurados → usa el transporte SMTP definido
 *    en las variables de entorno (Gmail, SendGrid, Mailtrap, etc.).
 *
 * Funciones exportadas:
 *  - sendWelcomeEmail(studentData)           → Disparado al crear un estudiante
 *  - sendCertificateEmail(studentData, pdfBuffer, courseTitle) → Disparado al aprobar
 */

'use strict';

const nodemailer = require('nodemailer');
const { Writable } = require('stream');
const pdfService = require('./pdfService');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

/**
 * Crea y devuelve un transporte Nodemailer.
 * Si no hay credenciales SMTP configuradas, genera automáticamente
 * una cuenta de prueba en Ethereal Email.
 * @returns {Promise<nodemailer.Transporter>}
 */
async function getTransporter() {
  const smtpUser = process.env.SMTP_USER?.trim();
  const smtpPass = process.env.SMTP_PASS?.trim();

  // Si hay credenciales SMTP configuradas, usar el transporte real
  if (smtpUser && smtpPass) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.ethereal.email',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: smtpUser,
        pass: smtpPass
      }
    });
  }

  // Modo de desarrollo: crear cuenta efímera en Ethereal
  console.log('[emailService] SMTP_USER no configurado. Generando cuenta Ethereal para pruebas...');
  const testAccount = await nodemailer.createTestAccount();
  console.log(`[emailService] Cuenta Ethereal generada: ${testAccount.user}`);

  return nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass
    }
  });
}

/**
 * Generates the PDF of the certificate in a Buffer in memory
 * for attachment to an email. When an interpolated HTML template is provided,
 * uses the Puppeteer HTML→PDF path; otherwise falls back to pdfkit default.
 *
 * @param {Object} data              - Certificate data for the default pdfkit layout
 * @param {string|null} htmlTemplate - Interpolated HTML template (optional)
 * @returns {Promise<Buffer>}
 */
async function generateCertificatePDFBuffer(data, htmlTemplate = null) {
  if (htmlTemplate) {
    return pdfService.generateHTMLCertificatePDF(htmlTemplate);
  }

  return new Promise((resolve, reject) => {
    const chunks = [];
    const stream = new Writable({
      write(chunk, encoding, callback) {
        chunks.push(chunk);
        callback();
      }
    });

    stream.on('finish', () => {
      resolve(Buffer.concat(chunks));
    });

    stream.on('error', (err) => {
      reject(err);
    });

    try {
      pdfService.generateDefaultCertificatePDF(stream, data);
    } catch (e) {
      reject(e);
    }
  });
}

/**
 * Envía un email de bienvenida al estudiante recién creado.
 * Incluye sus credenciales de acceso (cédula y contraseña provisional).
 * Nota: Se llama con fire-and-forget (sin await) desde el controlador.
 *
 * @param {Object} studentData
 * @param {string} studentData.cedula
 * @param {string} studentData.nombre_completo
 * @param {string} studentData.password   - Contraseña en texto plano (antes de hashear)
 * @param {string[]} studentData.cursos   - IDs de cursos matriculados
 */
async function sendWelcomeEmail(studentData) {
  try {
    const transporter = await getTransporter();
    const fromAddress = process.env.SMTP_FROM || 'Instituto Superior del Norte LMS <noreply@institutosuperiordelnorte.co>';
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const recipientEmail = studentData.email || `${studentData.cedula}@institutosuperiordelnorte-student.co`;

    // SECURITY: emailing plaintext passwords through SMTP leaks credentials
    // at rest in every recipient mailbox (OWASP A02:2021). Disabled by default.
    // Operators may opt-in per-deployment via EMAIL_INCLUDE_PASSWORD=true when a
    // secure channel reset flow is not yet available.
    const includePassword = String(process.env.EMAIL_INCLUDE_PASSWORD || '').toLowerCase() === 'true';
    const credentialBlock = includePassword && studentData.password
      ? `
                          <p style="margin:0 0 4px;color:#64748b;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">Cédula de acceso</p>
                          <p style="margin:0 0 18px;color:#0F2C59;font-size:22px;font-weight:700;font-family:monospace;">${studentData.cedula}</p>
                          <p style="margin:0 0 4px;color:#64748b;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">Contraseña provisional</p>
                          <p style="margin:0;color:#0F2C59;font-size:22px;font-weight:700;font-family:monospace;">${studentData.password}</p>`
      : `
                          <p style="margin:0 0 4px;color:#64748b;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">Cédula de acceso</p>
                          <p style="margin:0;color:#0F2C59;font-size:22px;font-weight:700;font-family:monospace;">${studentData.cedula}</p>
                          <p style="margin:14px 0 0;color:#64748b;font-size:13px;line-height:1.6;">Por razones de seguridad, tu contraseña provisional te será entregada por un canal seguro por el equipo administrativo. Cambiala tras tu primer ingreso.</p>`;

    const mailOptions = {
      from: fromAddress,
      to: `"${studentData.nombre_completo}" <${recipientEmail}>`,
      subject: '¡Bienvenido a Instituto Superior del Norte LMS! Tus credenciales de acceso',
      html: `
        <!DOCTYPE html>
        <html lang="es">
        <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
        <body style="margin:0;padding:0;background-color:#f0f4f8;font-family:'Helvetica Neue',Arial,sans-serif;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f0f4f8;padding:30px 0;">
            <tr><td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 16px rgba(0,0,0,0.1);">
                <!-- Header -->
                <tr>
                  <td style="background:linear-gradient(135deg,#0F2C59 0%,#1a4a8a 100%);padding:40px 40px 30px;text-align:center;">
                    <h1 style="color:#D4AF37;margin:0;font-size:28px;font-weight:800;letter-spacing:1px;">Instituto Superior del Norte</h1>
                    <p style="color:#a8c4e0;margin:8px 0 0;font-size:14px;">Plataforma de Certificación en Manipulación de Alimentos</p>
                  </td>
                </tr>
                <!-- Body -->
                <tr>
                  <td style="padding:40px;">
                    <h2 style="color:#0F2C59;margin:0 0 16px;font-size:22px;">¡Bienvenido, ${studentData.nombre_completo}! 👋</h2>
                    <p style="color:#475569;line-height:1.7;margin:0 0 24px;">
                      Tu cuenta de estudiante ha sido creada exitosamente en la plataforma <strong>Instituto Superior del Norte LMS</strong>.
                      A continuación encontrarás tus credenciales de acceso. Guárdalas en un lugar seguro.
                    </p>
                    <!-- Credentials Box -->
                    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border:2px solid #e2e8f0;border-radius:10px;margin-bottom:28px;">
                      <tr>
                        <td style="padding:24px;">
                          ${credentialBlock}
                        </td>
                      </tr>
                    </table>
                    <p style="color:#64748b;font-size:13px;line-height:1.6;margin:0 0 28px;">
                      ⚠️ Por razones de seguridad, te recomendamos cambiar tu contraseña después del primer inicio de sesión.
                    </p>
                    <!-- CTA Button -->
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td align="center">
                          <a href="${frontendUrl}" style="display:inline-block;background:linear-gradient(135deg,#4E9F3D,#3d8030);color:#ffffff;text-decoration:none;padding:14px 36px;border-radius:8px;font-size:16px;font-weight:700;letter-spacing:0.5px;">
                            Acceder a la Plataforma →
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <!-- Footer -->
                <tr>
                  <td style="background:#f8fafc;padding:20px 40px;border-top:1px solid #e2e8f0;text-align:center;">
                    <p style="color:#94a3b8;font-size:12px;margin:0;">
                      Este email fue generado automáticamente por Instituto Superior del Norte LMS.<br>
                      Si no esperabas este mensaje, por favor ignóralo.
                    </p>
                  </td>
                </tr>
              </table>
            </td></tr>
          </table>
        </body>
        </html>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`[emailService] ✅ Email de bienvenida enviado para cédula ${studentData.cedula}`);

    // En modo Ethereal, imprime el URL de previsualización
    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
      console.log(`[emailService] 📧 PREVIEW (Ethereal): ${previewUrl}`);
    }
  } catch (err) {
    console.error(`[emailService] ❌ Error enviando email de bienvenida para ${studentData.cedula}:`, err.message);
  }
}

/**
 * Envía un email de felicitaciones al estudiante que aprobó el examen,
 * adjuntando el certificado PDF oficial.
 * Nota: Se llama con fire-and-forget (sin await) desde el controlador.
 *
 * @param {Object} studentData
 * @param {string} studentData.cedula
 * @param {string} studentData.nombre_completo
 * @param {Object} certData - Datos del certificado para generar el PDF
 * @param {string} courseTitle - Título del curso
 */
async function sendCertificateEmail(studentData, certData, courseTitle) {
  try {
    console.log(`[EMAIL SERVICE] Intentando enviar certificado para la cédula ${studentData.cedula} en el curso ${courseTitle}`);
    
    const transporter = await getTransporter();
    const fromAddress = process.env.SMTP_FROM || 'Instituto Superior del Norte LMS <noreply@institutosuperiordelnorte.co>';
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const recipientEmail = studentData.email || `${studentData.cedula}@institutosuperiordelnorte-student.co`;

    const db = require('../repositories/dbRepository');

    const courses = await db.getCourses();
    const course = courses.find(c => c.id === certData.curso_id);
    const isDirect = course && course.certificacion_directa === 1;
    const isHighSchool = pdfService.isHighSchoolCourse(course);

    let attachments = [];
    let subject = `🎓 ¡Felicitaciones! Tu certificado de "${courseTitle}" está listo`;
    let bodyHtml = '';

    if (isHighSchool) {
      subject = `🎓 ¡Felicitaciones! Tus documentos oficiales de Bachiller Académico están listos`;

      const fullUser = await db.getUser(studentData.cedula);
      const studentPayload = {
        nombre_completo: fullUser ? fullUser.nombre_completo : studentData.nombre_completo,
        cedula: studentData.cedula
      };

      // Native pdfkit 3-document ecosystem — no Puppeteer dependency.
      const gradesBuffer = await pdfService.pdfToBuffer(pdfService.generateGradesCertificatePDF, studentPayload, certData);
      const actaBuffer = await pdfService.pdfToBuffer(pdfService.generateGraduationActPDF, studentPayload, certData);
      const diplomaBuffer = await pdfService.pdfToBuffer(pdfService.generateHighSchoolDiplomaPDF, studentPayload, certData);

      attachments.push({
        filename: `Certificado_de_Notas_${studentData.cedula}.pdf`,
        content: gradesBuffer,
        contentType: 'application/pdf'
      });
      attachments.push({
        filename: `Acta_de_Grado_${studentData.cedula}.pdf`,
        content: actaBuffer,
        contentType: 'application/pdf'
      });
      attachments.push({
        filename: `Diploma_Bachiller_${studentData.cedula}.pdf`,
        content: diplomaBuffer,
        contentType: 'application/pdf'
      });

      bodyHtml = `
        <!DOCTYPE html>
        <html lang="es">
        <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
        <body style="margin:0;padding:0;background-color:#f0f4f8;font-family:'Helvetica Neue',Arial,sans-serif;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f0f4f8;padding:30px 0;">
            <tr><td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 16px rgba(0,0,0,0.1);">
                <!-- Header -->
                <tr>
                  <td style="background:linear-gradient(135deg,#0F2C59 0%,#1e3d73 100%);padding:40px 40px 30px;text-align:center;">
                    <div style="font-size:48px;margin-bottom:12px;">🎓</div>
                    <h1 style="color:#ffffff;margin:0;font-size:26px;font-weight:800;">¡Título de Bachiller Académico!</h1>
                    <p style="color:#D4AF37;margin:8px 0 0;font-size:14px;font-weight:600;letter-spacing:1px;">INSTITUTO SUPERIOR DEL NORTE</p>
                  </td>
                </tr>
                <!-- Body -->
                <tr>
                  <td style="padding:40px;">
                    <h2 style="color:#0F2C59;margin:0 0 16px;font-size:20px;">¡Felicitaciones, ${studentData.nombre_completo}!</h2>
                    <p style="color:#475569;line-height:1.7;margin:0 0 24px;">
                       Nos complace informarte que has culminado exitosamente los requisitos del programa de
                       <strong style="color:#0F2C59;">"Bachillerato Académico"</strong>.
                    </p>
                     <p style="color:#475569;line-height:1.7;margin:0 0 24px;">
                       Se han generado dinámicamente y de manera paralela tus tres documentos oficiales: el <strong>Certificado de Notas</strong>, el <strong>Acta de Grado</strong> y el <strong>Diploma de Bachiller</strong> correspondientes, emitidos en la ciudad de Medellín, Colombia.
                     </p>
                     <p style="color:#475569;line-height:1.7;margin:0 0 24px;">
                       Los tres documentos oficiales en formato PDF se encuentran adjuntos en este correo electrónico. También puedes descargarlos y visualizarlos en tu portal de estudiante en cualquier momento.
                     </p>
                    <!-- Certificate Info -->
                    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0fdf4;border:2px solid #86efac;border-radius:10px;margin-bottom:28px;">
                      <tr>
                        <td style="padding:20px 24px;">
                          <table width="100%">
                            <tr>
                              <td style="color:#64748b;font-size:12px;font-weight:600;text-transform:uppercase;padding-bottom:4px;">N° Certificado</td>
                              <td style="color:#64748b;font-size:12px;font-weight:600;text-transform:uppercase;padding-bottom:4px;">Código de Verificación</td>
                            </tr>
                            <tr>
                              <td style="color:#166534;font-size:18px;font-weight:700;font-family:monospace;">${certData.numero_certificado}</td>
                              <td style="color:#166534;font-size:18px;font-weight:700;font-family:monospace;">${certData.codigo_verificacion}</td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                    <!-- CTA Buttons -->
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td align="center" style="padding-bottom:12px;">
                          <a href="${frontendUrl}/#verify=${certData.codigo_verificacion}" style="display:inline-block;background:linear-gradient(135deg,#0F2C59,#1a4a8a);color:#ffffff;text-decoration:none;padding:14px 36px;border-radius:8px;font-size:15px;font-weight:700;">
                            Verificar Autenticidad en Línea →
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <!-- Footer -->
                <tr>
                  <td style="background:#f8fafc;padding:20px 40px;border-top:1px solid #e2e8f0;text-align:center;">
                    <p style="color:#94a3b8;font-size:12px;margin:0;">
                      Título oficial emitido por Instituto Superior del Norte LMS | N° ${certData.numero_certificado}<br>
                      Fecha de graduación: ${certData.fecha_emision}
                    </p>
                  </td>
                </tr>
              </table>
            </td></tr>
          </table>
        </body>
        </html>
      `;
    } else {
      const pdfBuffer = await generateCertificatePDFBuffer(certData, certData.certificado_template || null);
      attachments.push({
        filename: `Certificado_${courseTitle.replace(/\s+/g, '_')}_${studentData.cedula}.pdf`,
        content: pdfBuffer,
        contentType: 'application/pdf'
      });

      bodyHtml = `
        <!DOCTYPE html>
        <html lang="es">
        <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
        <body style="margin:0;padding:0;background-color:#f0f4f8;font-family:'Helvetica Neue',Arial,sans-serif;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f0f4f8;padding:30px 0;">
            <tr><td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 16px rgba(0,0,0,0.1);">
                <!-- Header -->
                <tr>
                  <td style="background:linear-gradient(135deg,#4E9F3D 0%,#2d7a1f 100%);padding:40px 40px 30px;text-align:center;">
                    <div style="font-size:48px;margin-bottom:12px;">🎓</div>
                    <h1 style="color:#ffffff;margin:0;font-size:26px;font-weight:800;">¡Certificado Emitido!</h1>
                    <p style="color:#b7e8a8;margin:8px 0 0;font-size:14px;">Has completado exitosamente el curso</p>
                  </td>
                </tr>
                <!-- Body -->
                <tr>
                  <td style="padding:40px;">
                    <h2 style="color:#0F2C59;margin:0 0 16px;font-size:20px;">¡Felicitaciones, ${studentData.nombre_completo}!</h2>
                    <p style="color:#475569;line-height:1.7;margin:0 0 24px;">
                       Has aprobado exitosamente la evaluación del curso 
                       <strong style="color:#0F2C59;">"${courseTitle}"</strong> 
                       con una calificación de <strong style="color:#4E9F3D;">${certData.calificacion_obtenida}%</strong>.
                    </p>
                    <p style="color:#475569;line-height:1.7;margin:0 0 24px;">
                      Tu certificado oficial está adjunto en este correo en formato PDF. También puedes descargarlo
                      directamente desde la plataforma o verificar su autenticidad en cualquier momento.
                    </p>
                    <!-- Certificate Info -->
                    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0fdf4;border:2px solid #86efac;border-radius:10px;margin-bottom:28px;">
                      <tr>
                        <td style="padding:20px 24px;">
                          <table width="100%">
                            <tr>
                              <td style="color:#64748b;font-size:12px;font-weight:600;text-transform:uppercase;padding-bottom:4px;">N° Certificado</td>
                              <td style="color:#64748b;font-size:12px;font-weight:600;text-transform:uppercase;padding-bottom:4px;">Código de Verificación</td>
                            </tr>
                            <tr>
                              <td style="color:#166534;font-size:18px;font-weight:700;font-family:monospace;">${certData.numero_certificado}</td>
                              <td style="color:#166534;font-size:18px;font-weight:700;font-family:monospace;">${certData.codigo_verificacion}</td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                    <!-- CTA Buttons -->
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td align="center" style="padding-bottom:12px;">
                          <a href="${frontendUrl}/#verify=${certData.codigo_verificacion}" style="display:inline-block;background:linear-gradient(135deg,#0F2C59,#1a4a8a);color:#ffffff;text-decoration:none;padding:14px 36px;border-radius:8px;font-size:15px;font-weight:700;">
                            Verificar Certificado →
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <!-- Footer -->
                <tr>
                  <td style="background:#f8fafc;padding:20px 40px;border-top:1px solid #e2e8f0;text-align:center;">
                    <p style="color:#94a3b8;font-size:12px;margin:0;">
                      Certificado emitido por Instituto Superior del Norte LMS | N° ${certData.numero_certificado}<br>
                      Fecha de emisión: ${certData.fecha_emision}
                    </p>
                  </td>
                </tr>
              </table>
            </td></tr>
          </table>
        </body>
        </html>
      `;
    }

    const mailOptions = {
      from: fromAddress,
      to: `"${studentData.nombre_completo}" <${recipientEmail}>`,
      subject: subject,
      html: bodyHtml,
      attachments: attachments
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`[emailService] ✅ Email de certificado enviado para cédula ${studentData.cedula}`);

    // En modo Ethereal, imprime el URL de previsualización
    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
      console.log(`[EMAIL SERVICE] URL de previsualización Ethereal generado: ${previewUrl}`);
    }
  } catch (err) {
    console.error(`[emailService] ❌ Error enviando email de certificado para ${studentData.cedula}:`, err.message);
  }
}

module.exports = {
  sendWelcomeEmail,
  sendCertificateEmail
};
