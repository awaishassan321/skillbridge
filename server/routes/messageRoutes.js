const express = require('express');
const router = express.Router();
const { getMessages, sendMessage, getConversations } = require('../controllers/messageController');
const { verifyToken } = require('../middleware/auth');

router.get('/conversations', verifyToken, getConversations);
router.get('/:id/messages', verifyToken, getMessages);
router.post('/:id/messages', verifyToken, sendMessage);

module.exports = router;
