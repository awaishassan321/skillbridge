const { getConnection } = require('../config/db');

const addReview = async (req, res) => {
    let client;
    try {
        const { reviewee_id, rating, review_comment } = req.body;
        const reviewer_id = req.user.userId;

        if (!reviewee_id || !rating) {
            return res.status(400).json({ success: false, message: 'Reviewee ID and rating are required' });
        }

        if (rating < 1 || rating > 5) {
            return res.status(400).json({ success: false, message: 'Rating must be between 1 and 5' });
        }

        client = await getConnection();

        await client.query(
            `INSERT INTO reviews (reviewer_id, reviewee_id, rating, review_comment, created_at)
             VALUES ($1, $2, $3, $4, NOW())`,
            [reviewer_id, reviewee_id, rating, review_comment || null]
        );

        res.status(201).json({ success: true, message: 'Review added successfully ✅' });

    } catch (error) {
        console.error('Error adding review:', error);
        res.status(500).json({ success: false, message: error.message });
    } finally {
        if (client) client.release();
    }
};

const getReviews = async (req, res) => {
    let client;
    try {
        const { userId } = req.params;

        client = await getConnection();

        const result = await client.query(
            `SELECT r.review_id, r.rating, r.review_comment, 
                    TO_CHAR(r.created_at, 'YYYY-MM-DD HH24:MI:SS') as created_at,
                    u.name as reviewer_name, u.email as reviewer_email
             FROM reviews r
             JOIN users u ON r.reviewer_id = u.user_id
             WHERE r.reviewee_id = $1
             ORDER BY r.created_at DESC`,
            [userId]
        );

        res.json({ success: true, reviews: result.rows });

    } catch (error) {
        console.error('Error getting reviews:', error);
        res.status(500).json({ success: false, message: error.message });
    } finally {
        if (client) client.release();
    }
};

const deleteReview = async (req, res) => {
    let client;
    try {
        const { id } = req.params;
        const userId = req.user.userId;

        client = await getConnection();

        const checkResult = await client.query(
            `SELECT reviewer_id FROM reviews WHERE review_id = $1`,
            [id]
        );

        if (checkResult.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Review not found' });
        }

        if (checkResult.rows[0].reviewer_id !== userId) {
            return res.status(403).json({ success: false, message: 'You can only delete your own reviews' });
        }

        await client.query(
            `DELETE FROM reviews WHERE review_id = $1`,
            [id]
        );

        res.json({ success: true, message: 'Review deleted successfully ✅' });

    } catch (error) {
        console.error('Error deleting review:', error);
        res.status(500).json({ success: false, message: error.message });
    } finally {
        if (client) client.release();
    }
};

module.exports = { addReview, getReviews, deleteReview };