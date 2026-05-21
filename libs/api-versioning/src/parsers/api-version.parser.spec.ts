import { parseApiVersion } from './api-version.parser';

describe('parseApiVersion', () => {
  it('defaults missing version to version 1', () => {
    expect(parseApiVersion(undefined)).toBe(1);
  });

  it('parses supported version header values', () => {
    expect(parseApiVersion('1')).toBe(1);
    expect(parseApiVersion('2')).toBe(2);
  });

  it('uses the first value when duplicate version headers are present', () => {
    expect(parseApiVersion(['2', '1'])).toBe(2);
  });

  it('rejects unsupported version values', () => {
    expect(() => parseApiVersion('3')).toThrow('Unsupported API version');
    expect(() => parseApiVersion('abc')).toThrow('Unsupported API version');
  });
});
