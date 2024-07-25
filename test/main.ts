import assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';
import { Config, createConnectionPool, query, transaction } from '../dist';

describe('main', () => {
  const id = `${new Date().getTime()}`;
  const departments = `_test_${id}_departments`;
  const employees = `_test_${id}_employees`;
  before(async () => {
    const port = Number(process.env.POSTGRESQL_PORT || 'default');
    const config: Config = {
      host: process.env.POSTGRESQL_HOST || 'localhost',
      port: isNaN(port) ? 5432 : port,
      user: process.env.POSTGRESQL_USER!,
      password: process.env.POSTGRESQL_PASSWORD!,
      database: process.env.POSTGRESQL_DATABASE!,
    };
    createConnectionPool(config);
    await transaction(async (query) => {
      await query(
        `CREATE TABLE ${departments} (` +
          'id SERIAL,' +
          'name character varying(50) NOT NULL,' +
          'location character varying(50) NOT NULL,' +
          `CONSTRAINT ${departments}_pk PRIMARY KEY (id),` +
          `CONSTRAINT ${departments}_uk UNIQUE (name)` +
          ')',
      );
      await query(
        `INSERT INTO ${departments} (name, location) VALUES ('Finance', 'New York')`,
      );
      await query(
        `INSERT INTO ${departments} (name, location) VALUES ('Development', 'San Jose')`,
      );
      await query(
        `CREATE TABLE ${employees} (` +
          'id SERIAL,' +
          'name character varying(50) NOT NULL,' +
          'job character varying(50) NOT NULL,' +
          'manager_id integer,' +
          'hire_date date,' +
          'salary numeric(7,2) NOT NULL,' +
          'commission numeric(7,2),' +
          'department_id integer NOT NULL,' +
          'is_casual boolean NOT NULL DEFAULT false,' +
          "start_time time DEFAULT '09:00'," +
          "finish_time time DEFAULT '5:00pm'," +
          'notes text,' +
          `creation_date timestamp with time zone NOT NULL DEFAULT now(),` +
          `last_update_date timestamp(3) with time zone NOT NULL DEFAULT now(),` +
          `CONSTRAINT ${employees}_pk PRIMARY KEY (id),` +
          `CONSTRAINT ${employees}_uk UNIQUE (name),` +
          `CONSTRAINT ${employees}_fk_1 FOREIGN KEY (manager_id) REFERENCES ${employees} (id),` +
          `CONSTRAINT ${employees}_fk_2 FOREIGN KEY (department_id) REFERENCES ${departments} (id)` +
          ')',
      );
      await query(
        `INSERT INTO ${employees} (name, job, salary, department_id) VALUES ` +
          `('Sam Smith', 'Programmer', 50000, (SELECT id FROM ${departments} WHERE name = 'Development')),` +
          `('Mara Martin', 'Analyst', 60000, (SELECT id FROM ${departments} WHERE name = 'Finance')),` +
          `('Yun Yates', 'Analyst', 55000, (SELECT id FROM ${departments} WHERE name = 'Development'))`,
      );
      await query(`ALTER TABLE ${employees} ADD COLUMN country_code char(2)`);
      await query(`UPDATE ${employees} SET country_code = 'US'`);
      await query(
        `UPDATE ${employees} SET commission = 20000, last_update_date = now() + (5 * interval '1  ms') WHERE name = 'Sam Smith'`,
      );
    });
  });
  it('should select 2 departments', async () => {
    const result = await query(`SELECT * FROM ${departments}`);
    //console.log(result.rows);
    assert.equal(result.rowCount, 2);
  });
  it('should select 3 employees', async () => {
    const result = await query(`SELECT * FROM ${employees}`);
    //console.log(result.rows);
    assert.equal(result.rowCount, 3);
  });
  after(async () => {
    await transaction(async (query) => {
      await query(`DROP TABLE ${departments} CASCADE`);
      await query(`DROP TABLE ${employees}`);
    });
  });
});
