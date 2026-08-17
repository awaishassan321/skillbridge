const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'skillbridge',
    password: 'superuser',  // Apna PostgreSQL password daalo
    port: 5432,
});

async function getConnection() {
    try {
        const client = await pool.connect();
        return client;
    } catch (err) {
        console.error('PostgreSQL Connection Error:', err);
        throw err;
    }
}

module.exports = { getConnection };