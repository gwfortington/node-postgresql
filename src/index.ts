import { Pool, QueryResult as Result } from 'pg';

interface Config {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
}

let pool: Pool;

export const createConnection = (config: Config) => {
  pool = new Pool(config);
};

export { Config };

type Query = (text: string, values?: any[]) => Promise<Result>;

export { Query };

export const query: Query = async (text, values) =>
  await pool.query(text, values);

export { Result };

export const transaction = async (
  callback: (query: Query) => Promise<void>
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
