import { QueryResult, types } from 'pg';
export interface Config {
    host: string;
    port: number;
    user: string;
    password: string;
    database: string;
}
export declare const createConnectionPool: (config: Config) => void;
export type Query = (text: string, values?: any[]) => Promise<QueryResult>;
export declare const query: Query;
export declare const transaction: (callback: (query: Query) => Promise<void>) => Promise<void>;
export declare const shutdown: () => Promise<void>;
export { types };
