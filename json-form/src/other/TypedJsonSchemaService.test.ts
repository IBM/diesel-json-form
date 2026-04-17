import { describe, expect, test } from 'vitest';
import { TypedJsonSchemaService } from './TypedJsonSchemaService';
import { readFileSync } from 'fs';

describe('TypedJsonSchemaService', async () => {
  const service = await TypedJsonSchemaService.load(
    readFileSync('../node_modules/typed-json-ts/dist/typedJson.wasm').buffer,
  );

  test('should be loadable', async () => {
    expect(service).toBeInstanceOf(TypedJsonSchemaService);
  });

  test('version', async () => {
    const version = service.typedJson.version();
    expect(version).toEqual('0.9.1');
  });
});
