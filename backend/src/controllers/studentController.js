const db = require('../repositories/dbRepository');
const { generateCertificatePDF } = require('../services/pdfService');
const { normalizeToUtf8 } = require('../middleware/auth');
const { sendCertificateEmail } = require('../services/emailService');
const { interpolateTemplate } = require('../services/certificateTemplateService');
const academicTemplateService = require('../services/academicTemplateService');

function generateVerificationCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let r1 = '';
  let r2 = '';
  for (let i = 0; i < 4; i++) {
    r1 += chars.charAt(Math.floor(Math.random() * chars.length));
    r2 += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `ALIM-${r1}-${r2}`;
}

async function getStudentCourses(req, res, next) {
  try {
    const studentCourses = await db.getStudentCourses(req.user.cedula);
    res.json(studentCourses);
  } catch (err) {
    next(err);
  }
}

async function getCourseContent(req, res, next) {
  try {
    let courseId = parseInt(req.query.courseId);
    if (!courseId) {
      const studentCourses = await db.getStudentCourses(req.user.cedula);
      if (studentCourses && studentCourses.length > 0) {
        courseId = studentCourses[0].id;
      } else {
        courseId = 1;
      }
    }
    const modules = await db.getModules(courseId);
    res.json(modules);
  } catch (err) {
    next(err);
  }
}

async function getProgress(req, res, next) {
  try {
    let courseId = parseInt(req.query.courseId);
    if (!courseId) {
      const studentCourses = await db.getStudentCourses(req.user.cedula);
      if (studentCourses && studentCourses.length > 0) {
        courseId = studentCourses[0].id;
      } else {
        courseId = 1;
      }
    }
    const progress = await db.getUserProgress(req.user.cedula, courseId);
    res.json(progress);
  } catch (err) {
    next(err);
  }
}

async function updateProgress(req, res, next) {
  const { modulo_id } = req.body;

  if (!modulo_id) {
    return res.status(400).json({ error: 'El id de módulo es requerido' });
  }

  try {
    const updatedProgress = await db.saveProgress(req.user.cedula, parseInt(modulo_id));
    res.json({
      message: 'Progreso actualizado con éxito',
      ...updatedProgress
    });
  } catch (err) {
    next(err);
  }
}

async function getExamQuestions(req, res, next) {
  try {
    let courseId = parseInt(req.query.courseId);
    if (!courseId) {
      const studentCourses = await db.getStudentCourses(req.user.cedula);
      if (studentCourses && studentCourses.length > 0) {
        courseId = studentCourses[0].id;
      } else {
        courseId = 1;
      }
    }

    // Verify modules are completed
    const progress = await db.getUserProgress(req.user.cedula, courseId);
    const modules = await db.getModules(courseId);
    if (progress.modulos_completados.length < modules.length) {
      return res.status(403).json({ error: `Debe completar los ${modules.length} módulos del curso antes de realizar la evaluación final.` });
    }

    // Check Cooldown
    const status = await db.getExamStatus(req.user.cedula, courseId);
    if (status && status.intentos >= 3 && status.fecha_ultimo_intento) {
      const timeDiff = new Date() - new Date(status.fecha_ultimo_intento);
      const cooldownMs = 10 * 60 * 1000; // 10 mins
      if (timeDiff < cooldownMs) {
        const remainingMin = Math.ceil((cooldownMs - timeDiff) / (60 * 1000));
        return res.status(429).json({ 
          error: `Evaluación bloqueada temporalmente. Por haber fallado 3 o más intentos, debe esperar ${remainingMin} minutos antes de volver a presentarlo.` 
        });
      }
    }

    const questionsPublic = await db.getExamQuestions(courseId);
    res.json(questionsPublic);
  } catch (err) {
    next(err);
  }
}

async function submitExam(req, res, next) {
  const { respuestas } = req.body;
  let courseId = parseInt(req.body.courseId || req.query.courseId);

  if (!courseId) {
    const studentCourses = await db.getStudentCourses(req.user.cedula);
    if (studentCourses && studentCourses.length > 0) {
      courseId = studentCourses[0].id;
    } else {
      courseId = 1;
    }
  }

  if (!respuestas || typeof respuestas !== 'object') {
    return res.status(400).json({ error: 'Las respuestas son requeridas en formato de objeto' });
  }

  try {
    // Verify modules are completed
    const progress = await db.getUserProgress(req.user.cedula, courseId);
    const modules = await db.getModules(courseId);
    if (progress.modulos_completados.length < modules.length) {
      return res.status(403).json({ error: `Debe completar los ${modules.length} módulos del curso antes de enviar la evaluación.` });
    }

    // Check Cooldown
    const status = await db.getExamStatus(req.user.cedula, courseId);
    if (status && status.intentos >= 3 && status.fecha_ultimo_intento) {
      const timeDiff = new Date() - new Date(status.fecha_ultimo_intento);
      const cooldownMs = 10 * 60 * 1000; // 10 mins
      if (timeDiff < cooldownMs) {
        const remainingMin = Math.ceil((cooldownMs - timeDiff) / (60 * 1000));
        return res.status(429).json({ 
          error: `Evaluación bloqueada. Debe esperar ${remainingMin} minutos antes de volver a enviar respuestas.` 
        });
      }
    }

    const dbQuestions = await db.getExamQuestionsWithAnswers(courseId);
    const totalQuestions = dbQuestions.length;

    if (totalQuestions === 0) {
      return res.status(500).json({ error: 'No se encontraron preguntas registradas para este curso.' });
    }

    let correctCount = 0;
    for (const q of dbQuestions) {
      const studentAns = respuestas[q.id.toString()] || respuestas[q.id];
      if (studentAns && studentAns.toUpperCase() === q.respuesta_correcta.toUpperCase()) {
        correctCount++;
      }
    }

    const score = Math.round((correctCount / totalQuestions) * 100);
    const approved = score >= 80;

    const results = await db.submitExam(req.user.cedula, score, approved, courseId);

    if (approved) {
      let cert = await db.getCertificateByCedula(req.user.cedula, courseId);
      if (!cert) {
        const code = generateVerificationCode();
        const count = await db.getCertificatesCount();
        const nextNum = count + 1;
        const numeroCert = `AS-2026-${String(nextNum).padStart(4, '0')}`;
        cert = await db.createCertificate(req.user.cedula, code, score, numeroCert, courseId);
      }

      // Obtener información del curso para el email
      const courses = await db.getCourses();
      const course = courses.find(c => c.id === courseId);
      const courseTitle = course ? course.titulo : 'Manipulación de Alimentos';
      const fullUser = await db.getUser(req.user.cedula);
      const htmlTemplate = course && course.certificado_template
        ? interpolateTemplate(course.certificado_template, fullUser, cert, course)
        : null;

      // Fire-and-forget: enviar email con el certificado PDF adjunto.
      // No bloqueamos la respuesta HTTP aunque el email falle.
      sendCertificateEmail(
        {
          cedula: req.user.cedula,
          nombre_completo: normalizeToUtf8(req.user.nombre_completo),
          email: fullUser?.email || null
        },
        {
          nombre_completo: normalizeToUtf8(req.user.nombre_completo),
          cedula: req.user.cedula,
          fecha_emision: cert.fecha_emision,
          codigo_verificacion: cert.codigo_verificacion,
          calificacion_obtenida: cert.calificacion_obtenida || score,
          numero_certificado: cert.numero_certificado,
          curso_titulo: courseTitle,
          certificado_template: htmlTemplate
        },
        courseTitle
      ).catch((emailErr) => {
        console.error('[studentController] Error al enviar email de certificado:', emailErr.message);
      });
    }

    res.json({
      puntaje: score,
      aprobado: approved,
      intentos: results.intentos,
      message: approved 
        ? `¡Felicidades! Has aprobado con ${score}%. Tu certificado ya está disponible.` 
        : `Has reprobado con ${score}%. Se requiere al menos un 80% para aprobar. Por favor, intenta de nuevo.`
    });
  } catch (err) {
    next(err);
  }
}

async function getCertificateDetail(req, res, next) {
  try {
    let courseId = parseInt(req.query.courseId);
    if (!courseId) {
      const studentCourses = await db.getStudentCourses(req.user.cedula);
      if (studentCourses && studentCourses.length > 0) {
        courseId = studentCourses[0].id;
      } else {
        courseId = 1;
      }
    }

    const cert = await db.getCertificateByCedula(req.user.cedula, courseId);
    if (!cert) {
      return res.status(404).json({ error: 'Certificado no emitido aún.' });
    }

    if (cert.certificado_template) {
      const fullUser = await db.getUser(req.user.cedula);
      const courses = await db.getCourses();
      const course = courses.find(c => c.id === courseId);
      cert.certificado_template = interpolateTemplate(cert.certificado_template, fullUser, cert, course);
    }

    res.json(cert);
  } catch (err) {
    next(err);
  }
}

async function downloadCertificate(req, res, next) {
  try {
    let courseId = parseInt(req.query.courseId);
    if (!courseId) {
      const studentCourses = await db.getStudentCourses(req.user.cedula);
      if (studentCourses && studentCourses.length > 0) {
        courseId = studentCourses[0].id;
      } else {
        courseId = 1;
      }
    }

    const cert = await db.getCertificateByCedula(req.user.cedula, courseId);
    if (!cert) {
      return res.status(400).json({ error: 'Debe completar y aprobar el examen final con al menos un 80% para descargar su certificado.' });
    }

    const courses = await db.getCourses();
    const course = courses.find(c => c.id === courseId);
    const courseTitle = course ? course.titulo : 'Manipulación de Alimentos';

    const fullUser = await db.getUser(req.user.cedula);
    
    let htmlTemplate = null;
    if (course && course.certificacion_directa === 1) {
      htmlTemplate = academicTemplateService.generateDiplomaTemplate(fullUser, cert, course);
    } else {
      htmlTemplate = course && course.certificado_template
        ? interpolateTemplate(course.certificado_template, fullUser, cert, course)
        : null;
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=Certificado_${courseTitle.replace(/\s+/g, '_')}_${req.user.cedula}.pdf`);

    const pdfData = {
      nombre_completo: normalizeToUtf8(req.user.nombre_completo),
      cedula: req.user.cedula,
      fecha_emision: cert.fecha_emision,
      codigo_verificacion: cert.codigo_verificacion,
      calificacion_obtenida: cert.calificacion_obtenida,
      numero_certificado: cert.numero_certificado,
      curso_titulo: courseTitle
    };

    await generateCertificatePDF(res, pdfData, htmlTemplate);
  } catch (err) {
    next(err);
  }
}

async function downloadActa(req, res, next) {
  try {
    let courseId = parseInt(req.query.courseId);
    if (!courseId) {
      const studentCourses = await db.getStudentCourses(req.user.cedula);
      if (studentCourses && studentCourses.length > 0) {
        courseId = studentCourses[0].id;
      } else {
        courseId = 1;
      }
    }

    const cert = await db.getCertificateByCedula(req.user.cedula, courseId);
    if (!cert) {
      return res.status(400).json({ error: 'Debe completar y aprobar la certificación para descargar su acta de grado.' });
    }

    const courses = await db.getCourses();
    const course = courses.find(c => c.id === courseId);
    if (!course || course.certificacion_directa !== 1) {
      return res.status(400).json({ error: 'Este curso no cuenta con acta de grado.' });
    }

    const courseTitle = course.titulo;
    const fullUser = await db.getUser(req.user.cedula);
    const htmlTemplate = academicTemplateService.generateActaTemplate(fullUser, cert, course);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=Acta_de_Grado_${courseTitle.replace(/\s+/g, '_')}_${req.user.cedula}.pdf`);

    await generateCertificatePDF(res, {}, htmlTemplate);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getStudentCourses,
  getCourseContent,
  getProgress,
  updateProgress,
  getExamQuestions,
  submitExam,
  getCertificateDetail,
  downloadCertificate,
  downloadActa
};
