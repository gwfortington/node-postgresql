import assert from 'node:assert/strict';
import { before, describe, it } from 'node:test';
import { Config, createConnectionPool, query, transaction } from '../dist';

describe('main', async () => {
  let config: Config;
  await describe('config', async () => {
    before(() => {
      config = {
        host: process.env.POSTGRESQL_HOST!,
        port: Number(process.env.POSTGRESQL_PORT!),
        user: process.env.POSTGRESQL_USER!,
        password: process.env.POSTGRESQL_PASSWORD!,
        database: process.env.POSTGRESQL_DATABASE!,
      };
    });
    it('has host', () => assert.equal(typeof config.host, 'string'));
    it('has port', () => assert.equal(!isNaN(config.port), true));
    it('has user', () => assert.equal(typeof config.user, 'string'));
    it('has password', () => assert.equal(typeof config.password, 'string'));
    it('has database', () => assert.equal(typeof config.database, 'string'));
  });
  describe('operations', () => {
    before(() => {
      createConnectionPool(config);
    });
    describe('queries', () => {
      it('was executed', async () => {
        assert.doesNotThrow(
          async () => await query('SELECT current_database()'),
        );
      });
    });
    describe('transactions', () => {
      it('was executed', async () => {
        assert.doesNotThrow(
          async () =>
            await transaction(async (query) => {
              await query('SELECT current_database()');
            }),
        );
      });
    });
  });
});
