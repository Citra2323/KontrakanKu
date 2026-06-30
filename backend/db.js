// db.js - Database connection & schema initialization (PostgreSQL via pg)
const { Pool } = require('pg');

// Render provides DATABASE_URL automatically when you link a PostgreSQL database
// Locally, set DATABASE_URL in a .env file or environment variable
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes('render.com')
    ? { rejectUnauthorized: false }
    : false,
});

async function initSchema() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS kompleks (
      id         TEXT PRIMARY KEY,
      nama       TEXT NOT NULL,
      alamat     TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS unit (
      id             TEXT PRIMARY KEY,
      kompleks_id    TEXT NOT NULL REFERENCES kompleks(id) ON DELETE CASCADE,
      nama           TEXT NOT NULL,
      harga          INTEGER NOT NULL DEFAULT 0,
      status         TEXT NOT NULL DEFAULT 'Available',
      penyewa        TEXT DEFAULT '-',
      telp           TEXT DEFAULT '-',
      tgl_masuk      TEXT DEFAULT '-',
      jatuh_tempo    TEXT DEFAULT '-',
      terakhir_bayar TEXT DEFAULT '-',
      status_bayar   TEXT DEFAULT '-',
      created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);
}

// Helper: run a SELECT query, return array of rows
async function all(query, params = []) {
  const res = await pool.query(query, params);
  return res.rows;
}

// Helper: run a SELECT query, return first row or null
async function get(query, params = []) {
  const res = await pool.query(query, params);
  return res.rows[0] || null;
}

// Helper: run INSERT/UPDATE/DELETE, return { changes }
async function run(query, params = []) {
  const res = await pool.query(query, params);
  return { changes: res.rowCount };
}

module.exports = { pool, initSchema, all, get, run };
