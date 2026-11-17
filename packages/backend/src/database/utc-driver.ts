import * as mysql2 from 'mysql2';

/** Run first on every connection, before anything else it is given. */
export const UTC_SESSION_SQL = "SET time_zone = '+00:00'";

/**
 * `mysql2` with every pooled connection's session switched to UTC.
 *
 * The client reads and writes dates as UTC (`timezone: 'Z'`), but what the
 * database stamps itself — `NOW()`, `CURRENT_TIMESTAMP` defaults — follows its
 * session time zone, which is the server's own unless set. Pinning the session
 * to UTC makes both clocks agree whatever zone the server runs in, and keeps
 * SQL date arithmetic against `NOW()` comparable with what the app writes.
 *
 * The listener is attached before the pool hands out its first connection, and
 * a connection runs its commands in order, so nothing reaches one before the
 * zone is set.
 */
export const utcMysql2 = {
  ...mysql2,
  createPool: (options: mysql2.PoolOptions): mysql2.Pool => {
    const pool = mysql2.createPool(options);

    pool.on('connection', (connection) => {
      connection.query(UTC_SESSION_SQL);
    });

    return pool;
  },
};
