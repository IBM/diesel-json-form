import { diffLists, formatDiffResult } from './diffLists';

const diff = (oldStr: string, newStr: string) =>
  diffLists(oldStr.split(''), newStr.split(''));

describe('Diff Algorithm', () => {
  describe('Basic diff functionality', () => {
    test('should detect additions', () => {
      const result = diff('abc', 'abcd');
      expect(result.additions).toBe(1);
      expect(result.deletions).toBe(0);
      expect(result.common).toBe(3);
      expect(result.changes).toHaveLength(4);
      expect(result.changes[3]).toEqual({
        type: 'add',
        value: 'd',
        rightIndex: 3,
      });
    });

    test('should detect deletions', () => {
      const result = diff('abcd', 'abc');
      expect(result.additions).toBe(0);
      expect(result.deletions).toBe(1);
      expect(result.common).toBe(3);
      expect(result.changes).toHaveLength(4);
      expect(result.changes[3]).toEqual({
        type: 'remove',
        value: 'd',
        leftIndex: 3,
      });
    });

    test('should detect substitutions', () => {
      const result = diff('hello', 'hallo');
      expect(result.additions).toBe(1);
      expect(result.deletions).toBe(1);
      expect(result.common).toBe(4);
      expect(result.changes).toHaveLength(6);

      // Check that 'e' is removed and 'a' is added
      const removeChange = result.changes.find(
        (c) => c.type === 'remove' && c.value === 'e',
      );
      const addChange = result.changes.find(
        (c) => c.type === 'add' && c.value === 'a',
      );
      expect(removeChange).toBeDefined();
      expect(addChange).toBeDefined();
    });

    test('should handle identical strings', () => {
      const result = diff('hello', 'hello');
      expect(result.additions).toBe(0);
      expect(result.deletions).toBe(0);
      expect(result.common).toBe(5);
      expect(result.changes).toHaveLength(5);
      expect(result.changes.every((c) => c.type === 'common')).toBe(true);
    });

    test('should handle completely different strings', () => {
      const result = diff('abc', 'xyz');
      expect(result.additions).toBe(3);
      expect(result.deletions).toBe(3);
      expect(result.common).toBe(0);
      expect(result.changes).toHaveLength(6);
    });
  });

  describe('Edge cases', () => {
    test('should handle empty old string', () => {
      const result = diff('', 'hello');
      expect(result.additions).toBe(5);
      expect(result.deletions).toBe(0);
      expect(result.common).toBe(0);
      expect(result.changes).toHaveLength(5);
      expect(result.changes.every((c) => c.type === 'add')).toBe(true);
    });

    test('should handle empty new string', () => {
      const result = diff('hello', '');
      expect(result.additions).toBe(0);
      expect(result.deletions).toBe(5);
      expect(result.common).toBe(0);
      expect(result.changes).toHaveLength(5);
      expect(result.changes.every((c) => c.type === 'remove')).toBe(true);
    });

    test('should handle both empty strings', () => {
      const result = diff('', '');
      expect(result.additions).toBe(0);
      expect(result.deletions).toBe(0);
      expect(result.common).toBe(0);
      expect(result.changes).toHaveLength(0);
    });

    test('should handle single character strings', () => {
      const result = diff('a', 'b');
      expect(result.additions).toBe(1);
      expect(result.deletions).toBe(1);
      expect(result.common).toBe(0);
      expect(result.changes).toHaveLength(2);
    });
  });

  describe('Case sensitivity', () => {
    test('should be case-sensitive by default', () => {
      const result = diff('Hello', 'hello');
      expect(result.additions).toBe(1);
      expect(result.deletions).toBe(1);
      expect(result.common).toBe(4);
    });
  });

  describe('Complex scenarios', () => {
    test('should handle multiple changes', () => {
      const result = diff('AGGTAB', 'GXTXAYB');
      expect(result.additions).toBeGreaterThan(0);
      expect(result.deletions).toBeGreaterThan(0);
      expect(result.common).toBeGreaterThan(0);
      expect(result.changes.length).toBe(
        result.additions + result.deletions + result.common,
      );
    });
  });

  describe('Change positions', () => {
    test('should track positions for common elements', () => {
      const result = diff('abc', 'abc');
      result.changes.forEach((change, idx) => {
        expect(change.type).toBe('common');
        if (change.type === 'common') {
          expect(change.leftIndex).toBe(idx);
          expect(change.rightIndex).toBe(idx);
        }
      });
    });

    test('should track positions for additions', () => {
      const result = diff('ac', 'abc');
      const addChange = result.changes.find(
        (c) => c.type === 'add' && c.value === 'b',
      );
      expect(addChange?.type).toBe('add');
      if (addChange?.type === 'add') {
        expect(addChange.rightIndex).toBe(1);
      }
    });

    test('should track positions for deletions', () => {
      const result = diff('abc', 'ac');
      const removeChange = result.changes.find(
        (c) => c.type === 'remove' && c.value === 'b',
      );
      expect(removeChange?.type).toBe('remove');
      if (removeChange?.type === 'remove') {
        expect(removeChange.leftIndex).toBe(1);
      }
    });
  });
});

describe('Diff Formatting', () => {
  describe('formatDiff', () => {
    test('should format simple diff', () => {
      const result = diff('abc', 'adc');
      const formatted = formatDiffResult(result);
      expect(formatted).toEqual(['  a', '- b', '+ d', '  c']);
    });

    test('should format additions only', () => {
      const result = diff('ab', 'abc');
      const formatted = formatDiffResult(result);
      expect(formatted).toEqual(['  a', '  b', '+ c']);
    });

    test('should format deletions only', () => {
      const result = diff('abc', 'ab');
      const formatted = formatDiffResult(result);
      expect(formatted).toEqual(['  a', '  b', '- c']);
    });

    test('should format identical strings', () => {
      const result = diff('abc', 'abc');
      const formatted = formatDiffResult(result);
      expect(formatted).toEqual(['  a', '  b', '  c']);
    });
  });
});
