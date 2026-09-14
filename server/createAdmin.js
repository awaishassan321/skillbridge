const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
dotenv.config();
const { pool } = require('./config/db');

const createAdmin = async () => {
    try {
        const password = '123456';
        const hashedPassword = await bcrypt.hash(password, 10);

        await pool.query(
            `INSERT INTO skillbridge.users (name, email, password, location, role, created_at)
             VALUES ('Admin', 'admin@skillbridge.com', $1, 'Islamabad', 'admin', NOW())`,
            [hashedPassword]
        );

        console.log('Admin created successfully! ✅');
        console.log('Email: admin@skillbridge.com');
        console.log('Password: 123456');
        process.exit(0);

    } catch (err) {
        console.log('Error:', err.message);
        process.exit(1);
    }
};

createAdmin();
