import { QueryResult as Result } from 'pg';
interface Config {
    host: string;
    port: number;
    user: string;
    password: string;
    database: string;
}
export declare const createConnection: (config: Config) => void;
export { Config };
type Query = (text: string, values?: any[]) => Promise<Result>;
export { Query };
export declare const query: Query;
export { Result };
export declare const transaction: (callback: (query: Query) => Promise<void>) => Promise<void>;
