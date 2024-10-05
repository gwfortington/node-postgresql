import { Pool, QueryResult, types } from 'pg';

export interface Config {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
}

let pool: Pool;

/**
 * Creates a PostgreSQL connection pool.
 * @param config PostgreSQL connection configuration.
 */
export const createConnectionPool = (config: Config): void => {
  pool = new Pool(config);
};

export type Query = (
  sql: string,
  values?: (string | number | boolean | null)[],
) => Promise<QueryResult>;

/**
 * Executes a query on the PostgreSQL database.
 * @param sql The SQL query to execute.
 * @param values The values to use in the query.
 * @returns A promise that resolves with the result of the query.
 */
export const query: Query = async (sql, values) =>
  await pool.query(sql, values);

/**
 * Executes a function within a PostgreSQL transaction.
 * @param callback A function that takes a query function as an argument.
 * The query function takes a SQL query string and optional values as arguments
 * and returns a promise that resolves with the result of the query.
 * Any errors thrown by the callback will cause the transaction to rollback.
 * @returns A promise that resolves with the result of the query, if the transaction succeeds.
 * @throws Any errors thrown by the callback will be re-thrown.
 */
export const transaction = async (
  callback: (query: Query) => Promise<void>,
): Promise<void> => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await callback(async (sql, values) => await client.query(sql, values));
    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

/**
 * Shuts down the PostgreSQL connection pool.
 * @returns A promise that resolves when the pool is shut down.
 */
export const shutdown = async (): Promise<void> => {
  await pool.end();
};

export { types };
