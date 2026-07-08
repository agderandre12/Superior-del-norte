const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { rateLimit } = require('../middleware/rateLimiter');

// Rate limit auth endpoints to mitigate brute-force / credential-stuffing.
// 10 attempts / minute / IP is generous for a human and hostile to a script.
const authLimiter = rateLimit({ windowMs: 60000, max: 10 });

router.post('/login', authLimiter, authController.login);
router.post('/register', authLimiter, authController.register);

module.exports = router;
