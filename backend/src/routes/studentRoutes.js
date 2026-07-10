const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');
const { authenticateToken } = require('../middleware/auth');

router.use(authenticateToken);

router.get('/student/courses', studentController.getStudentCourses);
router.get('/course/content', studentController.getCourseContent);
router.get('/course/progress', studentController.getProgress);
router.post('/course/progress', studentController.updateProgress);
router.get('/exam/questions', studentController.getExamQuestions);
router.post('/exam/submit', studentController.submitExam);
router.get('/certificate/detail', studentController.getCertificateDetail);
router.get('/certificate/download', studentController.downloadCertificate);
router.get('/certificate/download-acta', studentController.downloadActa);
router.get('/certificate/download-grades', studentController.downloadGradesCertificate);
router.get('/certificate/download-bachiller-pack', studentController.downloadBachillerDocumentPack);

module.exports = router;
