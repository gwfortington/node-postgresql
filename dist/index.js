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
exports.transaction = exports.query = exports.createConnection = void 0;
const pg_1 = require("pg");
let pool;
const createConnection = (config) => {
    pool = new pg_1.Pool(config);
};
exports.createConnection = createConnection;
const query = (text, values) => __awaiter(void 0, void 0, void 0, function* () { return yield pool.query(text, values); });
exports.query = query;
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
