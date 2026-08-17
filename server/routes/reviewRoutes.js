const express = require('express');
const router = express.Router();
const { addReview, getReviews } = require('../controllers/reviewController');
const { verifyToken } = require('../middleware/auth');

router.get('/:userId', getReviews);
router.post('/', verifyToken, addReview);

module.exports = router;
