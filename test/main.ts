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
          'id serial,' +
          'name varchar(30) NOT NULL,' +
          'description varchar(255),' +
          '_char char(10),' +
          '_varchar varchar(80),' +
          '_text text,' +
          '_smallint smallint,' +
          '_integer integer,' +
          '_bigint bigint,' +
          '_decimal decimal(6, 2),' +
          '_date date,' +
          '_time time(0),' +
          '_timetz timetz(1),' +
          '_datetime timestamp(2),' +
          '_datetimetz timestamptz(3),' +
          '_boolean boolean,' +
          'parent_id integer,' +
          `CONSTRAINT ${table}_pk PRIMARY KEY (id),` +
          `CONSTRAINT ${table}_uk UNIQUE (name),` +
          `CONSTRAINT ${table}_fk FOREIGN KEY (parent_id) REFERENCES ${table} (id)` +
          ')',
      );
      await query(
        `INSERT INTO ${table} (name, description, _char) VALUES ('char', 'fixed-length, blank-padded', 'n=10')`,
      );
      await query(
        `INSERT INTO ${table} (name, description, _varchar) VALUES ('varchar', 'variable-length with limit', 'n=80')`,
      );
      await query(
        `INSERT INTO ${table} (name, description, _text) VALUES ('text', 'variable unlimited length', 'n=any')`,
      );
      await query(
        `INSERT INTO ${table} (name, description, _smallint) VALUES ('smallint', 'small-range integer', 32767)`,
      );
      await query(
        `INSERT INTO ${table} (name, description, _integer) VALUES ('integer', 'typical choice for integer', 2147483647)`,
      );
      await query(
        `INSERT INTO ${table} (name, description, _bigint) VALUES ('bigint', 'large-range integer', 9223372036854775807)`,
      );
      await query(
        `INSERT INTO ${table} (name, description, _decimal) VALUES ('decimal', 'user-specified precision, exact', 9999.99)`,
      );
      await query(
        `INSERT INTO ${table} (name, description, _date) VALUES ('date', 'date (no time of day)', '1999-01-08')`,
      );
      await query(
        `INSERT INTO ${table} (name, description, _time) VALUES ('time', 'time of day (no date)', '04:05:06.789')`,
      );
      await query(
        `INSERT INTO ${table} (name, description, _timetz) VALUES ('timetz', 'time of day (no date), with time zone', '04:05:06.789')`,
      );
      await query(
        `INSERT INTO ${table} (name, description, _datetime) VALUES ('datetime', 'both date and time (no time zone)', '1999-01-08T04:05:06.789')`,
      );
      await query(
        `INSERT INTO ${table} (name, description, _datetimetz) VALUES ('datetimetz', 'both date and time, with time zone', '1999-01-08T04:05:06.789')`,
      );
      await query(
        `INSERT INTO ${table} (name, description, _boolean) VALUES ('boolean', 'state of true or false', true)`,
      );
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
  it('should select 13 rows', async () => {
    const result = await pg.query(`SELECT * FROM ${table}`);
    console.log(result.rows);
    assert.equal(result.rowCount, 13);
  });
  after(async () => {
    await pg.query(`DROP TABLE ${table}`);
  });
});
