/*
 * Copyright 2018 The Diesel Authors
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

import { just, Maybe, nothing, Tuple } from 'tea-cup-core';
import { JsonValue, valueToAny } from './JsonValue';
import * as JsFacade from '@diesel-parser/json-schema-facade-ts';
import { JsValidationResult } from '@diesel-parser/json-schema-facade-ts';
import { TFunction } from 'i18next';
import { initMyI18n } from './i18n/MyI18n';

export type RendererModel = any;

export interface Model {
  readonly schema: Maybe<Tuple<any, JsonValue>>;
  readonly root: Tuple<any, JsonValue>;
  readonly validationResult: Maybe<JsValidationResult>;
  readonly rootRendererModel: Maybe<RendererModel>;
  readonly t: TFunction;
  readonly lang: string;
  readonly strictMode: boolean;
}

export function doValidate(model: Model): Model {
  return model.schema
    .map((t) => {
      debugger;
      const validationResult = just(JsFacade.validate(t.a, model.root.a));
      return {
        ...model,
        validationResult,
      };
    })
    .withDefault(model);
}

export function toValueTuple(v: JsonValue): Tuple<any, JsonValue> {
  return new Tuple(valueToAny(v), v);
}

export function initialModel(
  lang: string,
  schema: Maybe<JsonValue>,
  root: JsonValue,
  strictMode: boolean,
): Model {
  const t = initMyI18n(lang);
  const model: Model = {
    lang,
    t,
    schema: schema.map(toValueTuple),
    root: toValueTuple(root),
    validationResult: nothing,
    rootRendererModel: nothing,
    strictMode,
  };

  return doValidate(model);
}
