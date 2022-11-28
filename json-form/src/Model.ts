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
import { getValueAt, JsonValue, valueFromAny, valueToAny } from './JsonValue';
import { JsPath } from './JsPath';
import * as TPM from 'tea-pop-menu';
import { MenuAction } from './ContextMenuActions';
import * as JsFacade from '@diesel-parser/json-schema-facade-ts';
import { JsValidationError, JsValidationResult } from '@diesel-parser/json-schema-facade-ts';
import { TFunction } from 'i18next';
import { initMyI18n } from './i18n/MyI18n';

export interface Model {
  readonly schema: Maybe<Tuple<any, JsonValue>>;
  readonly root: Tuple<any, JsonValue>;
  readonly validationResult: Maybe<JsValidationResult>;
  readonly errors: ReadonlyMap<string, ReadonlyArray<JsValidationError>>;
  readonly adding: Maybe<AddingState>;
  readonly menuModel: Maybe<TPM.Model<MenuAction>>;
  readonly collapsedPaths: ReadonlySet<string>;
  readonly propertiesToAdd: ReadonlyMap<string, ReadonlyArray<string>>;
  readonly comboBoxes: ReadonlyMap<string, ReadonlyArray<string>>;
  readonly formats: ReadonlyMap<string, ReadonlyArray<string>>;
  readonly t: TFunction;
  readonly lang: string;
  readonly strictMode: boolean;
}

export interface AddingState {
  readonly ownerPath: JsPath;
  readonly addingPropName: string;
  readonly isDuplicate: boolean;
}

export function doValidate(model: Model): Model {
  return model.schema
    .map((t) => {
      const validationResult = just(JsFacade.validate(t.a, model.root.a));
      return {
        ...model,
        validationResult,
      };
    })
    .withDefault(model);
}

export function computeErrors(model: Model): Model {
  const errors = model.validationResult
    .map(JsFacade.getErrors)
    .map((jsErrors) => {
      const res = new Map();
      jsErrors.forEach((err) => {
        const errsAtPath = res.get(err.path);
        if (errsAtPath) {
          res.set(err.path, [...errsAtPath, err]);
        } else {
          res.set(err.path, [err]);
        }
      });
      return res;
    })
    .withDefaultSupply(
      () => new Map<string, ReadonlyArray<JsValidationError>>(),
    );

  return {
    ...model,
    errors,
  };
}

export function computePropertiesToAdd(model: Model): Model {
  return model.validationResult
    .map((validationResult) => {
      const propertiesToAdd = new Map<string, ReadonlyArray<string>>();
      doComputePropsToAdd(model, validationResult, propertiesToAdd);
      const newModel: Model = {
        ...model,
        propertiesToAdd,
      };
      return newModel;
    })
    .withDefault(model);
}

interface StringsMetadata {
  readonly comboBoxes: Map<string, ReadonlyArray<string>>;
  readonly formats: Map<string, ReadonlyArray<string>>;
}

export function computeStringsMetadata(model: Model): Model {
  return model.validationResult
    .map((validationResult) => {
      const comboBoxes = new Map<string, ReadonlyArray<string>>();
      const formats = new Map<string, ReadonlyArray<string>>();
      const metadata: StringsMetadata = {
        comboBoxes,
        formats,
      };
      doComputeStringsMetadata(model, validationResult, metadata);
      const newModel: Model = {
        ...model,
        comboBoxes,
        formats,
      };
      return newModel;
    })
    .withDefault(model);
}

function doComputeStringsMetadata(
  model: Model,
  validationResult: JsValidationResult,
  metadata: StringsMetadata,
  path: JsPath = JsPath.empty,
): void {
  getValueAt(model.root.b, path).forEach((value) => {
    switch (value.tag) {
      case 'jv-object': {
        value.properties.forEach((prop) =>
          doComputeStringsMetadata(
            model,
            validationResult,
            metadata,
            path.append(prop.name),
          ),
        );
        break;
      }
      case 'jv-array': {
        // recurse
        value.elems.forEach((elem, elemIndex) =>
          doComputeStringsMetadata(
            model,
            validationResult,
            metadata,
            path.append(elemIndex),
          ),
        );
        break;
      }
      case 'jv-string': {
        const proposals: ReadonlyArray<string> = getProposals(
          validationResult,
          path,
        )
          .flatMap((proposal) => {
            if (proposal.tag === 'jv-string') {
              return [proposal.value];
            } else {
              return [];
            }
          })
          .filter((s) => s !== '');

        if (proposals.length > 0) {
          metadata.comboBoxes.set(path.format(), proposals);
        }

        const formats: ReadonlyArray<string> = getFormats(
          validationResult,
          path,
        );
        if (formats.length > 0) {
          metadata.formats.set(path.format(), formats);
        }
      }
    }
  });
}

function doComputePropsToAdd(
  model: Model,
  validationResult: JsValidationResult,
  props: Map<string, ReadonlyArray<string>>,
  path: JsPath = JsPath.empty,
): void {
  getValueAt(model.root.b, path).forEach((value) => {
    switch (value.tag) {
      case 'jv-object': {
        // compute props for this object and recurse
        const propNameProposals: string[] = getProposals(
          validationResult,
          path,
        ).flatMap((proposal) => {
          if (proposal.tag === 'jv-object') {
            return proposal.properties.map((p) => p.name);
          }
          return [];
        });
        props.set(path.format(), propNameProposals);
        value.properties.forEach((prop) =>
          doComputePropsToAdd(
            model,
            validationResult,
            props,
            path.append(prop.name),
          ),
        );
        break;
      }
      case 'jv-array': {
        // recurse
        value.elems.forEach((elem, elemIndex) =>
          doComputePropsToAdd(
            model,
            validationResult,
            props,
            path.append(elemIndex),
          ),
        );
        break;
      }
    }
  });
}

function toValueTuple(v: JsonValue): Tuple<any, JsonValue> {
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
    errors: new Map(),
    adding: nothing,
    menuModel: nothing,
    collapsedPaths: new Set(),
    propertiesToAdd: new Map(),
    comboBoxes: new Map(),
    formats: new Map(),
    strictMode,
  };

  return computeAll(doValidate(model));
}

export function computeAll(model: Model): Model {
  return computeStringsMetadata(computePropertiesToAdd(computeErrors(model)));
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
        isDuplicate: getValueAt(model.root.b, addingState.ownerPath)
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

export function getProposals(
  validationResult: JsValidationResult,
  path: JsPath,
): ReadonlyArray<JsonValue> {
  const proposals = JsFacade.propose(validationResult, path.format(), 5);
  return proposals.flatMap((proposalAny) => {
    return valueFromAny(proposalAny).match(
      (jsonValue) => [jsonValue],
      () => [], // TODO error ignored not so good ?
    );
  });
}

export function getFormats(
  validationResult: JsValidationResult,
  path: JsPath,
): ReadonlyArray<string> {
  return JsFacade.getFormats(validationResult, path.format());
}
