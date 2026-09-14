const { pool } = require('../config/db');

const canAccessRequest = async (requestId, userId) => {
    const result = await pool.query(
        `SELECT sender_id, receiver_id, status FROM skillbridge.requests WHERE request_id = $1`,
        [requestId]
    );
    if (result.rows.length === 0) return { ok: false, reason: 'not_found' };

    const { sender_id, receiver_id, status } = result.rows[0];
    if (sender_id !== userId && receiver_id !== userId) return { ok: false, reason: 'forbidden' };
    if (status !== 'accepted') return { ok: false, reason: 'not_accepted' };

    return { ok: true };
};

const getMessages = async (req, res) => {
    try {
        const { id } = req.params;
        const access = await canAccessRequest(id, req.user.userId);

        if (!access.ok) {
            if (access.reason === 'not_found') return res.status(404).json({ message: 'Request not found' });
            if (access.reason === 'forbidden') return res.status(403).json({ message: 'You are not part of this request' });
            return res.status(400).json({ message: 'Chat is only available for accepted requests' });
        }

        const result = await pool.query(
            `SELECT m.message_id AS "MESSAGE_ID", m.sender_id AS "SENDER_ID", m.body AS "BODY",
                    TO_CHAR(m.created_at, 'YYYY-MM-DD HH24:MI:SS') AS "CREATED_AT",
                    u.name AS "SENDER_NAME"
             FROM skillbridge.messages m
             JOIN skillbridge.users u ON m.sender_id = u.user_id
             WHERE m.request_id = $1
             ORDER BY m.created_at ASC`,
            [id]
        );

        res.json({ messages: result.rows });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const sendMessage = async (req, res) => {
    try {
        const { id } = req.params;
        const { body } = req.body;

        if (!body || !body.trim()) {
            return res.status(400).json({ message: 'Message cannot be empty' });
        }

        const access = await canAccessRequest(id, req.user.userId);
        if (!access.ok) {
            if (access.reason === 'not_found') return res.status(404).json({ message: 'Request not found' });
            if (access.reason === 'forbidden') return res.status(403).json({ message: 'You are not part of this request' });
            return res.status(400).json({ message: 'Chat is only available for accepted requests' });
        }

        const result = await pool.query(
            `INSERT INTO skillbridge.messages (request_id, sender_id, body, created_at)
             VALUES ($1, $2, $3, NOW())
             RETURNING message_id, TO_CHAR(created_at, 'YYYY-MM-DD HH24:MI:SS') as created_at`,
            [id, req.user.userId, body.trim()]
        );

        res.status(201).json({
            message: {
                MESSAGE_ID: result.rows[0].message_id,
                SENDER_ID: req.user.userId,
                BODY: body.trim(),
                CREATED_AT: result.rows[0].created_at
            }
        });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

module.exports = { getMessages, sendMessage };
