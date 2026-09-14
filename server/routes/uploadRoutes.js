const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const { uploadAvatar, uploadSkillImage } = require('../controllers/uploadController');
const { verifyToken } = require('../middleware/auth');

router.post('/avatar', verifyToken, upload.single('avatar'), uploadAvatar);
router.post('/skill/:id', verifyToken, upload.single('image'), uploadSkillImage);

module.exports = router;
