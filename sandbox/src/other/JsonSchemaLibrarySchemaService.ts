import {
  getValueAt,
  JsonValue,
  JsPath,
  parseJsonValue,
  SchemaRenderer,
  SchemaService,
  stringify,
  ValidationError,
  ValidationResult,
} from '@diesel-parser/json-form';
import {
  compileSchema,
  SchemaNode,
  ValidateReturnType,
} from 'json-schema-library';
import { map2 } from 'tea-cup-fp';

export class JsonSchemaLibrarySchemaService implements SchemaService {
  validate(schema: JsonValue, instance: JsonValue): Promise<ValidationResult> {
    return this.doValidate(schema, instance).then(
      ([r]) => new JsonSchemaLibraryValidationResult(r),
    );
  }
  propose(
    schema: JsonValue,
    instance: JsonValue,
    path: JsPath,
  ): Promise<readonly JsonValue[]> {
    return this.doValidate(schema, instance).then(([r, s]) =>
      this.proposeAt(instance, path, r, s),
    );
  }

  private doValidate(
    schema: JsonValue,
    instance: JsonValue,
  ): Promise<[ValidateReturnType, SchemaNode]> {
    return map2<string, string, [ValidateReturnType, SchemaNode]>(
      stringify(schema),
      stringify(instance),
      (schemaValue, instanceValue) => {
        const schema: SchemaNode = compileSchema(JSON.parse(schemaValue));
        return [schema.validate(JSON.parse(instanceValue)), schema];
      },
    )
      .map((r) => Promise.resolve(r))
      .withDefaultSupply(() => Promise.reject('Broken schema or instance'));
  }

  private proposeAt(
    instance: JsonValue,
    path: JsPath,
    r: ValidateReturnType,
    schema: SchemaNode,
  ): readonly JsonValue[] {
    // console.log('FW proposeAt', path.format(), r, schema, schema.getData());
    // console.log('FW ', path.format(), schema.getChildSelection(''));

    const instance1 = getValueAt(instance, path)
      .andThen(stringify)
      .map(JSON.parse)
      .filter((v) => v !== null)
      .withDefault(undefined);

    const schemas = selectSchemas(schema, path);

    const datas = schemas.map((schema) =>
      schema.getData(instance1, {
        recursionLimit: 5,
        addOptionalProps: true,
      }),
    );
    const values = datas.flatMap((data) =>
      parseJsonValue(JSON.stringify(data))
        .toMaybe()
        .map((v) => [v])
        .withDefault([]),
    );
    return values;
  }
}

class JsonSchemaLibraryValidationResult implements ValidationResult {
  constructor(private r: ValidateReturnType) {}

  getErrors(): readonly ValidationError[] {
    const { valid, errors } = this.r;
    if (valid) {
      return [];
    }
    return errors.map((e) => ({
      path: e.data.pointer.slice(1),
      message: e.message,
    }));
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

function selectSchemas(
  schema: SchemaNode,
  path: JsPath,
): readonly SchemaNode[] {
  const h = path.head();
  switch (h.type) {
    case 'Just': {
      const schemas0 = schema.getChildSelection(h.value);
      if (Array.isArray(schemas0)) {
        const schemas = schemas0.filter((s) => !!s);
        return path.tail().isEmpty()
          ? schemas
          : schemas.flatMap((s) => selectSchemas(s, path.tail()));
      }
      return [];
    }
    case 'Nothing':
      return [schema];
  }
  return [];
}
