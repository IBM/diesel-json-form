import { describe, test, expect } from 'vitest';
import { TCK_TESTS } from './tck';
import { defaultSchemaService } from './SchemaService';

describe('tck test', () => {
  for (const tckTest of TCK_TESTS) {
    test(tckTest.title, async () => {
      const proposals = await tckTest.getProposals(defaultSchemaService);
      expect(proposals).toEqual(tckTest.expected);
    });
  }
});
