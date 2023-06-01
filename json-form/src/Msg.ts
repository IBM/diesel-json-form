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
import { JsonValue } from './JsonValue';
import * as TPM from 'tea-pop-menu';
import { Box } from 'tea-pop-core';
import { MenuAction } from './ContextMenuActions';
import { Maybe } from 'tea-cup-core';

export interface HasPath {
  readonly path: JsPath;
}

export type Msg =
  | DeleteProperty
  | UpdateProperty
  | AddPropertyClicked
  | { tag: 'new-property-name-changed'; value: string }
  | { tag: 'new-property-name-key-down'; key: string }
  | { tag: 'add-prop-ok-cancel-clicked'; ok: boolean }
  | AddElemClicked
  | ContextMenuMsg
  | MenuTriggerClicked
  | { tag: 'set-json-str'; schema: Maybe<JsonValue>; json: JsonValue }
  | { tag: 'set-strict-mode'; strictMode: boolean }
  | ToggleExpandCollapse
  | AddPropertyButtonClicked
  | RecomputeMetadata
  | NoOp
  | { tag: 'renderer-child-msg'; path: string; msg: any };

export interface AddPropertyButtonClicked extends HasPath {
  tag: 'add-property-btn-clicked';
  readonly propertyName: string;
}

export interface ToggleExpandCollapse extends HasPath {
  tag: 'toggle-expand-collapse';
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

export interface MenuTriggerClicked extends HasPath {
  tag: 'menu-trigger-clicked';
  refBox: Box;
}

export interface ContextMenuMsg {
  tag: 'menu-msg';
  child: TPM.Msg<MenuAction>;
}

export function contextMenuMsg(child: TPM.Msg<MenuAction>): Msg {
  return {
    tag: 'menu-msg',
    child,
  };
}

export interface NoOp {
  tag: 'no-op';
}

export const noOp: Msg = {
  tag: 'no-op',
};

export interface DeleteProperty extends HasPath {
  tag: 'delete-property';
}

export interface UpdateProperty extends HasPath {
  tag: 'update-property';
  value: JsonValue;
}

export interface AddPropertyClicked extends HasPath {
  tag: 'add-property-clicked';
}

export interface AddElemClicked extends HasPath {
  tag: 'add-elem-clicked';
}

export interface RecomputeMetadata {
  tag: 'recompute-metadata';
}
