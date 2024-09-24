import { JsValidationResult } from '@diesel-parser/json-schema-facade-ts';
import { JsPath } from '@diesel-parser/json-form';
import { JsonNode } from './util';

export interface RendererArgs {
  readonly value: JsonNode;
  readonly path: JsPath;
  readonly validationResult?: JsValidationResult;
}
