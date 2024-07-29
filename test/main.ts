import assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';
import * as pg from '../dist';

describe('main', () => {
  const table = `_test_${new Date().getTime()}`;
  before(async () => {
    const port = Number(process.env.POSTGRESQL_PORT || 'default');
    const config: pg.Config = {
      host: process.env.POSTGRESQL_HOST || 'localhost',
      port: isNaN(port) ? 5432 : port,
      user: process.env.POSTGRESQL_USER!,
      password: process.env.POSTGRESQL_PASSWORD!,
      database: process.env.POSTGRESQL_DATABASE!,
    };
    pg.createConnectionPool(config);
    await pg.transaction(async (query) => {
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
        `UPDATE ${table} SET _bigint = 900719925474099 WHERE name = 'bigint'`,
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
    pg.types.setTypeParser(pg.types.builtins.INT8, (value) => parseInt(value)); // bigint
    pg.types.setTypeParser(pg.types.builtins.NUMERIC, (value) =>
      parseFloat(value),
    ); // decimal
    pg.types.setTypeParser(pg.types.builtins.DATE, (value) => value); // date
    const datetimeParser = (value: string) => value.replace(' ', 'T');
    pg.types.setTypeParser(pg.types.builtins.TIMESTAMP, datetimeParser); // datetime
    pg.types.setTypeParser(pg.types.builtins.TIMESTAMPTZ, datetimeParser); // datetimetz
  });
  it('should select 11 rows', async () => {
    const result = await pg.query(`SELECT * FROM ${table}`);
    console.log(result.rows);
    assert.equal(result.rowCount, 11);
  });
  after(async () => {
    await pg.query(`DROP TABLE ${table}`);
  });
});
