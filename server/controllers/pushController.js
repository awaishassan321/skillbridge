const { pool } = require('../config/db');

const getVapidPublicKey = (req, res) => {
    res.json({ publicKey: process.env.VAPID_PUBLIC_KEY || null });
};

const subscribe = async (req, res) => {
    try {
        const { endpoint, keys } = req.body;

        if (!endpoint || !keys?.p256dh || !keys?.auth) {
            return res.status(400).json({ message: 'Invalid subscription' });
        }

        await pool.query(
            `INSERT INTO skillbridge.push_subscriptions (user_id, endpoint, p256dh, auth, created_at)
             VALUES ($1, $2, $3, $4, NOW())
             ON CONFLICT (endpoint) DO UPDATE SET user_id = $1, p256dh = $3, auth = $4`,
            [req.user.userId, endpoint, keys.p256dh, keys.auth]
        );

        res.status(201).json({ message: 'Subscribed to notifications! ✅' });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const unsubscribe = async (req, res) => {
    try {
        const { endpoint } = req.body;
        if (!endpoint) {
            return res.status(400).json({ message: 'Endpoint is required' });
        }

        await pool.query(
            `DELETE FROM skillbridge.push_subscriptions WHERE endpoint = $1 AND user_id = $2`,
            [endpoint, req.user.userId]
        );

        res.json({ message: 'Unsubscribed from notifications' });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

module.exports = { getVapidPublicKey, subscribe, unsubscribe };
