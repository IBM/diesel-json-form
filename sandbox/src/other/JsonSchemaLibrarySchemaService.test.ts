import { describe, test, expect } from 'vitest';
import { JsonSchemaLibrarySchemaService } from './JsonSchemaLibrarySchemaService';
import {
  JsonValue,
  JsPath,
  parseJsonValue,
  stringify,
  TCK_TESTS,
} from '@diesel-parser/json-form';

describe('JsonSchemaLibrary discovery tests', () => {
  const service = new JsonSchemaLibrarySchemaService();

  function parseUnsafe(s: string): JsonValue {
    return parseJsonValue(s)
      .toMaybe()
      .withDefaultSupply(() => {
        throw 'invalid json in \n' + s;
      });
  }

  async function tPropose(schema: unknown, path: string, instance: unknown) {
    const schemaValue = parseUnsafe(JSON.stringify(schema));
    const instanceValue = parseUnsafe(JSON.stringify(instance));
    const pathValue = JsPath.parse(path);
    return service.propose(schemaValue, instanceValue, pathValue).then((vs) =>
      vs.flatMap((v) =>
        stringify(v)
          .map((v) => [v])
          .withDefault([])
          .map((v) => JSON.parse(v)),
      ),
    );
  }

  test('first', async () => {
    const proposals = await tPropose({ type: 'number' }, '', null);
    expect(proposals).toEqual([0]);
  });
  test('deep', async () => {
    const proposals = await tPropose(
      { properties: { foo: { type: 'number' } } },
      '',
      {},
    );
    expect(proposals).toEqual([{ foo: 0 }]);
  });
  test('deeper', async () => {
    const proposals = await tPropose(
      { properties: { foo: { type: 'number' } } },
      'foo',
      { foo: undefined },
    );
    expect(proposals).toEqual([0]);
  });
});

describe('JsonSchemaLibrary tck test', () => {
  const service = new JsonSchemaLibrarySchemaService();
  for (const tckTest of TCK_TESTS) {
    test(tckTest.title, async () => {
      const proposals = await tckTest.getProposals(service);
      expect(proposals).toEqual(tckTest.expected);
    });
  }
});
