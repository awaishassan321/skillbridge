const { getConnection } = require('../config/db');

const getMessages = async (req, res) => {
    let client;
    const { requestId } = req.params;
    const userId = req.user.userId;

    try {
        client = await getConnection();
        const access = await client.query(
            `SELECT request_id FROM requests WHERE request_id = $1 AND status = 'accepted'
             AND (sender_id = $2 OR receiver_id = $2)`, [requestId, userId]
        );
        if (!access.rows.length) return res.status(403).json({ success: false, message: 'This conversation is not available.' });
        
        await client.query(
            `UPDATE messages SET is_read = 1 
             WHERE request_id = $1 AND receiver_id = $2 AND is_read = 0`,
            [requestId, userId]
        );
        
        const result = await client.query(
            `SELECT m.message_id, m.message, m.is_read, 
                    TO_CHAR(m.created_at, 'YYYY-MM-DD HH24:MI:SS') as created_at,
                    m.sender_id, m.receiver_id,
                    sender.name as sender_name,
                    receiver.name as receiver_name
             FROM messages m
             JOIN users sender ON m.sender_id = sender.user_id
             JOIN users receiver ON m.receiver_id = receiver.user_id
             WHERE m.request_id = $1
             ORDER BY m.created_at ASC`,
            [requestId]
        );
        
        res.json({ success: true, messages: result.rows });
        
    } catch (error) {
        console.error('Error getting messages:', error);
        res.status(500).json({ success: false, message: error.message });
    } finally {
        if (client) client.release();
    }
};

const sendMessage = async (req, res) => {
    let client;
    const { request_id, receiver_id, message } = req.body;
    const sender_id = req.user.userId;

    if (!request_id || !receiver_id || !message) {
        return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    try {
        client = await getConnection();
        
        const checkRequest = await client.query(
            `SELECT status, sender_id, receiver_id FROM requests WHERE request_id = $1`,
            [request_id]
        );
        
        if (checkRequest.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Request not found' });
        }
        
        if (checkRequest.rows[0].status !== 'accepted') {
            return res.status(403).json({ success: false, message: 'Chat is only available for accepted requests' });
        }
        const request = checkRequest.rows[0];
        const validReceiver = (Number(request.sender_id) === Number(sender_id) && Number(request.receiver_id) === Number(receiver_id)) ||
            (Number(request.receiver_id) === Number(sender_id) && Number(request.sender_id) === Number(receiver_id));
        if (!validReceiver) return res.status(403).json({ success: false, message: 'Invalid conversation recipient.' });
        
        await client.query(
            `INSERT INTO messages (request_id, sender_id, receiver_id, message, created_at)
             VALUES ($1, $2, $3, $4, NOW())`,
            [request_id, sender_id, receiver_id, message]
        );
        
        res.json({ success: true, message: 'Message sent successfully' });
        
    } catch (error) {
        console.error('Error sending message:', error);
        res.status(500).json({ success: false, message: error.message });
    } finally {
        if (client) client.release();
    }
};

const getConversations = async (req, res) => {
    let client;
    const userId = req.user.userId;

    try {
        client = await getConnection();
        
        const result = await client.query(
            `SELECT DISTINCT 
                r.request_id,
                r.skill_name,
                CASE 
                    WHEN r.sender_id = $1 THEN r.receiver_id
                    ELSE r.sender_id
                END as other_user_id,
                CASE 
                    WHEN r.sender_id = $1 THEN r.receiver_name
                    ELSE r.sender_name
                END as other_user_name,
                (
                    SELECT message FROM messages 
                    WHERE request_id = r.request_id 
                    ORDER BY created_at DESC 
                    LIMIT 1
                ) as last_message,
                (
                    SELECT TO_CHAR(created_at, 'YYYY-MM-DD HH24:MI:SS') FROM messages 
                    WHERE request_id = r.request_id 
                    ORDER BY created_at DESC 
                    LIMIT 1
                ) as last_message_time,
                (
                    SELECT COUNT(*) FROM messages 
                    WHERE request_id = r.request_id AND receiver_id = $1 AND is_read = 0
                ) as unread_count
             FROM (
                SELECT 
                    r.request_id,
                    s.skill_name,
                    r.sender_id,
                    r.receiver_id,
                    sender.name as sender_name,
                    receiver.name as receiver_name
                FROM requests r
                JOIN skills s ON r.skill_id = s.skill_id
                JOIN users sender ON r.sender_id = sender.user_id
                JOIN users receiver ON r.receiver_id = receiver.user_id
                WHERE (r.sender_id = $1 OR r.receiver_id = $1)
                AND r.status = 'accepted'
             ) r
             ORDER BY last_message_time DESC NULLS LAST`,
            [userId]
        );
        
        res.json({ success: true, conversations: result.rows });
        
    } catch (error) {
        console.error('Error getting conversations:', error);
        res.status(500).json({ success: false, message: error.message });
    } finally {
        if (client) client.release();
    }
};

const getUnreadCount = async (req, res) => {
    let client;
    const userId = req.user.userId;

    try {
        client = await getConnection();
        
        const result = await client.query(
            `SELECT COUNT(*) as count FROM messages 
             WHERE receiver_id = $1 AND is_read = 0`,
            [userId]
        );
        
        res.json({ success: true, count: result.rows[0].count });
        
    } catch (error) {
        console.error('Error getting unread count:', error);
        res.status(500).json({ success: false, message: error.message });
    } finally {
        if (client) client.release();
    }
};

module.exports = { getMessages, sendMessage, getConversations, getUnreadCount };
