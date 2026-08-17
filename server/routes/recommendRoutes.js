const express = require('express');
const router = express.Router();
const axios = require('axios');

router.post('/', async (req, res) => {
    try {
        const { query } = req.body;

        if (!query || query.trim() === '') {
            return res.status(400).json({ 
                success: false, 
                message: 'Search query is required' 
            });
        }

        // AI model ko request bhejo (Python Flask)
        const aiResponse = await axios.post('http://localhost:5001/recommend', {
            query: query
        });

        res.json({
            success: true,
            recommendations: aiResponse.data.recommendations || []
        });

    } catch (error) {
        console.error('AI Recommend Error:', error.message);
        
        // Fallback: Local search logic
        try {
            const { getConnection } = require('../config/db');
            const client = await getConnection();
            
            const result = await client.query(
                `SELECT s.skill_id, s.skill_name, s.category, s.description, 
                        s.hourly_rate, u.name, u.location
                 FROM skills s
                 JOIN users u ON s.user_id = u.user_id
                 WHERE LOWER(s.skill_name) LIKE LOWER($1)
                    OR LOWER(s.category) LIKE LOWER($1)
                    OR LOWER(s.description) LIKE LOWER($1)
                 LIMIT 10`,
                [`%${query}%`]
            );
            
            client.release();
            
            res.json({
                success: true,
                recommendations: result.rows,
                source: 'local'
            });
        } catch (dbError) {
            res.status(500).json({ 
                success: false, 
                message: 'Error processing search' 
            });
        }
    }
});

module.exports = router;