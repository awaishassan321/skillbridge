const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../config/db');

const register = async (req, res) => {
    try {
        const { name, email, password, location, role } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Name, email and password are required' });
        }

        // Public registration can only ever create a seeker or provider account —
        // 'admin' must never be assignable through this endpoint.
        const safeRole = role === 'provider' ? 'provider' : 'seeker';

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        await pool.query(
            `INSERT INTO skillbridge.users (name, email, password, location, role, created_at)
             VALUES ($1, $2, $3, $4, $5, NOW())`,
            [name, email, hashedPassword, location, safeRole]
        );

        res.status(201).json({
            message: 'User registered successfully! ✅'
        });

    } catch (err) {
        if (err.code === '23505') {
            return res.status(400).json({ message: 'An account with this email already exists' });
        }
        res.status(500).json({ message: err.message });
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const result = await pool.query(
            `SELECT * FROM skillbridge.users WHERE LOWER(email) = LOWER($1)`,
            [email]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'User not found!' });
        }

        const user = result.rows[0];

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Wrong password!' });
        }

        const token = jwt.sign(
            { userId: user.user_id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            token,
            user: { id: user.user_id, name: user.name, email: user.email, role: user.role, avatarUrl: user.avatar_url },
            message: 'Login successful! ✅'
        });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const getProfile = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT user_id, name, email, location, role, avatar_url, TO_CHAR(created_at, 'YYYY-MM-DD') as created_at
             FROM skillbridge.users WHERE user_id = $1`,
            [req.user.userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        const user = result.rows[0];
        res.json({
            user: {
                id: user.user_id,
                name: user.name,
                email: user.email,
                location: user.location,
                role: user.role,
                avatarUrl: user.avatar_url,
                createdAt: user.created_at
            }
        });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const updateProfile = async (req, res) => {
    try {
        const { name, location } = req.body;

        if (!name || !name.trim()) {
            return res.status(400).json({ message: 'Name is required' });
        }

        await pool.query(
            `UPDATE skillbridge.users SET name = $1, location = $2 WHERE user_id = $3`,
            [name, location, req.user.userId]
        );

        res.json({
            message: 'Profile updated successfully! ✅',
            user: { id: req.user.userId, name, location, role: req.user.role }
        });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ message: 'Current and new password are required' });
        }
        if (newPassword.length < 6) {
            return res.status(400).json({ message: 'New password must be at least 6 characters' });
        }

        const result = await pool.query(
            `SELECT password FROM skillbridge.users WHERE user_id = $1`,
            [req.user.userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        const isMatch = await bcrypt.compare(currentPassword, result.rows[0].password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Current password is incorrect' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        await pool.query(
            `UPDATE skillbridge.users SET password = $1 WHERE user_id = $2`,
            [hashedPassword, req.user.userId]
        );

        res.json({ message: 'Password changed successfully! ✅' });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

module.exports = { register, login, getProfile, updateProfile, changePassword };
