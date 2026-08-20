import { describe, it, expect } from 'vitest';
import { disambiguateName } from '../../src/people/disambiguate.js';

describe('disambiguateName', () => {
  it('returns original name when no duplicates', () => {
    const result = disambiguateName('Juan', ['Juan']);
    expect(result).toBe('Juan');
  });

  it('appends number for duplicates', () => {
    const result = disambiguateName('Juan', ['Juan', 'Juan']);
    expect(result).toBe('Juan (2)');
  });

  it('handles multiple duplicates', () => {
    const result = disambiguateName('Juan', ['Juan', 'Juan', 'Juan']);
    expect(result).toBe('Juan (3)');
  });

  it('disambiguates based on position', () => {
    const names = ['Juan', 'Juan', 'Juan'];
    const results = names.map((name, i) => disambiguateName(name, names, i));
    expect(results).toEqual(['Juan (1)', 'Juan (2)', 'Juan (3)']);
  });

  it('handles mixed names', () => {
    const names = ['Juan', 'Maria', 'Juan'];
    const results = names.map((name, i) => disambiguateName(name, names, i));
    expect(results).toEqual(['Juan (1)', 'Maria', 'Juan (2)']);
  });

  it('trims whitespace', () => {
    const result = disambiguateName('  Juan  ', ['Juan']);
    expect(result).toBe('Juan');
  });
});
