const { getConnection } = require('../config/db');

const getAllUsers = async (req, res) => {
    let client;
    try {
        client = await getConnection();
        const result = await client.query(
            `SELECT user_id, name, email, location, role, TO_CHAR(created_at, 'YYYY-MM-DD') as created_at 
             FROM users ORDER BY created_at DESC`
        );
        res.json({ success: true, users: result.rows });
    } catch (error) {
        console.error('Error in getAllUsers:', error);
        res.status(500).json({ success: false, message: error.message });
    } finally {
        if (client) client.release();
    }
};

const deleteUser = async (req, res) => {
    let client;
    const { id } = req.params;
    try {
        client = await getConnection();
        
        await client.query(`DELETE FROM reviews WHERE reviewer_id = $1 OR reviewee_id = $1`, [id]);
        await client.query(`DELETE FROM requests WHERE sender_id = $1 OR receiver_id = $1`, [id]);
        await client.query(`DELETE FROM skills WHERE user_id = $1`, [id]);
        await client.query(`DELETE FROM users WHERE user_id = $1`, [id]);
        
        res.json({ success: true, message: 'User deleted successfully' });
    } catch (error) {
        console.error('Error in deleteUser:', error);
        res.status(500).json({ success: false, message: error.message });
    } finally {
        if (client) client.release();
    }
};

const getAllSkills = async (req, res) => {
    let client;
    try {
        client = await getConnection();
        const result = await client.query(
            `SELECT s.skill_id, s.skill_name, s.category, s.hourly_rate, u.name as provider_name, u.user_id as provider_id
             FROM skills s 
             JOIN users u ON s.user_id = u.user_id`
        );
        res.json({ success: true, skills: result.rows });
    } catch (error) {
        console.error('Error in getAllSkills:', error);
        res.status(500).json({ success: false, message: error.message });
    } finally {
        if (client) client.release();
    }
};

const deleteSkill = async (req, res) => {
    let client;
    const { id } = req.params;
    try {
        client = await getConnection();
        await client.query(`DELETE FROM requests WHERE skill_id = $1`, [id]);
        await client.query(`DELETE FROM skills WHERE skill_id = $1`, [id]);
        res.json({ success: true, message: 'Skill deleted successfully' });
    } catch (error) {
        console.error('Error in deleteSkill:', error);
        res.status(500).json({ success: false, message: error.message });
    } finally {
        if (client) client.release();
    }
};

const getAllRequests = async (req, res) => {
    let client;
    try {
        client = await getConnection();
        const result = await client.query(
            `SELECT r.request_id, r.status, r.message, s.skill_name, 
                    sender.name as sender_name, receiver.name as receiver_name,
                    TO_CHAR(r.created_at, 'YYYY-MM-DD') as created_at
             FROM requests r 
             JOIN skills s ON r.skill_id = s.skill_id 
             JOIN users sender ON r.sender_id = sender.user_id 
             JOIN users receiver ON r.receiver_id = receiver.user_id`
        );
        res.json({ success: true, requests: result.rows });
    } catch (error) {
        console.error('Error in getAllRequests:', error);
        res.status(500).json({ success: false, message: error.message });
    } finally {
        if (client) client.release();
    }
};

const updateRequestStatus = async (req, res) => {
    let client;
    const { id } = req.params;
    const { status } = req.body;
    try {
        client = await getConnection();
        await client.query(
            `UPDATE requests SET status = $1 WHERE request_id = $2`,
            [status, id]
        );
        res.json({ success: true, message: 'Status updated successfully' });
    } catch (error) {
        console.error('Error in updateRequestStatus:', error);
        res.status(500).json({ success: false, message: error.message });
    } finally {
        if (client) client.release();
    }
};

const getStats = async (req, res) => {
    let client;
    try {
        client = await getConnection();
        const totalUsers = (await client.query(`SELECT COUNT(*) FROM users`)).rows[0].count;
        const totalSkills = (await client.query(`SELECT COUNT(*) FROM skills`)).rows[0].count;
        const totalRequests = (await client.query(`SELECT COUNT(*) FROM requests`)).rows[0].count;
        const totalProviders = (await client.query(`SELECT COUNT(*) FROM users WHERE role = 'provider'`)).rows[0].count;
        const totalSeekers = (await client.query(`SELECT COUNT(*) FROM users WHERE role = 'seeker'`)).rows[0].count;
        
        res.json({ 
            success: true, 
            stats: { 
                totalUsers: parseInt(totalUsers), 
                totalSkills: parseInt(totalSkills), 
                totalRequests: parseInt(totalRequests),
                totalProviders: parseInt(totalProviders),
                totalSeekers: parseInt(totalSeekers)
            } 
        });
    } catch (error) {
        console.error('Error in getStats:', error);
        res.status(500).json({ success: false, message: error.message });
    } finally {
        if (client) client.release();
    }
};

module.exports = { 
    getAllUsers, 
    deleteUser, 
    getAllSkills, 
    deleteSkill, 
    getAllRequests, 
    updateRequestStatus, 
    getStats 
};