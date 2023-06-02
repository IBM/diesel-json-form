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

import { JsPath } from './JsPath';
import { Maybe } from 'tea-cup-core';
import { JsonValue } from './JsonValue';

export type Msg =
  | RendererMsg<any>
  | { tag: 'set-json-str'; schema: Maybe<JsonValue>; json: JsonValue }
  | { tag: 'set-strict-mode'; strictMode: boolean };

export interface RendererMsg<M> {
  tag: 'renderer-msg';
  path: JsPath;
  msg: M;
}

export function rendererMsg<M>(path: JsPath): (msg: M) => Msg {
  return (m) => ({
    tag: 'renderer-msg',
    path,
    msg: m,
  });
}

export function setJsonStr(schemaAndJson: [Maybe<JsonValue>, JsonValue]): Msg {
  return {
    tag: 'set-json-str',
    schema: schemaAndJson[0],
    json: schemaAndJson[1],
  };
}

export function setStrictModeMsg(strictMode: boolean): Msg {
  return {
    tag: 'set-strict-mode',
    strictMode,
  };
}
