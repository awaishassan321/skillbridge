const bcrypt = require('bcryptjs');
const { getConnection } = require('./config/db');

const createAdmin = async () => {
    try {
        const password = '123456';
        const hashedPassword = await bcrypt.hash(password, 10);
        
        const connection = await getConnection();
        
        await connection.execute(
            `INSERT INTO skillbridge.users (user_id, name, email, password, location, role, created_at) 
             VALUES (skillbridge.users_seq.NEXTVAL, 'Admin', 'admin@skillbridge.com', :password, 'Islamabad', 'admin', SYSDATE)`,
            { password: hashedPassword },
            { autoCommit: true }
        );
        
        await connection.close();
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