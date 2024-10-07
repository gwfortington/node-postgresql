import assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';

import { Debug, MessageType } from 'node-debug';
import {
  Config,
  createConnectionPool,
  query,
  shutdown,
  transaction,
  types,
} from '../dist';

describe('main', (suiteContext) => {
  Debug.initialize(true);
  let debug: Debug;
  const tableName = `_test_${Math.random().toString().substring(2)}`;
  before(async () => {
    debug = new Debug(`${suiteContext.name}.before`);
    debug.write(MessageType.Entry);
    debug.write(MessageType.Step, 'Creating config...');
    const port = Number(process.env.POSTGRESQL_PORT || 'default');
    const config: Config = {
      host: process.env.POSTGRESQL_HOST || 'localhost',
      port: isNaN(port) ? 5432 : port,
      user: process.env.POSTGRESQL_USER!,
      password: process.env.POSTGRESQL_PASSWORD!,
      database: process.env.POSTGRESQL_DATABASE!,
    };
    debug.write(MessageType.Step, 'Creating connection pool...');
    createConnectionPool(config);
    await transaction(async (query) => {
      debug.write(MessageType.Step, `Creating temp table "${tableName}"...`);
      await query(
        `CREATE TABLE ${tableName} (` +
          'id serial, ' + // serial is shorthand for autoincrementing integer
          'name varchar(30) NOT NULL, ' +
          'description varchar(255), ' +
          '_varchar varchar(10), ' + // varchar is alias for character varying
          '_text text, ' +
          '_smallint smallint, ' +
          '_integer integer, ' +
          '_bigint bigint, ' +
          '_decimal decimal(10, 2), ' + // decimal is alias for numeric
          '_date date, ' +
          '_time time, ' +
          '_timestamp timestamp, ' +
          '_timestamptz timestamptz, ' +
          '_boolean boolean, ' +
          `CONSTRAINT ${tableName}_pk PRIMARY KEY (id), ` +
          `CONSTRAINT ${tableName}_uk UNIQUE (name)` +
          ')',
      );
      debug.write(
        MessageType.Step,
        `Loading data into temp table "${tableName}"...`,
      );
      await query(
        `INSERT INTO ${tableName} (name, description) VALUES ` +
          "('varchar', 'variable-length with limit'), " +
          "('text', 'variable unlimited length'), " +
          "('smallint', 'small-range integer'), " +
          "('integer', 'typical choice for integer'), " +
          "('bigint', 'large-range integer'), " +
          "('decimal', 'user-specified precision, exact'), " +
          "('date', 'date (no time of day)'), " +
          "('time', 'time of day (no date)'), " +
          "('timestamp', 'both date and time (no time zone)'), " +
          "('timestamptz', 'both date and time, with time zone'), " +
          "('boolean', 'state of true or false')",
      );
      await query(
        `UPDATE ${tableName} SET _varchar = 'n=10' WHERE name = 'varchar'`,
      );
      await query(
        `UPDATE ${tableName} SET _text = 'up to 65,535 bytes' WHERE name = 'text'`,
      );
      await query(
        `UPDATE ${tableName} SET _smallint = 32767 WHERE name = 'smallint'`,
      );
      await query(
        `UPDATE ${tableName} SET _integer = 2147483647 WHERE name = 'integer'`,
      );
      await query(
        `UPDATE ${tableName} SET _bigint = 9007199254740991 WHERE name = 'bigint'`,
      ); // using js MAX_SAFE_INTEGER in lieu of pg max. 9223372036854775807
      await query(
        `UPDATE ${tableName} SET _decimal = 99999999.99 WHERE name = 'decimal'`,
      );
      await query(
        `UPDATE ${tableName} SET _date = '1999-01-08' WHERE name = 'date'`,
      );
      await query(
        `UPDATE ${tableName} SET _time = '04:05:06.789' WHERE name = 'time'`,
      );
      await query(
        `UPDATE ${tableName} SET _timestamp = '1999-01-08T04:05:06.789' WHERE name = 'timestamp'`,
      );
      await query(
        `UPDATE ${tableName} SET _timestamptz = '1999-01-08T04:05:06.789' WHERE name = 'timestamptz'`,
      );
      await query(
        `UPDATE ${tableName} SET _boolean = true WHERE name = 'boolean'`,
      );
    });
    debug.write(MessageType.Step, `Setting type parsers...`);
    types.setTypeParser(types.builtins.INT8, (value) => parseInt(value)); // bigint
    types.setTypeParser(types.builtins.NUMERIC, (value) => parseFloat(value)); // decimal
    types.setTypeParser(types.builtins.DATE, (value) => value);
    const timestampParser = (value: string) => value.replace(' ', 'T');
    types.setTypeParser(types.builtins.TIMESTAMP, timestampParser);
    types.setTypeParser(types.builtins.TIMESTAMPTZ, timestampParser);
    debug.write(MessageType.Exit);
  });
  it('types', async (testContext) => {
    debug = new Debug(`${suiteContext.name}.test.${testContext.name}`);
    debug.write(MessageType.Entry);
    debug.write(
      MessageType.Step,
      `Selecting from temp table "${tableName}"...`,
    );
    const result = await query(`SELECT * FROM ${tableName}`);
    debug.write(MessageType.Value, JSON.stringify(result.rows));
    debug.write(MessageType.Exit);
    assert.ok(true);
  });
  after(async () => {
    debug = new Debug(`${suiteContext.name}.after`);
    debug.write(MessageType.Entry);
    debug.write(MessageType.Step, `Dropping temp table "${tableName}"...`);
    await query(`DROP TABLE ${tableName}`);
    debug.write(MessageType.Step, `Shutting down...`);
    await shutdown();
    debug.write(MessageType.Exit);
  });
});
