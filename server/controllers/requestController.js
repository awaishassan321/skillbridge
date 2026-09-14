const { pool } = require('../config/db');

const sendRequest = async (req, res) => {
    const { receiverId: receiver_id, skillId: skill_id, message } = req.body;
    const sender_id = req.user.userId;

    if (!receiver_id || !skill_id) {
        return res.status(400).json({ success: false, message: 'Receiver ID and Skill ID are required' });
    }

    if (Number(receiver_id) === sender_id) {
        return res.status(400).json({ success: false, message: 'You cannot send a request to yourself' });
    }

    try {
        const result = await pool.query(
            `INSERT INTO skillbridge.requests (sender_id, receiver_id, skill_id, status, message, created_at)
             VALUES ($1, $2, $3, 'pending', $4, NOW())
             RETURNING request_id`,
            [sender_id, receiver_id, skill_id, message || null]
        );

        res.json({
            success: true,
            message: 'Request sent successfully',
            request_id: result.rows[0].request_id
        });

    } catch (error) {
        console.error('Error sending request:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

const getRequests = async (req, res) => {
    const userId = req.user.userId;

    try {
        const result = await pool.query(
            `SELECT r.request_id, r.message, r.status,
                    TO_CHAR(r.created_at, 'YYYY-MM-DD HH24:MI:SS') as created_at,
                    r.sender_id, r.receiver_id,
                    sender.name as sender_name, sender.email as sender_email,
                    receiver.name as receiver_name, receiver.email as receiver_email,
                    s.skill_id, s.skill_name, s.hourly_rate,
                    (rv.review_id IS NOT NULL) as has_review
             FROM skillbridge.requests r
             JOIN skillbridge.users sender ON r.sender_id = sender.user_id
             JOIN skillbridge.users receiver ON r.receiver_id = receiver.user_id
             JOIN skillbridge.skills s ON r.skill_id = s.skill_id
             LEFT JOIN skillbridge.reviews rv ON rv.request_id = r.request_id AND rv.reviewer_id = r.sender_id
             WHERE r.sender_id = $1 OR r.receiver_id = $1
             ORDER BY r.created_at DESC`,
            [userId]
        );

        res.json({
            success: true,
            requests: result.rows.map(row => ({
                REQUEST_ID: row.request_id,
                MESSAGE: row.message,
                STATUS: row.status,
                CREATED_AT: row.created_at,
                SENDER_ID: row.sender_id,
                RECEIVER_ID: row.receiver_id,
                SENDER_NAME: row.sender_name,
                SENDER_EMAIL: row.sender_email,
                RECEIVER_NAME: row.receiver_name,
                RECEIVER_EMAIL: row.receiver_email,
                SKILL_ID: row.skill_id,
                SKILL_NAME: row.skill_name,
                HOURLY_RATE: row.hourly_rate,
                HAS_REVIEW: row.has_review
            }))
        });

    } catch (error) {
        console.error('Error getting requests:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

const updateRequest = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    const userId = req.user.userId;

    if (!['accepted', 'rejected'].includes(status)) {
        return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    try {
        const checkResult = await pool.query(
            `SELECT receiver_id FROM skillbridge.requests WHERE request_id = $1`,
            [id]
        );

        if (checkResult.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Request not found' });
        }

        const receiverId = checkResult.rows[0].receiver_id;

        if (receiverId !== userId) {
            return res.status(403).json({ success: false, message: 'You can only update requests sent to you' });
        }

        await pool.query(
            `UPDATE skillbridge.requests SET status = $1 WHERE request_id = $2`,
            [status, id]
        );

        res.json({ success: true, message: `Request ${status} successfully` });

    } catch (error) {
        console.error('Error updating request:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = { sendRequest, getRequests, updateRequest };
