import { OptionsLcs, calculateLcs } from './lcs';

const lcs = (s1: string, s2: string, options?: OptionsLcs<string>) =>
  calculateLcs(s1.split(''), s2.split(''), {
    isEqual: (a, b) => a === b,
    ...options,
  });

describe('LCS Algorithm', () => {
  describe('Basic functionality', () => {
    test('should find LCS of two simple strings', () => {
      const result = lcs('ABCDGH', 'AEDFHR');
      expect(result.sequence.join('')).toBe('ADH');
    });

    test('should find LCS of identical strings', () => {
      const result = lcs('HELLO', 'HELLO');
      expect(result.sequence.join('')).toBe('HELLO');
    });

    test('should find LCS when one string is substring of another', () => {
      const result = lcs('ABCDEF', 'ACE');
      expect(result.sequence.join('')).toBe('ACE');
    });

    test('should handle strings with no common subsequence', () => {
      const result = lcs('ABC', 'XYZ');
      expect(result.sequence.join('')).toBe('');
    });

    test('should find LCS with repeated characters', () => {
      const result = lcs('AAAA', 'AA');
      expect(result.sequence.join('')).toBe('AA');
    });
  });

  describe('Edge cases', () => {
    test('should handle empty first string', () => {
      const result = lcs('', 'HELLO');
      expect(result.sequence.join('')).toBe('');
    });

    test('should handle empty second string', () => {
      const result = lcs('HELLO', '');
      expect(result.sequence.join('')).toBe('');
    });

    test('should handle both empty strings', () => {
      const result = lcs('', '');
      expect(result.sequence.join('')).toBe('');
    });

    test('should handle single character strings that match', () => {
      const result = lcs('A', 'A');
      expect(result.sequence.join('')).toBe('A');
    });

    test('should handle single character strings that do not match', () => {
      const result = lcs('A', 'B');
      expect(result.sequence.join('')).toBe('');
    });
  });

  describe('Case sensitivity', () => {
    test('should be case-sensitive by default', () => {
      const result = lcs('Hello', 'hello');
      expect(result.sequence.join('')).toBe('ello');
    });
  });

  describe('Matrix inclusion', () => {
    test('should not include matrix by default', () => {
      const result = lcs('ABC', 'AC');
      expect(result.matrix).toBeUndefined();
    });

    test('should include matrix when requested', () => {
      const result = lcs('ABC', 'AC', { includeMatrix: true });
      expect(result.matrix).toBeDefined();
      expect(Array.isArray(result.matrix)).toBe(true);
      expect(result.matrix?.length).toBe(4); // m + 1
      expect(result.matrix?.[0].length).toBe(3); // n + 1
    });

    test('should have correct matrix values', () => {
      const result = lcs('AB', 'AB', { includeMatrix: true });
      expect(result.matrix).toBeDefined();

      // Check bottom-right corner has the LCS length
      const m = result.matrix!.length - 1;
      const n = result.matrix![0].length - 1;
      expect(result.matrix![m][n]).toBe(2);
    });
  });

  describe('Complex scenarios', () => {
    test('should handle longer strings', () => {
      const str1 = 'AGGTAB';
      const str2 = 'GXTXAYB';
      const result = lcs(str1, str2);
      expect(result.sequence.join('')).toBe('GTAB');
    });

    test('should handle strings with spaces', () => {
      const result = lcs('hello world', 'halo world');
      expect(result.sequence.join('')).toBe('hlo world');
    });

    test('should handle strings with special characters', () => {
      const result = lcs('a@b#c', 'a#c@');
      expect(result.sequence.join('')).toBe('a#c');
    });

    test('should handle strings with numbers', () => {
      const result = lcs('123456', '135');
      expect(result.sequence.join('')).toBe('135');
    });

    test('should handle Unicode characters', () => {
      const result = lcs('café', 'caféé');
      expect(result.sequence.join('')).toBe('café');
    });

    test('should handle emojis', () => {
      const result = lcs('hello 👋 world 🌍', 'hello 🌍');
      expect(result.sequence.join('')).toBe('hello 🌍');
    });
  });

  describe('Performance', () => {
    test('should handle moderately long strings efficiently', () => {
      const str1 = 'A'.repeat(100) + 'B'.repeat(100);
      const str2 = 'A'.repeat(50) + 'C'.repeat(50) + 'B'.repeat(50);

      const startTime = Date.now();
      const result = lcs(str1, str2);
      const endTime = Date.now();

      expect(result.sequence.length).toBe(100); // 50 A's + 50 B's
      expect(endTime - startTime).toBeLessThan(1000); // Should complete in less than 1 second
    });
  });
});
