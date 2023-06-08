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

import * as React from 'react';
import { Cmd, Dispatcher, Maybe } from 'tea-cup-core';
import { JsonValue } from '../JsonValue';
import { JsPath } from '../JsPath';
import {
  JsValidationError,
  JsValidationResult,
} from '../../../../diesel-json/ts-facade';
import { RendererFactory } from './RendererFactory';
import { TFunction } from 'i18next';

export interface RendererInitArgs {
  readonly path: JsPath;
  readonly value: JsonValue;
  readonly validationResult: Maybe<JsValidationResult>;
  readonly rendererFactory: RendererFactory;
  readonly t: TFunction;
}

export interface RendererViewArgs<Model, Msg> {
  readonly dispatch: Dispatcher<Msg>;
  readonly model: Model;
  readonly rendererFactory: RendererFactory;
  readonly t: TFunction;
}

export interface RendererUpdateArgs<Model, Msg> {
  readonly msg: Msg;
  readonly model: Model;
  readonly rendererFactory: RendererFactory;
  readonly t: TFunction;
}

export interface GotValidationResultArgs<Model> {
  readonly model: Model;
  readonly validationResult: JsValidationResult;
  readonly rendererFactory: RendererFactory;
}

export interface Renderer<Model, Msg> {
  init(args: RendererInitArgs): [Model, Cmd<Msg>];
  view(args: RendererViewArgs<Model, Msg>): React.ReactElement;
  update(
    args: RendererUpdateArgs<Model, Msg>,
  ): [Model, Cmd<Msg>, Maybe<JsonValue>];
  gotValidationResult(args: GotValidationResultArgs<Model>): [Model, Cmd<Msg>];
}
