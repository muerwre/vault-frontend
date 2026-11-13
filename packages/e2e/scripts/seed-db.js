/**
 * Prepares the database for an e2e run.
 *
 *   node scripts/seed-db.js wait   — block until the server accepts connections
 *   node scripts/seed-db.js seed   — load fixtures/seed.sql
 *
 * Reads the backend's DB_HOST, DB_PORT, DB_USER, DB_PASSWORD and DB_NAME, with
 * the same defaults. The schema itself comes from the backend's migrations, run
 * between the two steps.
 */
const { readFileSync } = require('fs');
const { join } = require('path');

const mysql = require('mysql2/promise');

const WAIT_TIMEOUT_MS = 120_000;

const connect = () =>
  mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: Number.parseInt(process.env.DB_PORT ?? '', 10) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD ?? 'password',
    database: process.env.DB_NAME || 'adonis',
    multipleStatements: true,
    charset: 'utf8mb4',
  });

const wait = async () => {
  const deadline = Date.now() + WAIT_TIMEOUT_MS;

  for (;;) {
    try {
      const connection = await connect();
      await connection.query('SELECT 1');
      await connection.end();
      return;
    } catch (error) {
      if (Date.now() > deadline) {
        throw error;
      }

      await new Promise((resolve) => setTimeout(resolve, 2_000));
    }
  }
};

const seed = async () => {
  const connection = await connect();

  try {
    const [[{ n }]] = await connection.query('SELECT COUNT(*) AS n FROM node');

    if (Number(n) > 0) {
      throw new Error('refusing to seed: the node table is not empty');
    }

    await connection.query(
      readFileSync(join(__dirname, '../fixtures/seed.sql'), 'utf8'),
    );
  } finally {
    await connection.end();
  }
};

const main = async () => {
  const step = process.argv[2];

  if (step === 'wait') {
    await wait();
  } else if (step === 'seed') {
    await seed();
  } else {
    throw new Error(`unknown step "${step}", expected "wait" or "seed"`);
  }
};

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
