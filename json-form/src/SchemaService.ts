/*
 * Copyright 2018, 2026 The Diesel Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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
  validate(schema: JsonValue, instance: JsonValue): Promise<ValidationResult>;
  propose(
    schema: JsonValue,
    instance: JsonValue,
    path: JsPath,
  ): Promise<readonly JsonValue[]>;
}

export interface ValidationResult {
  getErrors(): readonly ValidationError[];
  getRenderers(): ReadonlyMap<string, SchemaRenderer | undefined>;
  getFormats(path: JsPath): readonly string[];
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
  async validate(
    schema: JsonValue,
    instance: JsonValue,
  ): Promise<ValidationResult> {
    const r = JsFacade.validate(toFacadeValue(schema), toFacadeValue(instance));
    return Promise.resolve(new JsFacadeValidationResult(r));
  }

  async propose(
    schema: JsonValue,
    instance: JsonValue,
    path: JsPath,
  ): Promise<readonly JsonValue[]> {
    const r = JsFacade.validate(toFacadeValue(schema), toFacadeValue(instance));
    return Promise.resolve(
      JsFacade.propose(r, path.format(), -1).map(fromFacadeValue),
    );
  }
}

class JsFacadeValidationResult implements ValidationResult {
  constructor(readonly result: JsFacade.JsValidationResult) {}

  getErrors(): readonly ValidationError[] {
    return JsFacade.getErrors(this.result);
  }
  getRenderers(): ReadonlyMap<string, SchemaRenderer | undefined> {
    return JsFacade.getRenderers(this.result);
  }
  getFormats(path: JsPath): readonly string[] {
    return JsFacade.getFormats(this.result, path.format());
  }
  getDiscriminator(path: JsPath): string | undefined {
    return JsFacade.getDiscriminator(this.result, path.format());
  }
}

export const defaultSchemaService: SchemaService = new JsFacadeSchemaService();
