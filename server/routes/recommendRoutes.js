const express = require('express');
const router = express.Router();
const axios = require('axios');
const { pool } = require('../config/db');

router.post('/', async (req, res) => {
    try {
        const { query } = req.body;

        const result = await pool.query(
            `SELECT s.skill_id AS "SKILL_ID", s.user_id AS "USER_ID", s.skill_name AS "SKILL_NAME", s.category AS "CATEGORY",
                    s.description AS "DESCRIPTION", s.hourly_rate AS "HOURLY_RATE", s.image_url AS "IMAGE_URL",
                    u.name AS "NAME", u.location AS "LOCATION",
                    COALESCE(rv.avg_rating, 0) AS "AVG_RATING", COALESCE(rv.review_count, 0) AS "REVIEW_COUNT"
             FROM skillbridge.skills s
             JOIN skillbridge.users u ON s.user_id = u.user_id
             LEFT JOIN (
                 SELECT target_id, ROUND(AVG(rating), 1) AS avg_rating, COUNT(*) AS review_count
                 FROM skillbridge.reviews
                 GROUP BY target_id
             ) rv ON rv.target_id = s.user_id`
        );

        const skills = result.rows;

        const aiModelUrl = process.env.AI_MODEL_URL || 'http://127.0.0.1:5001';
        const aiResponse = await axios.post(`${aiModelUrl}/recommend`, {
            query: query,
            skills: skills
        });

        res.json({ recommendations: aiResponse.data });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
