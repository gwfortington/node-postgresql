import { QueryResult } from 'pg';
export interface Config {
    host: string;
    port: number;
    user: string;
    password: string;
    database: string;
}
export declare const createConnection: (config: Config) => void;
type Query = (text: string, values?: any[]) => Promise<QueryResult>;
export declare const query: Query;
export declare const transaction: (callback: (query: Query) => Promise<void>) => Promise<void>;
export {};
