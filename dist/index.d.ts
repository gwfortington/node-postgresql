import { QueryResult as Result } from 'pg';
export interface Config {
    host: string;
    port: number;
    user: string;
    password: string;
    database: string;
}
export declare const createConnection: (config: Config) => void;
export type Query = (text: string, values?: any[]) => Promise<Result>;
export declare const query: Query;
export { Result };
export declare const transaction: (callback: (query: Query) => Promise<void>) => Promise<void>;
