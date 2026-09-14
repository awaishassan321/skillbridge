const { pool } = require('../config/db');

const uploadAvatar = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No image uploaded' });
        }

        const url = `/uploads/${req.file.filename}`;

        await pool.query(
            `UPDATE skillbridge.users SET avatar_url = $1 WHERE user_id = $2`,
            [url, req.user.userId]
        );

        res.json({ message: 'Avatar updated! ✅', url });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const uploadSkillImage = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No image uploaded' });
        }

        const { id } = req.params;

        const check = await pool.query(
            `SELECT user_id FROM skillbridge.skills WHERE skill_id = $1`,
            [id]
        );

        if (check.rows.length === 0) {
            return res.status(404).json({ message: 'Skill not found' });
        }

        if (check.rows[0].user_id !== req.user.userId && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'You can only update images for your own skills' });
        }

        const url = `/uploads/${req.file.filename}`;

        await pool.query(
            `UPDATE skillbridge.skills SET image_url = $1 WHERE skill_id = $2`,
            [url, id]
        );

        res.json({ message: 'Skill image updated! ✅', url });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

module.exports = { uploadAvatar, uploadSkillImage };
