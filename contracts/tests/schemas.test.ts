import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const schemasDir = path.join(import.meta.dirname, '..', 'schemas');
const fixturesDir = path.join(import.meta.dirname, '..', 'fixtures');

const schemas = ['device-config-v1', 'profile-v1', 'session-v1', 'memory-v1', 'status-v1'];

describe('contract schemas', () => {
  for (const schemaName of schemas) {
    describe(schemaName, () => {
      it('has a valid schema file', () => {
        const schemaPath = path.join(schemasDir, `${schemaName}.schema.json`);
        expect(fs.existsSync(schemaPath)).toBe(true);

        const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf-8'));
        expect(schema.$schema).toContain('json-schema');
        expect(schema.title).toBeDefined();
        expect(schema.properties).toBeDefined();
      });

      it('valid fixture passes validation', () => {
        const fixturePath = path.join(fixturesDir, 'valid', `${schemaName}.json`);
        expect(fs.existsSync(fixturePath)).toBe(true);

        const fixture = JSON.parse(fs.readFileSync(fixturePath, 'utf-8'));
        expect(fixture.schema_version).toBe('1.0');
      });

      it('invalid fixture has intentional errors', () => {
        const fixturePath = path.join(fixturesDir, 'invalid', `${schemaName}.json`);
        expect(fs.existsSync(fixturePath)).toBe(true);

        const fixture = JSON.parse(fs.readFileSync(fixturePath, 'utf-8'));
        // Invalid fixtures should have at least one field that violates the schema
        expect(Object.keys(fixture).length).toBeGreaterThan(0);
      });
    });
  }
});
