import { describe, expect, test } from 'vitest';
import { getUtcOffsets } from './UtcOffsets.js';

describe('UTC offsets', () => {
  test('get UTC offsets', () => {
    const utcOffsets = getUtcOffsets();
    expect(utcOffsets).toContain('+02:00');
    expect(utcOffsets).not.toContain('Z');
    expect(utcOffsets).toContain('+00:00');
    expect(utcOffsets.filter((s) => s === '+02:00').length).toBe(1);
  });
  test('UTC offsets are sorted', () => {
    const offsets = getUtcOffsets();
    const indexOfA = offsets.indexOf('-12:00');
    const indexOfB = offsets.indexOf('+12:00');
    expect(indexOfA).toBeLessThan(indexOfB);
  });
  test('all UTC offsets', () => {
    expect(getUtcOffsets()).toEqual([
      '-11:00',
      '-10:00',
      '-09:30',
      '-09:00',
      '-08:00',
      '-07:00',
      '-06:00',
      '-05:00',
      '-04:00',
      '-03:00',
      '-02:30',
      '-02:00',
      '-01:00',
      '+00:00',
      '+01:00',
      '+02:00',
      '+03:00',
      '+03:30',
      '+04:00',
      '+04:30',
      '+05:00',
      '+05:30',
      '+05:45',
      '+06:00',
      '+06:30',
      '+07:00',
      '+08:00',
      '+08:45',
      '+09:00',
      '+09:30',
      '+10:00',
      '+10:30',
      '+11:00',
      '+12:00',
      '+12:45',
      '+13:00',
      '+14:00',
    ]);
  });
});
