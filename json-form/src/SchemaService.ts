import {
  JsonValue,
  JsRenderer,
  JsValidationError,
  JsValidationResult,
} from '@diesel-parser/json-schema-facade-ts';

import * as JsFacade from '@diesel-parser/json-schema-facade-ts';

export interface SchemaService {
  validate(schema: JsonValue, instance: JsonValue): JsValidationResult;
  getErrors(result: JsValidationResult): readonly JsValidationError[];
  getRenderers(
    result: JsValidationResult,
  ): ReadonlyMap<string, JsRenderer | undefined>;
  getFormats(result: JsValidationResult, format: string): readonly string[];
  propose(
    result: JsValidationResult,
    path: string,
    maxDepth?: number,
  ): readonly JsonValue[];
}

class JsFacadeSchemaService implements SchemaService {
  validate(schema: JsonValue, instance: JsonValue): JsValidationResult {
    return JsFacade.validate(schema, instance);
  }
  getErrors(result: JsValidationResult): readonly JsValidationError[] {
    return JsFacade.getErrors(result);
  }
  getRenderers(
    result: JsValidationResult,
  ): ReadonlyMap<string, JsRenderer | undefined> {
    return JsFacade.getRenderers(result);
  }
  getFormats(result: JsValidationResult, path: string): readonly string[] {
    return JsFacade.getFormats(result, path);
  }
  propose(
    result: JsValidationResult,
    path: string,
    maxDepth?: number,
  ): readonly JsonValue[] {
    return JsFacade.propose(result, path, maxDepth);
  }
}

export const defaultSchemaService: SchemaService = new JsFacadeSchemaService();
