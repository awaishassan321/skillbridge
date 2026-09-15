const webpush = require('web-push');
const { pool } = require('../config/db');

if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
    webpush.setVapidDetails(
        process.env.VAPID_SUBJECT || 'mailto:admin@skillbridge.com',
        process.env.VAPID_PUBLIC_KEY,
        process.env.VAPID_PRIVATE_KEY
    );
}

// Sends a notification to every device a user has subscribed on.
// Silently no-ops if VAPID isn't configured, and prunes subscriptions
// the browser has since revoked (410/404) instead of retrying them forever.
const sendPushToUser = async (userId, { title, body, url }) => {
    if (!process.env.VAPID_PUBLIC_KEY || !process.env.VAPID_PRIVATE_KEY) return;

    try {
        const { rows } = await pool.query(
            `SELECT subscription_id, endpoint, p256dh, auth FROM skillbridge.push_subscriptions WHERE user_id = $1`,
            [userId]
        );

        const payload = JSON.stringify({ title, body, url: url || '/' });

        await Promise.all(rows.map(async (sub) => {
            try {
                await webpush.sendNotification(
                    { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
                    payload
                );
            } catch (err) {
                if (err.statusCode === 404 || err.statusCode === 410) {
                    await pool.query(
                        `DELETE FROM skillbridge.push_subscriptions WHERE subscription_id = $1`,
                        [sub.subscription_id]
                    );
                } else {
                    console.error('Push send failed:', err.message);
                }
            }
        }));
    } catch (err) {
        console.error('sendPushToUser error:', err.message);
    }
};

module.exports = { sendPushToUser };
