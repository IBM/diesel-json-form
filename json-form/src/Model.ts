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

import { Maybe, nothing } from 'tea-cup-fp';
import { getValueAt, JsonValue } from './JsonValue';
import { JsPath } from './JsPath';
import * as TPM from 'tea-pop-menu';
import { MenuAction } from './ContextMenuActions';
import { initMyI18n } from './i18n/MyI18n';
import { ValidationError, ValidationResult } from './SchemaService';
import { FormTFunction } from './FormTFunction';

export type ValidationState =
  | { tag: 'none' }
  | { tag: 'validating' }
  | { tag: 'validated'; validationResult: ValidationResult };

export interface Model {
  readonly schema: Maybe<JsonValue>;
  readonly root: JsonValue;
  readonly validationState: ValidationState;
  readonly errors: ReadonlyMap<string, ReadonlyArray<ValidationError>>;
  readonly adding: Maybe<AddingState>;
  readonly menuModel: Maybe<TPM.Model<MenuAction>>;
  readonly collapsedPaths: ReadonlySet<string>;
  readonly propertiesToAdd: ReadonlyMap<string, ReadonlyArray<string>>;
  readonly comboBoxes: ReadonlyMap<string, ReadonlyArray<string>>;
  readonly formats: ReadonlyMap<string, ReadonlyArray<string>>;
  readonly t: FormTFunction;
  readonly lang: string;
  readonly strictMode: boolean;
  readonly customRenderers: ReadonlyMap<string, Maybe<CustomRendererModel>>;
  readonly debounceMs: number;
}

export interface CustomRendererModel {
  readonly key: string;
  readonly rendererModel: any;
}

export interface AddingState {
  readonly ownerPath: JsPath;
  readonly addingPropName: string;
  readonly isDuplicate: boolean;
}

export function initialModel(
  lang: string,
  schema: Maybe<JsonValue>,
  root: JsonValue,
  strictMode: boolean,
  debounceMs: number,
): Model {
  const t = initMyI18n(lang);
  const model: Model = {
    lang,
    t,
    schema,
    root,
    validationState: { tag: 'none' },
    errors: new Map(),
    adding: nothing,
    menuModel: nothing,
    collapsedPaths: new Set(),
    propertiesToAdd: new Map(),
    comboBoxes: new Map(),
    formats: new Map(),
    strictMode,
    customRenderers: new Map(),
    debounceMs: Math.max(0, debounceMs),
  };
  return model;
}

export function updateAddingPropertyName(
  model: Model,
  propName: string,
): Model {
  return {
    ...model,
    adding: model.adding.map((addingState) => {
      const res: AddingState = {
        ...addingState,
        addingPropName: propName,
        isDuplicate: getValueAt(model.root, addingState.ownerPath)
          .map((ownerValue) => {
            if (ownerValue.tag === 'jv-object') {
              return (
                ownerValue.properties.find((p) => p.name === propName) !==
                undefined
              );
            } else {
              return false;
            }
          })
          .withDefault(false),
      };
      return res;
    }),
  };
}
