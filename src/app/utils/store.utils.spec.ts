import { prefixStorageKey } from './store.utils';

describe('prefixStorageKey', () => {
  it('puts the app name in front of the key', () => {
    expect(prefixStorageKey('chordLabel')).toBe('chara-lite-chordLabel');
  });

  it('keeps the key as it is, even when it is empty', () => {
    expect(prefixStorageKey('')).toBe('chara-lite-');
    expect(prefixStorageKey('a-b c')).toBe('chara-lite-a-b c');
  });

  // Both apps are served from the same origin (github.io), so a key that
  // matched the other app's prefix would read its saved data.
  it('differs from the prefix of the full app by more than a suffix match', () => {
    expect(prefixStorageKey('x')).not.toBe('chara-x');
  });
});
