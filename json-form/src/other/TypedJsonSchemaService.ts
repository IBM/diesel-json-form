import { map2 } from 'tea-cup-fp';
import {
  BasicOutput,
  OutputUnit,
  toValueWithMeta,
  TypedJson,
} from 'typed-json-ts';
import { JsonValue, jvNull, parseJsonValue, stringify } from '../JsonValue';
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

  private constructor(public readonly typedJson: TypedJson) {}

  validate(schema: JsonValue, instance: JsonValue): Promise<ValidationResult> {
    return map2(
      stringify(schema),
      stringify(instance),
      (schemaValue: string, instanceValue) =>
        this.typedJson.validateBasic(schemaValue, instanceValue),
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
        // console.log('propose', path.format(), suggestOutputs);
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

class TypedJsonValidationResult implements ValidationResult {
  constructor(private readonly r: BasicOutput) {}

  getErrors(): readonly ValidationError[] {
    return (
      this.r.errors
        ?.map((o) => ({
          message: (o as any).error,
          path: o.instanceLocation.slice(1),
        }))
        .filter((e) => e.message.indexOf('sub schema') == -1) ?? []
    );
  }

  getRenderers(): ReadonlyMap<string, SchemaRenderer> {
    const kvs: [string, SchemaRenderer][] =
      this.r.annotations
        ?.filter((o) => o.keywordLocation.endsWith('/renderer'))
        .map((o) => [
          o.instanceLocation.slice(1),
          typeof o.value === 'string'
            ? {
                key: o.value,
                schemaValue: parseJsonValue(
                  JSON.stringify(o.value),
                ).withDefault(jvNull),
              }
            : typeof (o.value as any)['key'] === 'string'
              ? {
                  key: (o.value as any)['key'] as string,
                  schemaValue: parseJsonValue(
                    JSON.stringify({ renderer: o.value }),
                  ).withDefault(jvNull),
                }
              : parseJsonValue(JSON.stringify(o.value))
                  .map((v) => v as unknown as SchemaRenderer)
                  .withDefault({ key: '?', schemaValue: jvNull }),
        ]) ?? [];
    // console.log(
    //   'FW renderers',
    //   kvs,
    //   this.r.annotations?.filter((o) =>
    //     o.keywordLocation.endsWith('/renderer'),
    //   ),
    // );
    return new Map([...kvs]);
  }

  getFormats(path: JsPath): readonly string[] {
    const formats =
      this.r.annotations
        ?.filter((o) => o.keywordLocation.endsWith('/format'))
        .filter((o) => o.instanceLocation.slice(1) == path.format())
        .map((o) => o.value as string) ?? [];
    return formats;
  }

  getDiscriminator(path: JsPath): string | undefined {
    const discriminator =
      this.r.annotations
        ?.filter((o) => o.keywordLocation.endsWith('/discriminator'))
        .filter((o) => o.instanceLocation.slice(1) == path.format())
        .map((o) => o.value as string) ?? [];
    return discriminator[0];
  }
}

// function invalidLeafOutputUnits(o: OutputUnit): readonly OutputUnit[] {
//   const units = o.valid ? [] : (o.errors ?? []);
//   const deep = units.flatMap(invalidLeafOutputUnits).filter((o) => !o.valid);
//   return units.length > 0 ? deep : o.valid ? [] : [o];
// }

// function validLeafOutputUnits(o: OutputUnit): readonly OutputUnit[] {
//   const units = [...(o.errors ?? []), ...(o.annotations ?? [])];
//   const deep = units.flatMap(validLeafOutputUnits).filter((o) => o.valid);
//   return units.length > 0 ? deep : o.valid ? [o] : [];
// }
