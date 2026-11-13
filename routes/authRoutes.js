
const express = require('express');
const router = express.Router();

const authController = require('../controllers/authController');
const { authenticate } = require('../middleware/authMiddleware');

// Register
router.post('/register', authController.register);

router.post('/login', authController.login);

router.get('/profile', authenticate, authController.getProfile);

router.post('/login', (req, res, next) => {
    console.log('LOGIN ROUTE REACHED');
    next();
}, authController.login);

module.exports = router;
