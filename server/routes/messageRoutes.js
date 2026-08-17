const express = require('express');
const router = express.Router();
const { getMessages, sendMessage, getConversations, getUnreadCount } = require('../controllers/messageController');
const { verifyToken } = require('../middleware/auth');

// Get all conversations for current user
router.get('/conversations', verifyToken, getConversations);

// Get unread message count
router.get('/unread/count', verifyToken, getUnreadCount);

// Get all messages for a request
router.get('/:requestId', verifyToken, getMessages);

// Send a new message
router.post('/', verifyToken, sendMessage);

module.exports = router;
