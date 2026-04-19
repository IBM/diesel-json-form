import { map2 } from 'tea-cup-fp';
import { BasicOutput, toValueWithMeta, TypedJson } from 'typed-json-ts';
import { JsonValue, parseJsonValue, stringify } from '../JsonValue';
import { JsPath } from '../JsPath';
import {
  SchemaRenderer,
  SchemaService,
  ValidationError,
  ValidationResult,
} from '../SchemaService';

export class TypedJsonSchemaService implements SchemaService {
  static async load(
    wasm?: string | ArrayBuffer,
  ): Promise<TypedJsonSchemaService> {
    return TypedJson.load(wasm).then(
      (typedJson) => new TypedJsonSchemaService(typedJson),
    );
  }

  private constructor(public readonly typedJson: TypedJson) { }

  validate(schema: JsonValue, instance: JsonValue): Promise<ValidationResult> {
    return map2(
      stringify(schema),
      stringify(instance),
      (schemaValue: string, instanceValue) =>
        this.typedJson.validate(schemaValue, instanceValue),
    )
      .map((r) =>
        r.then((r) => {
          console.log('validate', r);
          return new TypedJsonValidationResult(r);
        }),
      )
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
          path.isEmpty() ? '' : '/' + path.format(),
        );
        console.log('propose', path.format(), suggestOutputs);
        const vs = toValueWithMeta(suggestOutputs)
          .map((v) => v.value)
          .map((v) => JSON.stringify(v));
        return vs.map((v) =>
          parseJsonValue(v).withDefaultSupply(() => {
            console.error('Invalid JSON', v);
            throw new Error('Invalid JSON');
          }),
        );
      },
    ).withDefaultSupply(() => Promise.reject('Broken schema or instance'));
  }
}

// TODO propose to typed-json-ts
// function flattenSuggestionOutputValues(
//   suggestOutput: readonly SuggestionOutput[],
// ): readonly string[] {
//   return [];
// }

class TypedJsonValidationResult implements ValidationResult {
  constructor(private readonly r: BasicOutput) { }

  getErrors(): readonly ValidationError[] {
    return this.r.valid
      ? []
      : (this.r.errors?.map((e) => ({
        message: e.error,
        path: e.instanceLocation.slice(1),
      })) ?? []);
  }

  getRenderers(): ReadonlyMap<string, SchemaRenderer> {
    return new Map();
  }
  getFormats(path: JsPath): readonly string[] {
    return [];
  }
  getDiscriminator(path: JsPath): string | undefined {
    return undefined;
  }
}
