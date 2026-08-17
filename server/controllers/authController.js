const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getConnection } = require('../config/db');

const register = async (req, res) => {
    let client;
    try {
        const { name, email, password, location, role } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ 
                success: false, 
                message: 'Name, email and password are required!' 
            });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        client = await getConnection();

        // PostgreSQL syntax - SERIAL auto-increment
        await client.query(
            `INSERT INTO users (name, email, password, location, role, created_at)
             VALUES ($1, $2, $3, $4, $5, NOW())`,
            [name, email, hashedPassword, location || null, role || 'seeker']
        );

        res.status(201).json({ 
            success: true,
            message: 'User registered successfully! ✅'
        });

    } catch (err) {
        console.error('Registration ERROR:', err);
        
        if (err.code === '23505') {  // PostgreSQL unique violation
            return res.status(400).json({ 
                success: false, 
                message: 'Email already exists!' 
            });
        }
        
        res.status(500).json({ 
            success: false, 
            message: err.message 
        });
    } finally {
        if (client) client.release();
    }
};

const login = async (req, res) => {
    let client;
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ 
                success: false, 
                message: 'Email and password are required!' 
            });
        }

        client = await getConnection();

        const result = await client.query(
            `SELECT * FROM users WHERE LOWER(email) = LOWER($1)`,
            [email]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({ 
                success: false, 
                message: 'Invalid email or password!' 
            });
        }

        const user = result.rows[0];

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ 
                success: false, 
                message: 'Invalid email or password!' 
            });
        }

        const token = jwt.sign(
            { userId: user.user_id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({ 
            success: true,
            token,
            user: { 
                user_id: user.user_id, 
                name: user.name, 
                email: user.email, 
                role: user.role 
            },
            message: 'Login successful! ✅'
        });

    } catch (err) {
        console.error('Login ERROR:', err);
        res.status(500).json({ 
            success: false, 
            message: 'Server error. Please try again.' 
        });
    } finally {
        if (client) client.release();
    }
};

module.exports = { register, login };