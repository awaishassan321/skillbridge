const { getConnection } = require('../config/db');

const getNotifications = async (req, res) => {
    let client;
    const userId = req.user.userId;

    try {
        client = await getConnection();
        const result = await client.query(
            `SELECT notification_id, message, is_read, TO_CHAR(created_at, 'YYYY-MM-DD HH24:MI:SS') as created_at
             FROM notifications
             WHERE user_id = $1
             ORDER BY created_at DESC
             LIMIT 20`,
            [userId]
        );
        res.json({ success: true, notifications: result.rows });
    } catch (error) {
        console.error('Error getting notifications:', error);
        res.status(500).json({ success: false, message: error.message });
    } finally {
        if (client) client.release();
    }
};

const markAsRead = async (req, res) => {
    let client;
    const { id } = req.params;
    const userId = req.user.userId;

    try {
        client = await getConnection();
        await client.query(
            `UPDATE notifications SET is_read = 1 WHERE notification_id = $1 AND user_id = $2`,
            [id, userId]
        );
        res.json({ success: true, message: 'Notification marked as read' });
    } catch (error) {
        console.error('Error marking notification:', error);
        res.status(500).json({ success: false, message: error.message });
    } finally {
        if (client) client.release();
    }
};

module.exports = { getNotifications, markAsRead };