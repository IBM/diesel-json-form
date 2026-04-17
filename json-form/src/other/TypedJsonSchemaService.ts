import {
  BasicOutput,
  SuggestionOutput,
  toValueWithMeta,
  TypedJson,
} from 'typed-json-ts';
import { JsonValue, parseJsonValue, stringify } from '../JsonValue';
import { JsPath } from '../JsPath';
import {
  SchemaRenderer,
  SchemaService,
  ValidationError,
  ValidationResult,
} from '../SchemaService';
import { map2 } from 'tea-cup-fp';

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
    return map2(
      stringify(schema),
      stringify(instance),
      (schemaValue: string, instanceValue) =>
        this.typedJson.validate(schemaValue, instanceValue),
    )
      .map((r) => r.then((r) => new TypedJsonValidationResult(r)))
      .withDefaultSupply(() => Promise.reject('Broken schema or instance'));
  }

  propose(
    schema: JsonValue,
    instance: JsonValue,
    path: JsPath,
  ): Promise<readonly JsonValue[]> {
    return map2(
      stringify(schema),
      stringify(instance),
      async (schemaValue: string, instanceValue) => {
        const suggestOutputs = await this.typedJson.suggest(
          schemaValue,
          instanceValue,
          path.format(),
          true,
        );
        const vs = toValueWithMeta(suggestOutputs)
          .map((v) => v.value)
          .map((v) => '' + v);
        return vs.map((v) =>
          parseJsonValue(v).withDefaultSupply(() => {
            throw new Error('Invalid JSON');
          }),
        );
      },
    ).withDefaultSupply(() => Promise.reject('Broken schema or instance'));
  }
}

// function flattenSuggestionOutputValues(
//   suggestOutput: readonly SuggestionOutput[],
// ): readonly string[] {
//   return [];
// }

class TypedJsonValidationResult implements ValidationResult {
  constructor(private readonly r: BasicOutput) {}

  getErrors(): readonly ValidationError[] {
    return this.r.valid
      ? []
      : (this.r.errors?.map((e) => ({
          message: e.error,
          path: e.instanceLocation.slice(1),
        })) ?? []);
  }

  getRenderers(): ReadonlyMap<string, SchemaRenderer> {
    throw new Error('Method not implemented.');
  }
  getFormats(path: JsPath): readonly string[] {
    throw new Error('Method not implemented.');
  }
  getDiscriminator(path: JsPath): string | undefined {
    throw new Error('Method not implemented.');
  }
}
