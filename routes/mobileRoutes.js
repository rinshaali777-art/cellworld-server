const express = require('express');
const router = express.Router();
const upload = require('../middleware/uploadMiddleware');
const mobileController = require('../controllers/mobileController');

const {
    authenticate,
    adminOnly,
    userOnly
} = require('../middleware/authMiddleware');

// Admin routes
router.post('/add', authenticate, adminOnly, upload.single('image'), mobileController.addMobile);

router.get('/all', authenticate, adminOnly, mobileController.getAllMobiles);

router.put('/update/:id',authenticate,adminOnly,upload.single('image'),mobileController.updateMobile);

router.delete('/delete/:id', authenticate,  adminOnly, mobileController.deleteMobile);

// Admin and user routes
router.get('/search/:imei', authenticate, userOnly, mobileController.searchMobileByIMEI);

router.get('/user/all', authenticate, userOnly, mobileController.getAllMobiles);

router.get('/:id', authenticate, userOnly, mobileController.getSingleMobile);

module.exports = router;