const { Pool } = require('pg');

// Most hosted Postgres providers (Railway, Render, Supabase, Neon...) hand out
// a single DATABASE_URL and require SSL; local dev keeps using the discrete
// DB_* vars with no SSL. DB_SSL=true opts into SSL explicitly either way.
const useSsl = process.env.DB_SSL === 'true';

const poolConfig = process.env.DATABASE_URL
    ? { connectionString: process.env.DATABASE_URL }
    : {
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        database: process.env.DB_NAME,
    };

if (useSsl) {
    poolConfig.ssl = { rejectUnauthorized: false };
}

const pool = new Pool(poolConfig);

module.exports = { pool };
