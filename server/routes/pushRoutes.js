const express = require('express');
const router = express.Router();
const { getVapidPublicKey, subscribe, unsubscribe } = require('../controllers/pushController');
const { verifyToken } = require('../middleware/auth');

router.get('/vapid-public-key', getVapidPublicKey);
router.post('/subscribe', verifyToken, subscribe);
router.post('/unsubscribe', verifyToken, unsubscribe);

module.exports = router;
