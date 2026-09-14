const { pool } = require('../config/db');

const getSkills = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT s.skill_id AS "SKILL_ID", s.user_id AS "USER_ID", s.skill_name AS "SKILL_NAME",
                    s.category AS "CATEGORY", s.description AS "DESCRIPTION", s.hourly_rate AS "HOURLY_RATE",
                    s.image_url AS "IMAGE_URL",
                    u.name AS "NAME", u.location AS "LOCATION", u.avatar_url AS "PROVIDER_AVATAR",
                    COALESCE(rv.avg_rating, 0) AS "AVG_RATING", COALESCE(rv.review_count, 0) AS "REVIEW_COUNT"
             FROM skillbridge.skills s
             JOIN skillbridge.users u ON s.user_id = u.user_id
             LEFT JOIN (
                 SELECT target_id, ROUND(AVG(rating), 1) AS avg_rating, COUNT(*) AS review_count
                 FROM skillbridge.reviews
                 GROUP BY target_id
             ) rv ON rv.target_id = s.user_id`
        );

        res.json({ skills: result.rows });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const addSkill = async (req, res) => {
    try {
        const { skillName, category, description, hourlyRate } = req.body;
        const userId = req.user.userId;

        const result = await pool.query(
            `INSERT INTO skillbridge.skills (user_id, skill_name, category, description, hourly_rate, created_at)
             VALUES ($1, $2, $3, $4, $5, NOW())
             RETURNING skill_id`,
            [userId, skillName, category, description, hourlyRate]
        );

        res.status(201).json({ message: 'Skill added successfully! ✅', skillId: result.rows[0].skill_id });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const updateSkill = async (req, res) => {
    try {
        const { id } = req.params;
        const { skillName, category, description, hourlyRate } = req.body;

        const check = await pool.query(
            `SELECT user_id FROM skillbridge.skills WHERE skill_id = $1`,
            [id]
        );

        if (check.rows.length === 0) {
            return res.status(404).json({ message: 'Skill not found' });
        }

        if (check.rows[0].user_id !== req.user.userId && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'You can only edit your own skills' });
        }

        await pool.query(
            `UPDATE skillbridge.skills
             SET skill_name = $1, category = $2, description = $3, hourly_rate = $4
             WHERE skill_id = $5`,
            [skillName, category, description, hourlyRate, id]
        );

        res.json({ message: 'Skill updated successfully! ✅' });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const deleteSkill = async (req, res) => {
    try {
        const { id } = req.params;

        const check = await pool.query(
            `SELECT user_id FROM skillbridge.skills WHERE skill_id = $1`,
            [id]
        );

        if (check.rows.length === 0) {
            return res.status(404).json({ message: 'Skill not found' });
        }

        if (check.rows[0].user_id !== req.user.userId && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'You can only delete your own skills' });
        }

        await pool.query(
            `DELETE FROM skillbridge.skills WHERE skill_id = $1`,
            [id]
        );

        res.json({ message: 'Skill deleted successfully! ✅' });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

module.exports = { addSkill, getSkills, updateSkill, deleteSkill };
