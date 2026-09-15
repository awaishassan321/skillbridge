const { pool } = require('../config/db');

const addReview = async (req, res) => {
    try {
        const { targetId, rating, comment, requestId } = req.body;
        const reviewerId = req.user.userId;

        if (!targetId || !rating) {
            return res.status(400).json({ message: 'Target and rating are required' });
        }
        if (rating < 1 || rating > 5) {
            return res.status(400).json({ message: 'Rating must be between 1 and 5' });
        }

        // A review tied to a request must actually belong to that requester,
        // and the work must be marked completed, so people can't review a job
        // that was only just accepted (or never happened).
        if (requestId) {
            const reqCheck = await pool.query(
                `SELECT sender_id, receiver_id, status FROM skillbridge.requests WHERE request_id = $1`,
                [requestId]
            );
            if (reqCheck.rows.length === 0) {
                return res.status(404).json({ message: 'Request not found' });
            }
            const { sender_id, receiver_id, status } = reqCheck.rows[0];
            if (sender_id !== reviewerId) {
                return res.status(403).json({ message: 'You can only review your own requests' });
            }
            if (status !== 'completed') {
                return res.status(400).json({ message: 'You can only review completed requests' });
            }
            if (receiver_id !== targetId) {
                return res.status(400).json({ message: 'Target does not match this request' });
            }
        }

        await pool.query(
            `INSERT INTO skillbridge.reviews (reviewer_id, target_id, rating, comment, request_id, created_at)
             VALUES ($1, $2, $3, $4, $5, NOW())`,
            [reviewerId, targetId, rating, comment || null, requestId || null]
        );

        res.status(201).json({ message: 'Review added! ✅' });

    } catch (err) {
        if (err.code === '23505') {
            return res.status(400).json({ message: 'You have already reviewed this request' });
        }
        res.status(500).json({ message: err.message });
    }
};

const getReviews = async (req, res) => {
    try {
        const { userId } = req.params;

        const result = await pool.query(
            `SELECT r.review_id AS "REVIEW_ID", r.rating AS "RATING", r.comment AS "COMMENT",
                    TO_CHAR(r.created_at, 'YYYY-MM-DD') AS "CREATED_AT",
                    u.name AS "REVIEWER_NAME"
             FROM skillbridge.reviews r
             JOIN skillbridge.users u ON r.reviewer_id = u.user_id
             WHERE r.target_id = $1
             ORDER BY r.created_at DESC`,
            [userId]
        );

        res.json({ reviews: result.rows });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

module.exports = { addReview, getReviews };
