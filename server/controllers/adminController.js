const { pool } = require('../config/db');

const getAllUsers = async (req, res) => {
    try {
        const result = await pool.query(`SELECT user_id, name, email, location, role, TO_CHAR(created_at, 'YYYY-MM-DD') as created_at FROM skillbridge.users ORDER BY created_at DESC`);
        res.json({ success: true, users: result.rows.map(row => ({ user_id: row.user_id, name: row.name, email: row.email, location: row.location, role: row.role, created_at: row.created_at })) });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

const deleteUser = async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query(`DELETE FROM skillbridge.reviews WHERE reviewer_id = $1 OR target_id = $1`, [id]);
        await pool.query(`DELETE FROM skillbridge.requests WHERE sender_id = $1 OR receiver_id = $1`, [id]);
        await pool.query(`DELETE FROM skillbridge.skills WHERE user_id = $1`, [id]);
        await pool.query(`DELETE FROM skillbridge.users WHERE user_id = $1`, [id]);
        res.json({ success: true, message: 'User deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

const getAllSkills = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT s.skill_id, s.skill_name, s.category, s.hourly_rate, u.name as provider_name,
                   COALESCE(rv.avg_rating, 0) as avg_rating, COALESCE(rv.review_count, 0) as review_count
            FROM skillbridge.skills s
            JOIN skillbridge.users u ON s.user_id = u.user_id
            LEFT JOIN (
                SELECT target_id, ROUND(AVG(rating), 1) AS avg_rating, COUNT(*) AS review_count
                FROM skillbridge.reviews
                GROUP BY target_id
            ) rv ON rv.target_id = s.user_id
        `);
        res.json({ success: true, skills: result.rows.map(row => ({ skill_id: row.skill_id, skill_name: row.skill_name, category: row.category, hourly_rate: row.hourly_rate, avg_rating: row.avg_rating, review_count: row.review_count, provider: { name: row.provider_name } })) });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

const deleteSkill = async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query(`DELETE FROM skillbridge.requests WHERE skill_id = $1`, [id]);
        await pool.query(`DELETE FROM skillbridge.skills WHERE skill_id = $1`, [id]);
        res.json({ success: true, message: 'Skill deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

const getAllRequests = async (req, res) => {
    try {
        const result = await pool.query(`SELECT r.request_id, r.status, s.skill_name, sender.name as sender_name, receiver.name as receiver_name FROM skillbridge.requests r JOIN skillbridge.skills s ON r.skill_id = s.skill_id JOIN skillbridge.users sender ON r.sender_id = sender.user_id JOIN skillbridge.users receiver ON r.receiver_id = receiver.user_id`);
        res.json({ success: true, requests: result.rows.map(row => ({ request_id: row.request_id, status: row.status, skill_name: row.skill_name, sender: { name: row.sender_name }, receiver: { name: row.receiver_name } })) });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

const updateRequestStatus = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    try {
        await pool.query(`UPDATE skillbridge.requests SET status = $1 WHERE request_id = $2`, [status, id]);
        res.json({ success: true, message: 'Status updated' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

const getStats = async (req, res) => {
    try {
        const totalUsers = (await pool.query(`SELECT COUNT(*) FROM skillbridge.users`)).rows[0].count;
        const totalSkills = (await pool.query(`SELECT COUNT(*) FROM skillbridge.skills`)).rows[0].count;
        const totalRequests = (await pool.query(`SELECT COUNT(*) FROM skillbridge.requests`)).rows[0].count;
        res.json({ success: true, stats: { totalUsers, totalSkills, totalRequests } });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

module.exports = { getAllUsers, deleteUser, getAllSkills, deleteSkill, getAllRequests, updateRequestStatus, getStats };
