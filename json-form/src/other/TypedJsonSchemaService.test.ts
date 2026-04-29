import { describe, expect, test } from 'vitest';
import { TypedJsonSchemaService } from './TypedJsonSchemaService';
import { readFileSync } from 'fs';
import { parseJsonValue, stringify } from '../JsonValue';
import { JsPath } from '../JsPath';
import { TCK_TESTS } from '../tck';

describe('TypedJsonSchemaService', async () => {
  const service = await TypedJsonSchemaService.load(
    readFileSync('../node_modules/typed-json-ts/dist/wasm/typedJson.wasm')
      .buffer,
  );

  test('should be loadable', async () => {
    expect(service).toBeInstanceOf(TypedJsonSchemaService);
  });

  test('version', async () => {
    const version = service.typedJson.version();
    expect(version).toEqual('0.11.3');
  });

  test('validate', async () => {
    const errors = await service
      .validate(
        parseJsonValueUnsafe(`{"type":"number"}`),
        parseJsonValueUnsafe(`"hello"`),
      )
      .then((r) => r.getErrors());
    expect(errors).toEqual([{ message: 'expected type: number', path: '' }]);
  });

  test('propose', async () => {
    const values = await service
      .propose(
        parseJsonValueUnsafe(`{"type":"number"}`),
        parseJsonValueUnsafe(`""`),
        JsPath.empty,
      )
      .then((r) =>
        r.flatMap((v) =>
          stringify(v)
            .map((v) => [v])
            .withDefaultSupply(() => []),
        ),
      );
    expect(values).toEqual(['0']);
  });

  describe('tck test', () => {
    for (const tckTest of TCK_TESTS) {
      test(tckTest.title, async () => {
        const proposals = await tckTest.getProposals(service);
        expect(proposals).toEqual(tckTest.expected);
      });
    }
  });
});

function parseJsonValueUnsafe(json: string) {
  return parseJsonValue(json).withDefaultSupply(() => {
    throw new Error('Invalid JSON');
  });
}
