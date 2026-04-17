import { TypedJson } from 'typed-json-ts';
import { JsonValue } from '../JsonValue';
import { JsPath } from '../JsPath';
import { SchemaService, ValidationResult } from '../SchemaService';

export class TypedJsonSchemaService implements SchemaService {
  static async load(
    wasm?: string | ArrayBuffer,
  ): Promise<TypedJsonSchemaService> {
    return TypedJson.load(wasm).then(
      (typedJson) => new TypedJsonSchemaService(typedJson),
    );
  }

  private constructor(public readonly typedJson: TypedJson) {}

  validate(schema: JsonValue, instance: JsonValue): Promise<ValidationResult> {
    throw new Error('Method not implemented.');
  }
  propose(
    schema: JsonValue,
    instance: JsonValue,
    path: JsPath,
  ): Promise<readonly JsonValue[]> {
    throw new Error('Method not implemented.');
  }
}
