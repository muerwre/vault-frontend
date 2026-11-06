/**
 * Prepares the database for an e2e run.
 *
 *   node scripts/seed-db.js wait   — block until the server accepts connections
 *   node scripts/seed-db.js seed   — load fixtures/seed.sql
 *
 * Reads DATABASE_URL, the same variable the backend uses. The schema itself
 * comes from the backend's migrations, run between the two steps.
 */
const { readFileSync } = require('fs');
const { join } = require('path');

const mysql = require('mysql2/promise');

const url = process.env.DATABASE_URL;
const WAIT_TIMEOUT_MS = 120_000;

const connect = () =>
  mysql.createConnection({
    uri: url.replace(/^mariadb:/, 'mysql:'),
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
  if (!url) {
    throw new Error('DATABASE_URL is not set');
  }

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
