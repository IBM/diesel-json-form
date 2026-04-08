import * as JsFacade from '@diesel-parser/json-schema-facade-ts';
import { JsonValue, parseJsonValue, stringify } from './JsonValue';
import { JsPath } from './JsPath';

export interface ValidationError {
  readonly path: string;
  readonly message: string;
}

export interface SchemaRenderer {
  readonly key: string;
  readonly schemaValue: any;
}

export interface SchemaService {
  validate(schema: JsonValue, instance: JsonValue): ValidationResult;
}

export interface ValidationResult {
  getErrors(): readonly ValidationError[];
  getRenderers(): ReadonlyMap<string, SchemaRenderer | undefined>;
  getFormats(format: JsPath): readonly string[];
  propose(path: JsPath, maxDepth?: number): readonly JsonValue[];
  getDiscriminator(path: JsPath): string | undefined;
}

function toFacadeValue(jsonValue: JsonValue): JsFacade.JsonValue {
  const s = stringify(jsonValue);
  return JsFacade.parseValue(s);
}

function fromFacadeValue(facadeValue: JsFacade.JsonValue): JsonValue {
  const s = JsFacade.stringifyValue(facadeValue);
  return parseJsonValue(s).match(
    (v) => v,
    (err) => {
      throw new Error(err);
    },
  );
}

class JsFacadeSchemaService implements SchemaService {
  validate(schema: JsonValue, instance: JsonValue): ValidationResult {
    const r = JsFacade.validate(toFacadeValue(schema), toFacadeValue(instance));
    return new JsFacadeValidationResult(r);
  }
}

class JsFacadeValidationResult implements ValidationResult {
  constructor(private readonly result: JsFacade.JsValidationResult) {}

  getErrors(): readonly ValidationError[] {
    return JsFacade.getErrors(this.result);
  }
  getRenderers(): ReadonlyMap<string, SchemaRenderer | undefined> {
    return JsFacade.getRenderers(this.result);
  }
  getFormats(path: JsPath): readonly string[] {
    return JsFacade.getFormats(this.result, path.format());
  }
  propose(path: JsPath, maxDepth?: number): readonly JsonValue[] {
    return JsFacade.propose(this.result, path.format(), maxDepth).map(
      fromFacadeValue,
    );
  }
  getDiscriminator(path: JsPath): string | undefined {
    return JsFacade.getDiscriminator(this.result, path.format());
  }
}

export const defaultSchemaService: SchemaService = new JsFacadeSchemaService();
