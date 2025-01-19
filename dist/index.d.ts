import { QueryResult, types } from 'pg';
export interface Config {
    host: string;
    port: number;
    user: string;
    password: string;
    database: string;
}
/**
 * Creates a PostgreSQL connection pool.
 *
 * @param config PostgreSQL connection configuration.
 */
export declare const createConnectionPool: (config: Config) => void;
export type Query = (sql: string, values?: (string | number | boolean | null)[]) => Promise<QueryResult>;
/**
 * Executes a query on the PostgreSQL database.
 *
 * @param sql The SQL query to execute.
 * @param values The values to use in the query.
 * @returns A promise that resolves with the result of the query.
 */
export declare const query: Query;
/**
 * Executes a function within a PostgreSQL transaction.
 *
 * @param callback A function that takes a query function as an argument.
 * The query function takes a SQL query string and optional values as arguments
 * and returns a promise that resolves with the result of the query.
 * Any errors thrown by the callback will cause the transaction to rollback.
 * @returns A promise that resolves with the result of the query, if the transaction succeeds.
 * @throws Any errors thrown by the callback will be re-thrown.
 */
export declare const transaction: (callback: (query: Query) => Promise<void>) => Promise<void>;
/**
 * Shuts down the PostgreSQL connection pool.
 *
 * @returns A promise that resolves when the pool is shut down.
 */
export declare const shutdown: () => Promise<void>;
export { types };
