const { getConnection } = require('../config/db');

const sendRequest = async (req, res) => {
    let client;
    const { receiver_id, skill_id, message } = req.body;
    const sender_id = req.user.userId;

    if (!receiver_id || !skill_id) {
        return res.status(400).json({ success: false, message: 'Receiver ID and Skill ID are required' });
    }

    try {
        client = await getConnection();
        if (Number(receiver_id) === Number(sender_id)) {
            return res.status(400).json({ success: false, message: 'You cannot request your own skill.' });
        }
        
        const result = await client.query(
            `INSERT INTO requests (sender_id, receiver_id, skill_id, status, message, created_at)
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
    } finally {
        if (client) client.release();
    }
};

const getRequests = async (req, res) => {
    let client;
    const userId = req.user.userId;

    try {
        client = await getConnection();
        
        const result = await client.query(
            `SELECT 
                r.request_id, 
                r.message, 
                r.status, 
                r.sender_id,
                r.receiver_id,
                TO_CHAR(r.created_at, 'YYYY-MM-DD HH24:MI:SS') as created_at,
                sender.name as sender_name, 
                sender.email as sender_email,
                receiver.name as receiver_name, 
                receiver.email as receiver_email,
                s.skill_id, 
                s.skill_name, 
                s.hourly_rate
             FROM requests r
             JOIN users sender ON r.sender_id = sender.user_id
             JOIN users receiver ON r.receiver_id = receiver.user_id
             JOIN skills s ON r.skill_id = s.skill_id
             WHERE r.sender_id = $1 OR r.receiver_id = $1
             ORDER BY r.created_at DESC`,
            [userId]
        );
        
        res.json({
            success: true,
            requests: result.rows
        });
        
    } catch (error) {
        console.error('Error getting requests:', error);
        res.status(500).json({ success: false, message: error.message });
    } finally {
        if (client) client.release();
    }
};

const updateRequest = async (req, res) => {
    let client;
    const { id } = req.params;
    const { status } = req.body;
    const userId = req.user.userId;

    if (!['accepted', 'rejected'].includes(status)) {
        return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    try {
        client = await getConnection();
        
        const checkResult = await client.query(
            `SELECT receiver_id FROM requests WHERE request_id = $1`,
            [id]
        );
        
        if (checkResult.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Request not found' });
        }
        
        const receiverId = checkResult.rows[0].receiver_id;
        
        if (receiverId !== userId) {
            return res.status(403).json({ success: false, message: 'You can only update requests sent to you' });
        }
        
        await client.query(
            `UPDATE requests SET status = $1 WHERE request_id = $2`,
            [status, id]
        );
        
        res.json({ success: true, message: `Request ${status} successfully` });
        
    } catch (error) {
        console.error('Error updating request:', error);
        res.status(500).json({ success: false, message: error.message });
    } finally {
        if (client) client.release();
    }
};

module.exports = { sendRequest, getRequests, updateRequest };
