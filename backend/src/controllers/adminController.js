const db = require('../repositories/dbRepository');
const { normalizeToUtf8 } = require('../middleware/auth');
const { sendWelcomeEmail, sendCertificateEmail } = require('../services/emailService');
const {
  generateCertificatePDF,
  generateDefaultCertificatePDF,
  generateHTMLCertificatePDF,
  generateGradesCertificatePDF,
  generateGraduationActPDF,
  generateHighSchoolDiplomaPDF,
  generateHighSchoolDocumentPackPDF,
  pdfToBuffer,
  isHighSchoolCourse
} = require('../services/pdfService');
const { interpolateTemplate } = require('../services/certificateTemplateService');
const academicTemplateService = require('../services/academicTemplateService');

async function getCourses(req, res, next) {
  try {
    const courses = await db.getCourses();
    res.json(courses);
  } catch (err) {
    next(err);
  }
}

async function getCoursesList(req, res, next) {
  try {
    const courses = await db.getCourses();
    const simplified = courses.map(c => ({
      id: c.id,
      titulo: normalizeToUtf8(c.titulo)
    }));
    res.json(simplified);
  } catch (err) {
    next(err);
  }
}

async function createCourse(req, res, next) {
  const { titulo, descripcion, imagen_url, modulos, precio, certificado_template } = req.body;

  if (!titulo || !titulo.trim()) {
    return res.status(400).json({ error: 'El título del curso es requerido.' });
  }

  if (precio === undefined || precio === null || precio === '') {
    return res.status(400).json({ error: 'El precio del curso es requerido.' });
  }

  const parsedPrecio = parseFloat(precio);
  if (isNaN(parsedPrecio) || parsedPrecio < 0) {
    return res.status(400).json({ error: 'El precio del curso debe ser un número válido mayor o igual a 0.' });
  }

  if (!modulos || !Array.isArray(modulos) || modulos.length === 0) {
    return res.status(400).json({ error: 'Debe agregar al menos un módulo al curso.' });
  }

  for (let i = 0; i < modulos.length; i++) {
    const mod = modulos[i];
    if (!mod.titulo_modulo || !mod.titulo_modulo.trim() || !mod.tipo_contenido || !mod.data_contenido || !mod.data_contenido.trim()) {
      return res.status(400).json({ 
        error: `El módulo ${i + 1} debe tener título, tipo de contenido y contenido completos.` 
      });
    }
  }

  try {
    const newCourse = await db.createCourse({
      titulo: normalizeToUtf8(titulo),
      descripcion: normalizeToUtf8(descripcion || ''),
      imagen_url: imagen_url || '',
      precio: parsedPrecio,
      certificado_template: certificado_template || '',
      modulos: modulos.map(m => ({
        titulo_modulo: normalizeToUtf8(m.titulo_modulo),
        tipo_contenido: m.tipo_contenido,
        data_contenido: normalizeToUtf8(m.data_contenido)
      }))
    });

    res.status(201).json({
      message: 'Curso creado con éxito junto con sus módulos.',
      curso: newCourse
    });
  } catch (err) {
    next(err);
  }
}

async function getMetrics(req, res, next) {
  try {
    const metrics = await db.getAdminMetrics();
    res.json(metrics);
  } catch (err) {
    next(err);
  }
}

async function getUsers(req, res, next) {
  const { cedula } = req.query;
  try {
    const users = await db.getAdminUsers(cedula);
    const normalizedUsers = users.map(u => ({
      ...u,
      nombre_completo: normalizeToUtf8(u.nombre_completo)
    }));
    res.json(normalizedUsers);
  } catch (err) {
    next(err);
  }
}

async function createStudent(req, res, next) {
  const { 
    cedula, 
    nombre_completo, 
    password, 
    cursos,
    fecha_expedicion_cedula,
    municipio_expedicion_cedula,
    municipio_nacimiento,
    anio_nacimiento,
    pago_realizado,
    certificar_inmediatamente,
    email,
    vipass
  } = req.body;

  if (!cedula || !nombre_completo || !password) {
    return res.status(400).json({ error: 'La cédula, el nombre completo y la contraseña son requeridos.' });
  }

  if (!/^\d+$/.test(cedula)) {
    return res.status(400).json({ error: 'La cédula debe contener únicamente números.' });
  }

  const nameRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/;
  if (!nameRegex.test(nombre_completo)) {
    return res.status(400).json({ error: 'El nombre debe contener únicamente letras y espacios.' });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres.' });
  }

  if (!cursos || !Array.isArray(cursos) || cursos.length === 0) {
    return res.status(400).json({ error: 'Debe seleccionar al menos un curso para matricular al estudiante.' });
  }

  if (!fecha_expedicion_cedula || !municipio_expedicion_cedula || !municipio_nacimiento || !anio_nacimiento) {
    return res.status(400).json({ error: 'La fecha de expedición, el municipio de expedición, el municipio de nacimiento y el año de nacimiento son requeridos.' });
  }

  const cleanEmail = email ? String(email).trim().toLowerCase() : null;
  if (cleanEmail) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      return res.status(400).json({ error: 'El correo electrónico proporcionado no es válido.' });
    }
  }

  const isVip = !!vipass;
  const shouldCertifyImmediately = !!(certificar_inmediatamente || isVip);

  try {
    const existing = await db.getUser(cedula);
    if (existing) {
      return res.status(400).json({ error: 'Un usuario con esta cédula ya se encuentra registrado.' });
    }

    const cleanNombre = normalizeToUtf8(nombre_completo);
    const { user: newUser, certificates } = await db.createStudentWithEnrollment({
      cedula,
      nombre_completo: cleanNombre,
      password,
      metadata: {
        fecha_expedicion_cedula: normalizeToUtf8(fecha_expedicion_cedula),
        municipio_expedicion_cedula: normalizeToUtf8(municipio_expedicion_cedula),
        municipio_nacimiento: normalizeToUtf8(municipio_nacimiento),
        anio_nacimiento: parseInt(anio_nacimiento),
        pago_realizado: pago_realizado ? 1 : 0,
        email: cleanEmail,
        vipass: isVip ? 1 : 0
      },
      cursos,
      certificar_inmediatamente: shouldCertifyImmediately
    });

    // Fire-and-forget certificate emails when bypass/VIP flow ran
    if (shouldCertifyImmediately && certificates.length > 0) {
      const dbCourses = await db.getCourses();
      const fullUser = await db.getUser(cedula);
      certificates.forEach((cert) => {
        const course = dbCourses.find(c => c.id === cert.curso_id);
        const courseTitle = course ? course.titulo : 'Manipulación de Alimentos';
        const htmlTemplate = course && course.certificado_template
          ? interpolateTemplate(course.certificado_template, fullUser, cert, course)
          : null;

        sendCertificateEmail(
          {
            cedula,
            nombre_completo: cleanNombre,
            email: cleanEmail || fullUser?.email || null
          },
          {
            nombre_completo: cleanNombre,
            cedula,
            fecha_emision: cert.fecha_emision,
            codigo_verificacion: cert.codigo_verificacion,
            calificacion_obtenida: cert.calificacion_obtenida,
            numero_certificado: cert.numero_certificado,
            curso_titulo: courseTitle,
            certificado_template: htmlTemplate
          },
          courseTitle
        ).catch((emailErr) => {
          console.error('[adminController] Error al enviar email de certificado de bypass/VIP:', emailErr.message);
        });
      });
    }

    // Welcome email (fire-and-forget). Note: the plaintext password is only
    // embedded when EMAIL_INCLUDE_PASSWORD=true is set on the server; by default
    // the email references the cédula only and the password is delivered via a
    // secure channel. See emailService.sendWelcomeEmail.
    sendWelcomeEmail({
      cedula,
      nombre_completo: cleanNombre,
      password: process.env.EMAIL_INCLUDE_PASSWORD ? password : undefined,
      cursos,
      email: cleanEmail
    }).catch((emailErr) => {
      console.error('[adminController] Error al enviar email de bienvenida:', emailErr.message);
    });

    res.status(201).json({
      message: isVip
        ? 'Estudiante VIP creado, matriculado y certificado con éxito.'
        : 'Estudiante creado y matriculado con éxito.',
      user: {
        cedula: newUser.cedula,
        nombre_completo: newUser.nombre_completo,
        rol: newUser.rol,
        fecha_registro: newUser.fecha_registro,
        fecha_expedicion_cedula: newUser.fecha_expedicion_cedula,
        municipio_expedicion_cedula: newUser.municipio_expedicion_cedula,
        municipio_nacimiento: newUser.municipio_nacimiento,
        anio_nacimiento: newUser.anio_nacimiento,
        pago_realizado: newUser.pago_realizado,
        email: newUser.email || null,
        vipass: newUser.vipass || 0
      }
    });
  } catch (err) {
    next(err);
  }
}

async function updateStudentCourses(req, res, next) {
  const { cedula } = req.params;
  const { cursos } = req.body;

  if (!cursos || !Array.isArray(cursos)) {
    return res.status(400).json({ error: 'Se requiere una lista de cursos válida' });
  }

  try {
    const user = await db.getUser(cedula);
    if (!user) {
      return res.status(404).json({ error: 'El usuario no existe' });
    }

    await db.updateUserCourses(cedula, cursos.map(id => parseInt(id)));
    res.json({ message: 'Matrícula de cursos actualizada con éxito' });
  } catch (err) {
    next(err);
  }
}

async function downloadStudentCertificate(req, res, next) {
  try {
    const { cedula, type } = req.query;
    const courseId = parseInt(req.query.courseId);

    if (!cedula || !courseId) {
      return res.status(400).json({ error: 'La cédula y el id del curso son requeridos.' });
    }

    const student = await db.getUser(cedula);
    if (!student) {
      return res.status(404).json({ error: 'El estudiante no existe.' });
    }

    const cert = await db.getCertificateByCedula(cedula, courseId);
    if (!cert) {
      return res.status(404).json({ error: 'El estudiante no cuenta con un certificado para este curso.' });
    }

    const courses = await db.getCourses();
    const course = courses.find(c => c.id === courseId);
    if (!course) {
      return res.status(404).json({ error: 'El curso no existe.' });
    }
    const courseTitle = course.titulo;

    let buffer;
    let filename;

    switch (type) {
      case 'notas': {
        if (!isHighSchoolCourse(course)) {
          return res.status(400).json({ error: 'El certificado de notas está disponible únicamente para el programa de Bachillerato Académico.' });
        }
        filename = `Certificado_de_Notas_${cedula}.pdf`;
        buffer = await pdfToBuffer(generateGradesCertificatePDF, {
          nombre_completo: normalizeToUtf8(student.nombre_completo),
          cedula: cedula
        }, cert);
        break;
      }
      case 'acta': {
        if (isHighSchoolCourse(course)) {
          filename = `Acta_de_Grado_${cedula}.pdf`;
          buffer = await pdfToBuffer(generateGraduationActPDF, {
            nombre_completo: normalizeToUtf8(student.nombre_completo),
            cedula: cedula
          }, cert);
        } else {
          if (course.certificacion_directa !== 1) {
            return res.status(400).json({ error: 'Este curso no cuenta con acta de grado.' });
          }
          filename = `Acta_de_Grado_${courseTitle.replace(/\s+/g, '_')}_${cedula}.pdf`;
          const htmlTemplate = academicTemplateService.generateActaTemplate(student, cert, course);
          buffer = await generateHTMLCertificatePDF(htmlTemplate);
        }
        break;
      }
      case 'diploma':
      default: {
        if (isHighSchoolCourse(course)) {
          filename = `Diploma_Bachiller_${cedula}.pdf`;
          buffer = await pdfToBuffer(generateHighSchoolDiplomaPDF, {
            nombre_completo: normalizeToUtf8(student.nombre_completo),
            cedula: cedula
          }, cert);
        } else {
          let htmlTemplate = null;
          if (course.certificacion_directa === 1) {
            htmlTemplate = academicTemplateService.generateDiplomaTemplate(student, cert, course);
          } else {
            htmlTemplate = course.certificado_template
              ? interpolateTemplate(course.certificado_template, student, cert, course)
              : null;
          }

          const pdfData = {
            nombre_completo: normalizeToUtf8(student.nombre_completo),
            cedula: cedula,
            fecha_emision: cert.fecha_emision,
            codigo_verificacion: cert.codigo_verificacion,
            calificacion_obtenida: cert.calificacion_obtenida,
            numero_certificado: cert.numero_certificado,
            curso_titulo: courseTitle
          };

          if (htmlTemplate) {
            buffer = await generateHTMLCertificatePDF(htmlTemplate);
          } else {
            buffer = await pdfToBuffer(generateDefaultCertificatePDF, pdfData);
          }
        }
        break;
      }
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
    res.send(buffer);
  } catch (err) {
    next(err);
  }
}

async function downloadStudentActa(req, res, next) {
  try {
    const { cedula } = req.query;
    const courseId = parseInt(req.query.courseId);

    if (!cedula || !courseId) {
      return res.status(400).json({ error: 'La cédula y el id del curso son requeridos.' });
    }

    const student = await db.getUser(cedula);
    if (!student) {
      return res.status(404).json({ error: 'El estudiante no existe.' });
    }

    const cert = await db.getCertificateByCedula(cedula, courseId);
    if (!cert) {
      return res.status(404).json({ error: 'El estudiante no cuenta con un acta de grado para este curso.' });
    }

    const courses = await db.getCourses();
    const course = courses.find(c => c.id === courseId);
    if (!course || course.certificacion_directa !== 1) {
      return res.status(400).json({ error: 'Este curso no cuenta con acta de grado.' });
    }

    let buffer;
    let filename;

    // Bachillerato Académico → native pdfkit acta generator.
    if (isHighSchoolCourse(course)) {
      filename = `Acta_de_Grado_${cedula}.pdf`;
      buffer = await pdfToBuffer(generateGraduationActPDF, {
        nombre_completo: normalizeToUtf8(student.nombre_completo),
        cedula: cedula
      }, cert);
    } else {
      const courseTitle = course.titulo;
      filename = `Acta_de_Grado_${courseTitle.replace(/\s+/g, '_')}_${cedula}.pdf`;
      const htmlTemplate = academicTemplateService.generateActaTemplate(student, cert, course);
      buffer = await generateHTMLCertificatePDF(htmlTemplate);
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
    res.send(buffer);
  } catch (err) {
    next(err);
  }
}

/**
 * Admin endpoint — downloads the Certificado de Notas (CLEI VI) on behalf of
 * a student enrolled in the Bachillerato Académico program.
 */
async function downloadStudentGrades(req, res, next) {
  try {
    const { cedula } = req.query;
    const courseId = parseInt(req.query.courseId);

    if (!cedula || !courseId) {
      return res.status(400).json({ error: 'La cédula y el id del curso son requeridos.' });
    }

    const student = await db.getUser(cedula);
    if (!student) {
      return res.status(404).json({ error: 'El estudiante no existe.' });
    }

    const cert = await db.getCertificateByCedula(cedula, courseId);
    if (!cert) {
      return res.status(404).json({ error: 'El estudiante no cuenta con un certificado de notas para este curso.' });
    }

    const courses = await db.getCourses();
    const course = courses.find(c => c.id === courseId);
    if (!isHighSchoolCourse(course)) {
      return res.status(400).json({ error: 'El certificado de notas está disponible únicamente para el programa de Bachillerato Académico.' });
    }

    const buffer = await pdfToBuffer(generateGradesCertificatePDF, {
      nombre_completo: normalizeToUtf8(student.nombre_completo),
      cedula: cedula
    }, cert);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=Certificado_de_Notas_${cedula}.pdf`);
    res.send(buffer);
  } catch (err) {
    next(err);
  }
}

/**
 * Admin endpoint — downloads the full Bachillerato Académico document
 * ecosystem (Notas + Acta + Diploma) as a single multi-page PDF.
 */
async function downloadStudentBachillerPack(req, res, next) {
  try {
    const { cedula } = req.query;
    const courseId = parseInt(req.query.courseId);

    if (!cedula || !courseId) {
      return res.status(400).json({ error: 'La cédula y el id del curso son requeridos.' });
    }

    const student = await db.getUser(cedula);
    if (!student) {
      return res.status(404).json({ error: 'El estudiante no existe.' });
    }

    const cert = await db.getCertificateByCedula(cedula, courseId);
    if (!cert) {
      return res.status(404).json({ error: 'El estudiante no cuenta con documentos de grado para este curso.' });
    }

    const courses = await db.getCourses();
    const course = courses.find(c => c.id === courseId);
    if (!isHighSchoolCourse(course)) {
      return res.status(400).json({ error: 'El paquete documental está disponible únicamente para el programa de Bachillerato Académico.' });
    }

    const buffer = await pdfToBuffer(generateHighSchoolDocumentPackPDF, {
      nombre_completo: normalizeToUtf8(student.nombre_completo),
      cedula: cedula
    }, cert);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=Documentos_Bachiller_${cedula}.pdf`);
    res.send(buffer);
  } catch (err) {
    next(err);
  }
}

async function updateCourse(req, res, next) {
  const id = parseInt(req.params.id);
  const { titulo, descripcion, precio, certificado_template } = req.body;

  if (isNaN(id)) {
    return res.status(400).json({ error: 'El ID del curso debe ser un número válido.' });
  }

  if (!titulo || !titulo.trim()) {
    return res.status(400).json({ error: 'El título del curso es requerido.' });
  }

  if (precio === undefined || precio === null || precio === '') {
    return res.status(400).json({ error: 'El precio del curso es requerido.' });
  }

  const parsedPrecio = parseFloat(precio);
  if (isNaN(parsedPrecio) || parsedPrecio < 0) {
    return res.status(400).json({ error: 'El precio del curso debe ser un número válido mayor o igual a 0.' });
  }

  try {
    const courses = await db.getCourses();
    const existing = courses.find(c => c.id === id);
    if (!existing) {
      return res.status(404).json({ error: 'El curso no existe.' });
    }

    const updated = await db.updateCourse(id, {
      titulo: normalizeToUtf8(titulo),
      descripcion: normalizeToUtf8(descripcion || ''),
      precio: parsedPrecio,
      certificado_template: certificado_template || ''
    });

    res.json({
      message: 'Curso actualizado con éxito.',
      curso: updated
    });
  } catch (err) {
    next(err);
  }
}

async function updateCourseModule(req, res, next) {
  const courseId = parseInt(req.params.courseId);
  const moduleId = parseInt(req.params.moduleId);
  const { titulo_modulo, tipo_contenido, data_contenido } = req.body;

  if (isNaN(courseId) || isNaN(moduleId)) {
    return res.status(400).json({ error: 'El ID del curso y del módulo deben ser números válidos.' });
  }

  if (!titulo_modulo || !titulo_modulo.trim()) {
    return res.status(400).json({ error: 'El título del módulo es requerido.' });
  }

  if (!tipo_contenido || !tipo_contenido.trim()) {
    return res.status(400).json({ error: 'El tipo de contenido es requerido.' });
  }

  if (data_contenido === undefined || data_contenido === null) {
    return res.status(400).json({ error: 'El contenido del módulo es requerido.' });
  }

  try {
    const updated = await db.updateCourseModule(courseId, moduleId, {
      titulo_modulo: normalizeToUtf8(titulo_modulo),
      tipo_contenido: normalizeToUtf8(tipo_contenido),
      data_contenido: normalizeToUtf8(data_contenido)
    });

    res.json({
      message: 'Módulo actualizado con éxito.',
      modulo: updated
    });
  } catch (err) {
    next(err);
  }
}

async function updateStudentProfile(req, res, next) {
  const { cedula } = req.params;
  const {
    nombre_completo,
    fecha_expedicion_cedula,
    municipio_expedicion_cedula,
    municipio_nacimiento,
    anio_nacimiento,
    pago_realizado
  } = req.body;

  if (!cedula) {
    return res.status(400).json({ error: 'La cédula del estudiante es requerida.' });
  }

  if (!nombre_completo || !nombre_completo.trim()) {
    return res.status(400).json({ error: 'El nombre completo es requerido.' });
  }

  const nameRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/;
  if (!nameRegex.test(nombre_completo)) {
    return res.status(400).json({ error: 'El nombre debe contener únicamente letras y espacios.' });
  }

  if (!fecha_expedicion_cedula || !fecha_expedicion_cedula.trim()) {
    return res.status(400).json({ error: 'La fecha de expedición de la cédula es requerida.' });
  }

  if (!municipio_expedicion_cedula || !municipio_expedicion_cedula.trim()) {
    return res.status(400).json({ error: 'El municipio de expedición de la cédula es requerido.' });
  }

  if (!municipio_nacimiento || !municipio_nacimiento.trim()) {
    return res.status(400).json({ error: 'El municipio de nacimiento es requerido.' });
  }

  if (anio_nacimiento === undefined || anio_nacimiento === null || anio_nacimiento === '') {
    return res.status(400).json({ error: 'El año de nacimiento es requerido.' });
  }

  const parsedAnio = parseInt(anio_nacimiento);
  if (isNaN(parsedAnio) || parsedAnio < 1900 || parsedAnio > new Date().getFullYear()) {
    return res.status(400).json({ error: 'El año de nacimiento debe ser un año válido.' });
  }

  try {
    const existing = await db.getUser(cedula);
    if (!existing || existing.rol !== 'estudiante') {
      return res.status(404).json({ error: 'El estudiante no existe.' });
    }

    const updated = await db.updateStudentProfile(cedula, {
      nombre_completo: normalizeToUtf8(nombre_completo),
      fecha_expedicion_cedula: normalizeToUtf8(fecha_expedicion_cedula),
      municipio_expedicion_cedula: normalizeToUtf8(municipio_expedicion_cedula),
      municipio_nacimiento: normalizeToUtf8(municipio_nacimiento),
      anio_nacimiento: parsedAnio,
      pago_realizado: pago_realizado ? 1 : 0
    });

    res.json({
      message: 'Perfil de estudiante actualizado con éxito.',
      user: updated
    });
  } catch (err) {
    next(err);
  }
}

async function getFinancialMetrics(req, res, next) {
  try {
    const data = await db.getFinancialMetrics();
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: err.message
      }
    });
  }
}

module.exports = {
  getCourses,
  getCoursesList,
  createCourse,
  getMetrics,
  getUsers,
  createStudent,
  updateStudentCourses,
  downloadStudentCertificate,
  downloadStudentActa,
  downloadStudentGrades,
  downloadStudentBachillerPack,
  updateCourse,
  updateCourseModule,
  updateStudentProfile,
  getFinancialMetrics
};
