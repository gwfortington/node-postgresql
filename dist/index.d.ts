import { QueryResult, types } from 'pg';
interface Config {
    host: string;
    port: number;
    user: string;
    password: string;
    database: string;
}
declare const createConnectionPool: (config: Config) => void;
type Query = (text: string, values?: any[]) => Promise<QueryResult>;
declare const query: Query;
declare const transaction: (callback: (query: Query) => Promise<void>) => Promise<void>;
export { Config, createConnectionPool, Query, query, transaction, types };
