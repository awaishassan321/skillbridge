const express = require('express');
const router = express.Router();
const { sendRequest, getRequests, updateRequest } = require('../controllers/requestController');
const { verifyToken } = require('../middleware/auth');

// Get all requests for logged in user
router.get('/', verifyToken, getRequests);

// Send a service request
router.post('/', verifyToken, sendRequest);

// Update request status (accept/reject)
router.put('/:id', verifyToken, updateRequest);

module.exports = router;