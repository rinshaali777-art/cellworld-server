
const express = require('express');
const router = express.Router();

const userController = require('../controllers/userController');

const {
    authenticate,
    adminOnly
} = require('../middleware/authMiddleware');

// All routes require admin authentication
router.use(authenticate, adminOnly);

// Get all users and search
router.get('/all', userController.getAllUsers);

// Get single user
router.get('/:id', userController.getSingleUser);

// Block or activate user
router.put('/status/:id', userController.updateUserStatus);

// Delete user
router.delete('/:id', userController.deleteUser);

module.exports = router;
