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
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _a, _PostgreSQL_instance, _PostgreSQL_pool;
Object.defineProperty(exports, "__esModule", { value: true });
exports.types = exports.PostgreSQL = void 0;
const pg_1 = require("pg");
Object.defineProperty(exports, "types", { enumerable: true, get: function () { return pg_1.types; } });
class PostgreSQL {
    constructor(config) {
        _PostgreSQL_pool.set(this, void 0);
        __classPrivateFieldSet(this, _PostgreSQL_pool, new pg_1.Pool(config), "f");
    }
    static getInstance(config) {
        if (!__classPrivateFieldGet(this, _a, "f", _PostgreSQL_instance)) {
            __classPrivateFieldSet(this, _a, new _a(config), "f", _PostgreSQL_instance);
        }
        return __classPrivateFieldGet(this, _a, "f", _PostgreSQL_instance);
    }
    query(text, values) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield __classPrivateFieldGet(this, _PostgreSQL_pool, "f").query(text, values);
        });
    }
    transaction(callback) {
        return __awaiter(this, void 0, void 0, function* () {
            const client = yield __classPrivateFieldGet(this, _PostgreSQL_pool, "f").connect();
            try {
                yield client.query('BEGIN');
                yield callback((text, values) => __awaiter(this, void 0, void 0, function* () { return yield client.query(text, values); }));
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
    }
    shutdown() {
        return __awaiter(this, void 0, void 0, function* () {
            yield __classPrivateFieldGet(this, _PostgreSQL_pool, "f").end();
        });
    }
}
exports.PostgreSQL = PostgreSQL;
_a = PostgreSQL, _PostgreSQL_pool = new WeakMap();
_PostgreSQL_instance = { value: void 0 };
