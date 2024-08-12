import { Pool, QueryResult, types } from 'pg';

export interface Config {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
}

let pool: Pool;

export const createConnectionPool = (config: Config) => {
  pool = new Pool(config);
};

export type Query = (text: string, values?: any[]) => Promise<QueryResult>;

export const query: Query = async (text, values) =>
  await pool.query(text, values);

export const transaction = async (
  callback: (query: Query) => Promise<void>,
) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await callback(async (text, values) => await client.query(text, values));
    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

export const shutdown = async () => {
  await pool.end();
};

export { types };
