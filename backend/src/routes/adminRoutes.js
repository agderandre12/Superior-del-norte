const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
router.use(authenticateToken);
router.use(requireAdmin);

router.get('/courses', adminController.getCourses);
router.get('/courses/list', adminController.getCoursesList);
router.post('/courses', adminController.createCourse);
router.get('/metrics', adminController.getMetrics);
router.get('/users', adminController.getUsers);
router.post('/users/create', adminController.createStudent);
router.put('/users/:cedula/courses', adminController.updateStudentCourses);
router.put('/users/:cedula', adminController.updateStudentProfile);
router.put('/courses/:id', adminController.updateCourse);
router.put('/courses/:courseId/modules/:moduleId', adminController.updateCourseModule);
router.get('/certificate/download', adminController.downloadStudentCertificate);
router.get('/certificate/download-acta', adminController.downloadStudentActa);


// Middleware to require engineer software role
function requireSoftwareEngineer(req, res, next) {
  if (!req.user || req.user.rol !== 'ingeniero_software') {
    return res.status(403).json({ error: 'Acceso denegado. Se requiere rol de Ingeniero de Software.' });
  }
  next();
}

router.get('/financial-metrics', requireSoftwareEngineer, adminController.getFinancialMetrics);

module.exports = router;
