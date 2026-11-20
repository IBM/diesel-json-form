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
import { JsonValue, parseJsonValue, stringify } from './JsonValue.js';
import { JsPath } from './JsPath.js';
import { map2, Maybe } from 'tea-cup-fp';

export interface ValidationError {
  readonly path: string;
  readonly message: string;
}

export interface SchemaRenderer {
  readonly key: string;
  readonly schemaValue: JsonValue;
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
  getRenderers(): ReadonlyMap<string, SchemaRenderer>;
  getFormats(path: JsPath): readonly string[];
  getDiscriminator(path: JsPath): string | undefined;
}

function toFacadeValue(jsonValue: JsonValue): Maybe<JsFacade.JsonValue> {
  return stringify(jsonValue).map(JsFacade.parseValue);
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

function doValidate(
  schema: JsonValue,
  instance: JsonValue,
): Promise<JsFacade.JsValidationResult> {
  return map2(
    toFacadeValue(schema),
    toFacadeValue(instance),
    (schemaValue, instanceValue) =>
      JsFacade.validate(schemaValue, instanceValue),
  )
    .map((vr) => Promise.resolve(vr))
    .withDefaultSupply(() => Promise.reject('Broken schema or instance'));
}

class ValidationResultCache {
  private data?: [string, string, JsFacade.JsValidationResult];

  getValidationResult(
    schema: string,
    value: string,
  ): JsFacade.JsValidationResult | undefined {
    if (this.data) {
      if (schema === this.data[0]) {
        if (value === this.data[1]) {
          return this.data[2];
        }
      }
    }
    return undefined;
  }

  setValidationResult(
    schema: string,
    value: string,
    result: JsFacade.JsValidationResult,
  ): void {
    this.data = [schema, value, result];
  }
}

class JsFacadeSchemaService implements SchemaService {
  private cache = new ValidationResultCache();

  async validate(
    schema: JsonValue,
    instance: JsonValue,
  ): Promise<ValidationResult> {
    const schemaStr = JSON.stringify(schema);
    const instanceStr = JSON.stringify(instance);
    const cached = this.cache.getValidationResult(schemaStr, instanceStr);
    if (cached) {
      console.log('validate CACHE hit', schema, instance, cached);
      return Promise.resolve(new JsFacadeValidationResult(cached));
    } else {
      return doValidate(schema, instance).then((vr) => {
        console.log(
          'validate CACHE miss, adding to cache',
          schema,
          instance,
          vr,
        );
        this.cache.setValidationResult(schemaStr, instanceStr, vr);
        return new JsFacadeValidationResult(vr);
      });
    }
  }

  async propose(
    schema: JsonValue,
    instance: JsonValue,
    path: JsPath,
  ): Promise<readonly JsonValue[]> {
    const schemaStr = JSON.stringify(schema);
    const instanceStr = JSON.stringify(instance);
    const cached = this.cache.getValidationResult(schemaStr, instanceStr);
    if (cached) {
      console.log('propose CACHE hit', schema, instance, cached);
      return Promise.resolve(
        JsFacade.propose(cached, path.format(), -1).map(fromFacadeValue),
      );
    } else {
      return doValidate(schema, instance).then((r) => {
        console.log('propose CACHE miss', schema, instance, r);
        this.cache.setValidationResult(schemaStr, instanceStr, r);
        return Promise.resolve(
          JsFacade.propose(r, path.format(), -1).map(fromFacadeValue),
        );
      });
    }
  }
}

class JsFacadeValidationResult implements ValidationResult {
  constructor(readonly result: JsFacade.JsValidationResult) {}

  getErrors(): readonly ValidationError[] {
    return JsFacade.getErrors(this.result);
  }
  getRenderers(): ReadonlyMap<string, SchemaRenderer> {
    const m = JsFacade.getRenderers(this.result);
    const res = new Map<string, SchemaRenderer>();
    for (const s of m.keys()) {
      const jsRenderer = m.get(s);
      if (jsRenderer) {
        const str = JsFacade.stringifyValue(jsRenderer.schemaValue);
        const jsonValue = parseJsonValue(str);
        if (jsonValue.tag === 'Ok') {
          res.set(s, { key: jsRenderer.key, schemaValue: jsonValue.value });
        }
      }
    }
    return res;
  }
  getFormats(path: JsPath): readonly string[] {
    return JsFacade.getFormats(this.result, path.format());
  }
  getDiscriminator(path: JsPath): string | undefined {
    return JsFacade.getDiscriminator(this.result, path.format());
  }
}

export const defaultSchemaService: SchemaService = new JsFacadeSchemaService();
