import { QueryResult as Result } from 'pg';
interface Config {
    host: string;
    port: number;
    user: string;
    password: string;
    database: string;
}
declare const createConnection: (config: Config) => void;
type Query = (text: string, values?: any[]) => Promise<Result>;
declare const query: Query;
declare const transaction: (callback: (query: Query) => Promise<void>) => Promise<void>;
export { Config, createConnection, query, transaction };
