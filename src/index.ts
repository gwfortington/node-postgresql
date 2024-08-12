import { Pool, QueryResult, types } from 'pg';

interface Config {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
}

class PostgreSQL {
  static #instance: PostgreSQL;
  #pool: Pool;

  private constructor(config: Config) {
    this.#pool = new Pool(config);
  }

  static getInstance(config: Config) {
    if (!this.#instance) {
      this.#instance = new PostgreSQL(config);
    }
    return this.#instance;
  }

  async query(text: string, values?: any[]): Promise<QueryResult> {
    return await this.#pool.query(text, values);
  }

  async shutdown() {
    await this.#pool.end();
  }

  async transaction(
    callback: (
      query: (text: string, values?: any[]) => Promise<QueryResult>,
    ) => Promise<void>,
  ) {
    const client = await this.#pool.connect();
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
  }
}

export { Config, PostgreSQL, types };
