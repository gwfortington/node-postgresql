import { after, before, describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { Debug, MessageType } from 'node-debug';
import * as pg from '../dist';

describe('main', (suiteContext) => {
  Debug.initialise(':001');
  let debug: Debug;
  const table = `_test_${Math.random().toString().substring(2)}`;
  before(async () => {
    debug = new Debug(`${suiteContext.name}.before`);
    debug.write(MessageType.Entry);
    debug.write(MessageType.Step, 'Creating config...');
    const port = Number(process.env.POSTGRESQL_PORT || 'default');
    const config: pg.Config = {
      host: process.env.POSTGRESQL_HOST || 'localhost',
      port: isNaN(port) ? 5432 : port,
      user: process.env.POSTGRESQL_USER!,
      password: process.env.POSTGRESQL_PASSWORD!,
      database: process.env.POSTGRESQL_DATABASE!,
    };
    debug.write(MessageType.Step, 'Creating connection pool...');
    pg.createConnectionPool(config);
    await pg.transaction(async (query) => {
      debug.write(MessageType.Step, `Creating temp table "${table}"...`);
      await query(
        `CREATE TABLE ${table} (` +
          'id serial, ' + // serial is shorthand for autoincrementing integer
          'name varchar(30) NOT NULL, ' +
          'description varchar(255), ' +
          '_varchar varchar(10), ' +
          '_text text, ' +
          '_smallint smallint, ' +
          '_integer integer, ' +
          '_bigint bigint, ' +
          '_decimal decimal(10, 2), ' + // decimal is alias for numeric
          '_date date, ' +
          '_time time, ' +
          '_datetime timestamp, ' +
          '_datetimetz timestamptz, ' +
          '_boolean boolean, ' +
          `CONSTRAINT ${table}_id_pk PRIMARY KEY (id), ` +
          `CONSTRAINT ${table}_name_uk UNIQUE (name)` +
          ')',
      );
      debug.write(
        MessageType.Step,
        `Loading data into temp table "${table}"...`,
      );
      await query(
        `INSERT INTO ${table} (name, description) VALUES ` +
          "('varchar', 'variable-length with limit'), " +
          "('text', 'variable unlimited length'), " +
          "('smallint', 'small-range integer'), " +
          "('integer', 'typical choice for integer'), " +
          "('bigint', 'large-range integer'), " +
          "('decimal', 'user-specified precision, exact'), " +
          "('date', 'date (no time of day)'), " +
          "('time', 'time of day (no date)'), " +
          "('datetime', 'both date and time (no time zone)'), " +
          "('datetimetz', 'both date and time, with time zone'), " +
          "('boolean', 'state of true or false')",
      );
      await query(
        `UPDATE ${table} SET _varchar = 'n=10' WHERE name = 'varchar'`,
      );
      await query(
        `UPDATE ${table} SET _text = 'up to 65,535 bytes' WHERE name = 'text'`,
      );
      await query(
        `UPDATE ${table} SET _smallint = 32767 WHERE name = 'smallint'`,
      );
      await query(
        `UPDATE ${table} SET _integer = 2147483647 WHERE name = 'integer'`,
      );
      await query(
        `UPDATE ${table} SET _bigint = 9007199254740991 WHERE name = 'bigint'`,
      ); // using js MAX_SAFE_INTEGER in lieu of pg max. 9223372036854775807
      await query(
        `UPDATE ${table} SET _decimal = 99999999.99 WHERE name = 'decimal'`,
      );
      await query(
        `UPDATE ${table} SET _date = '1999-01-08' WHERE name = 'date'`,
      );
      await query(
        `UPDATE ${table} SET _time = '04:05:06.789' WHERE name = 'time'`,
      );
      await query(
        `UPDATE ${table} SET _datetime = '1999-01-08T04:05:06.789' WHERE name = 'datetime'`,
      );
      await query(
        `UPDATE ${table} SET _datetimetz = '1999-01-08T04:05:06.789' WHERE name = 'datetimetz'`,
      );
      await query(`UPDATE ${table} SET _boolean = true WHERE name = 'boolean'`);
    });
    debug.write(MessageType.Step, `Setting type parsers...`);
    pg.types.setTypeParser(pg.types.builtins.INT8, (value) => parseInt(value)); // bigint
    pg.types.setTypeParser(pg.types.builtins.NUMERIC, (value) =>
      parseFloat(value),
    ); // decimal
    pg.types.setTypeParser(pg.types.builtins.DATE, (value) => value); // date
    const datetimeParser = (value: string) => value.replace(' ', 'T');
    pg.types.setTypeParser(pg.types.builtins.TIMESTAMP, datetimeParser); // datetime
    pg.types.setTypeParser(pg.types.builtins.TIMESTAMPTZ, datetimeParser); // datetimetz
    debug.write(MessageType.Exit);
  });
  it('selecting 11 rows', async (testContext) => {
    debug = new Debug(`${suiteContext.name}.test.${testContext.name}`);
    debug.write(MessageType.Entry);
    debug.write(MessageType.Step, `Selecting from temp table "${table}"...`);
    const result = await pg.query(`SELECT * FROM ${table}`);
    debug.write(MessageType.Value, JSON.stringify(result.rows));
    assert.equal(result.rowCount, 11);
    debug.write(MessageType.Exit);
  });
  after(async () => {
    debug = new Debug(`${suiteContext.name}.after`);
    debug.write(MessageType.Entry);
    debug.write(MessageType.Step, `Dropping temp table "${table}"...`);
    await pg.query(`DROP TABLE ${table}`);
    debug.write(MessageType.Step, `Shutting down...`);
    await pg.shutdown();
    debug.write(MessageType.Exit);
  });
});
