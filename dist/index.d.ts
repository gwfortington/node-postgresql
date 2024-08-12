import { QueryResult, types } from 'pg';
interface Config {
    host: string;
    port: number;
    user: string;
    password: string;
    database: string;
}
declare class PostgreSQL {
    #private;
    private constructor();
    static getInstance(config: Config): PostgreSQL;
    query(text: string, values?: any[]): Promise<QueryResult>;
    shutdown(): Promise<void>;
    transaction(callback: (query: (text: string, values?: any[]) => Promise<QueryResult>) => Promise<void>): Promise<void>;
}
export { Config, PostgreSQL, types };
