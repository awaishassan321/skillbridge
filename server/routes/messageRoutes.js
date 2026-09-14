const express = require('express');
const router = express.Router();
const { getMessages, sendMessage } = require('../controllers/messageController');
const { verifyToken } = require('../middleware/auth');

router.get('/:id/messages', verifyToken, getMessages);
router.post('/:id/messages', verifyToken, sendMessage);

module.exports = router;
