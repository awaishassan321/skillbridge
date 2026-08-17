const { getConnection } = require('../config/db');

const getSkills = async (req, res) => {
    let client;
    try {
        client = await getConnection();
        const result = await client.query(
            `SELECT s.skill_id, s.user_id, s.skill_name, s.category, s.description,
                    s.hourly_rate, s.created_at, u.name, u.location,
                    COALESCE(ROUND(AVG(r.rating)::numeric, 1), 0) AS average_rating,
                    COUNT(r.review_id)::int AS review_count
             FROM skills s
             JOIN users u ON s.user_id = u.user_id
             LEFT JOIN reviews r ON r.reviewee_id = u.user_id
             GROUP BY s.skill_id, u.user_id
             ORDER BY s.created_at DESC`
        );
        res.json({ skills: result.rows });
    } catch (err) {
        console.error('Error getting skills:', err);
        res.status(500).json({ message: err.message });
    } finally {
        if (client) client.release();
    }
};

const addSkill = async (req, res) => {
    let client;
    try {
        const { skillName, category, description, hourlyRate } = req.body;
        const userId = req.user.userId;
        if (!skillName || !category || !description || !hourlyRate) {
            return res.status(400).json({ message: 'Please complete all skill fields.' });
        }
        client = await getConnection();
        await client.query(
            `INSERT INTO skills (user_id, skill_name, category, description, hourly_rate, created_at)
             VALUES ($1, $2, $3, $4, $5, NOW())`,
            [userId, skillName, category, description, hourlyRate]
        );
        res.status(201).json({ message: 'Skill added successfully!' });
    } catch (err) {
        console.error('Error adding skill:', err);
        res.status(500).json({ message: err.message });
    } finally {
        if (client) client.release();
    }
};

const deleteSkill = async (req, res) => {
    let client;
    try {
        client = await getConnection();
        const result = await client.query(
            `DELETE FROM skills WHERE skill_id = $1 AND user_id = $2`,
            [req.params.id, req.user.userId]
        );
        if (result.rowCount === 0) return res.status(404).json({ message: 'Skill not found or access denied.' });
        res.json({ message: 'Skill deleted successfully!' });
    } catch (err) {
        console.error('Error deleting skill:', err);
        res.status(500).json({ message: err.message });
    } finally {
        if (client) client.release();
    }
};

module.exports = { addSkill, getSkills, deleteSkill };
