"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.types = exports.shutdown = exports.transaction = exports.query = exports.createConnectionPool = void 0;
const pg_1 = require("pg");
Object.defineProperty(exports, "types", { enumerable: true, get: function () { return pg_1.types; } });
let pool;
/**
 * Creates a PostgreSQL connection pool.
 * @param config PostgreSQL connection configuration.
 */
const createConnectionPool = (config) => {
    pool = new pg_1.Pool(config);
};
exports.createConnectionPool = createConnectionPool;
/**
 * Executes a query on the PostgreSQL database.
 * @param text The SQL query to execute.
 * @param values The values to use in the query.
 * @returns A promise that resolves with the result of the query.
 */
const query = (text, values) => __awaiter(void 0, void 0, void 0, function* () { return yield pool.query(text, values); });
exports.query = query;
/**
 * Executes a function within a PostgreSQL transaction.
 * @param callback A function that takes a query function as an argument.
 * The query function takes a SQL query string and optional values as arguments
 * and returns a promise that resolves with the result of the query.
 * Any errors thrown by the callback will cause the transaction to rollback.
 */
const transaction = (callback) => __awaiter(void 0, void 0, void 0, function* () {
    const client = yield pool.connect();
    try {
        yield client.query('BEGIN');
        yield callback((text, values) => __awaiter(void 0, void 0, void 0, function* () { return yield client.query(text, values); }));
        yield client.query('COMMIT');
    }
    catch (error) {
        yield client.query('ROLLBACK');
        throw error;
    }
    finally {
        client.release();
    }
});
exports.transaction = transaction;
/**
 * Shuts down the PostgreSQL connection pool.
 * @returns A promise that resolves when the pool is shut down.
 */
const shutdown = () => __awaiter(void 0, void 0, void 0, function* () {
    yield pool.end();
});
exports.shutdown = shutdown;
