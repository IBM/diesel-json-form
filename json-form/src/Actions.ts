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

import { contextMenuMsg, Msg, noOp } from './Msg';
import { Cmd, just, maybeOf, noCmd, nothing, Task, Tuple } from 'tea-cup-core';
import { getProposals, Model } from './Model';
import { JsPath } from './JsPath';
import {
  clearPropertiesIfObject,
  deleteValueAt,
  getValueAt,
  JsonValue,
  jsonValueToFacadeValue,
  jvArray,
  JvArray,
  jvNull,
  JvObject,
  jvObject,
  mapValueAt,
  mergeProperties,
  MoveDirection,
  moveElement,
  moveProperty,
  setValueAt,
} from './JsonValue';
import * as TPM from 'tea-pop-menu';
import { createMenu, MenuAction } from './ContextMenuActions';
import { Box } from 'tea-pop-core';
import { Debouncer } from './Debouncer';
import * as JsFacade from '@diesel-parser/json-schema-facade-ts';
import { MenuOptionFilter } from './RenderOptions';

export function actionDeleteValue(
  model: Model,
  path: JsPath,
): [Model, Cmd<Msg>] {
  return setRoot(
    model,
    deleteValueAt(model.root, path).withDefault(model.root),
  );
}

export function actionApplyProposal(
  model: Model,
  path: JsPath,
  proposal: JsonValue,
  proposalIndex: number,
): [Model, Cmd<Msg>] {
  switch (proposal.tag) {
    case 'jv-object': {
      const newProposal = getValueAt(model.root, path)
        .map((valueAtPath) => {
          const augmentedProposal = model.validationResult
            .andThen((vr) => {
              // TODO deep propose only for proposalIndex
              const all = JsFacade.propose(vr, path.format(), 5);
              return maybeOf(all[proposalIndex]);
            })
            .map(JsFacade.toJsonValue)
            .andThen((v) =>
              v.tag === 'jv-object' ? just(v as JvObject) : nothing,
            )
            .withDefault(proposal);

          if (valueAtPath.tag === 'jv-object') {
            // do not overwrite existing props
            return mergeProperties(augmentedProposal, valueAtPath);
          } else {
            return augmentedProposal;
          }
        })
        .withDefault(proposal);

      return doUpdateValue(model, path, newProposal);
    }
    default: {
      return doUpdateValue(model, path, proposal);
    }
  }
}

function doUpdateValue(
  model: Model,
  path: JsPath,
  value: JsonValue,
): [Model, Cmd<Msg>] {
  if (path.isEmpty()) {
    return setRoot(model, value);
  }
  return setRoot(model, setValueAt(model.root, path, value));
}

export function actionAddPropertyClicked(
  model: Model,
  ownerPath: JsPath,
): [Model, Cmd<Msg>] {
  const focusTask = Task.succeedLazy(() => {
    const input = document.getElementById('property-name-editor');
    if (input) {
      input.focus();
    }
  });

  return Tuple.t2n(
    {
      ...model,
      adding: just({
        ownerPath,
        addingPropName: '',
        isDuplicate: false,
      }),
    },
    Task.perform(focusTask, () => noOp),
  );
}

export function actionConfirmAddProperty(
  model: Model,
  commit: boolean,
): [Model, Cmd<Msg>] {
  const newModel: Model = {
    ...model,
    adding: nothing,
  };
  if (!commit) {
    return noCmd(newModel);
  }
  return model.adding
    .filter((addingState) => addingState.addingPropName !== '')
    .andThen((addingState) => {
      return mapValueAt(model.root, addingState.ownerPath, (owningValue) => {
        if (owningValue.tag === 'jv-object') {
          return just(
            jvObject([
              ...owningValue.properties,
              { name: addingState.addingPropName, value: jvNull },
            ]),
          );
        }
        return just(owningValue);
      }).map((newRoot) => setRoot(newModel, newRoot));
    })
    .withDefaultSupply(() => noCmd(newModel));
}

export function actionAddProperty(
  model: Model,
  path: JsPath,
  propertyName: string,
): [Model, Cmd<Msg>] {
  return getValueAt(model.root, path)
    .map<[Model, Cmd<Msg>]>((owner) => {
      if (owner.tag === 'jv-object') {
        // create the new object with a null value
        // because we need it to propose
        const newObject = jvObject([
          ...owner.properties,
          { name: propertyName, value: jvNull },
        ]);
        const newRoot = setValueAt(model.root, path, newObject);
        const newValidationResult = model.schema.map((schemaAny) =>
          JsFacade.validate(
            jsonValueToFacadeValue(schemaAny),
            jsonValueToFacadeValue(newRoot),
          ),
        );

        const propertyProposals = newValidationResult
          .map((vr) => getProposals(vr, path.append(propertyName), -1))
          .withDefault([])
          .map(clearPropertiesIfObject);

        const newObject2 = jvObject([
          ...owner.properties,
          {
            name: propertyName,
            value:
              propertyProposals.length === 0 ? jvNull : propertyProposals[0],
          },
        ]);
        return setRoot(model, setValueAt(model.root, path, newObject2));
      }
      return noCmd(model);
    })
    .withDefaultSupply(() => noCmd(model));
}

export function actionAddElementToArray(
  model: Model,
  path: JsPath,
): [Model, Cmd<Msg>] {
  return getValueAt(model.root, path)
    .map<[Model, Cmd<Msg>]>((array) => {
      if (array.tag === 'jv-array') {
        const newElemIndex = array.elems.length;

        // we create a transient JsonValue with the array updated
        // so that we have a value at new index path
        // otherwise the proposals would be empty because
        // no path matches the requested index
        const tmpArray = jvArray([...array.elems, jvNull]);
        const tmpRoot = setValueAt(model.root, path, tmpArray);

        const newValidationResult = model.schema.map((schemaAny) =>
          JsFacade.validate(
            jsonValueToFacadeValue(schemaAny),
            jsonValueToFacadeValue(tmpRoot),
          ),
        );

        const proposals = newValidationResult
          .map((vr) => getProposals(vr, path.append(newElemIndex), -1))
          .withDefault([]);

        const proposal = maybeOf(proposals[0]).withDefault(jvNull);
        const newArray: JvArray = {
          ...array,
          elems: [...array.elems, clearPropertiesIfObject(proposal)],
        };
        const newRoot = setValueAt(model.root, path, newArray);
        return setRoot(model, newRoot);
      }
      return noCmd(model);
    })
    .withDefaultSupply(() => noCmd(model));
}

export function updateMenu(
  model: Model,
  mac: [TPM.Model<MenuAction>, Cmd<TPM.Msg<MenuAction>>],
): [Model, Cmd<Msg>] {
  return Tuple.fromNative(mac)
    .mapFirst((mm) => {
      return {
        ...model,
        menuModel: just(mm),
      };
    })
    .mapSecond((mc) => mc.map(contextMenuMsg))
    .toNative();
}

export function actionTriggerClicked(
  model: Model,
  path: JsPath,
  refBox: Box,
  menuFilter?: MenuOptionFilter,
): [Model, Cmd<Msg>] {
  return getValueAt(model.root, path)
    .map((valueAtPath) => {
      const focusMenuCmd: Cmd<Msg> = Task.attempt(
        Task.fromLambda(() => {
          const e = document.getElementById('dummy-textarea') as HTMLElement;
          if (e) {
            e.focus();
          }
        }),
        () => {
          return noOp;
        },
      );

      const mac: [Model, Cmd<Msg>] = updateMenu(
        model,
        TPM.open(
          createMenu({
            root: model.root,
            path,
            proposals: model.validationResult
              .map((vr) => getProposals(vr, path, -1))
              .withDefault([]),
            valueAtPath,
            strictMode: model.strictMode,
            menuFilter,
          }),
          refBox,
        ),
      );

      return Tuple.t2n(mac[0], Cmd.batch([mac[1], focusMenuCmd]));
    })
    .withDefaultSupply(() => noCmd(model));
}

export function actionToggleExpandCollapsePath(
  model: Model,
  path: JsPath,
): [Model, Cmd<Msg>] {
  const pathStr = path.format();
  const collapsedPaths = model.collapsedPaths.has(pathStr)
    ? new Set(
        Array.from(model.collapsedPaths.keys()).filter((s) => s !== pathStr),
      )
    : new Set(Array.from(model.collapsedPaths.keys()).concat(pathStr));
  return noCmd({
    ...model,
    collapsedPaths,
  });
}

export function actionMoveValue(
  model: Model,
  path: JsPath,
  direction: MoveDirection,
): [Model, Cmd<Msg>] {
  return path
    .parent()
    .andThen<[Model, Cmd<Msg>]>((parentPath) =>
      getValueAt(model.root, parentPath).andThen((parentValue) =>
        path.lastElem().map((lastPathElem) => {
          switch (parentValue.tag) {
            case 'jv-object': {
              const newRoot = moveProperty(
                model.root,
                parentPath,
                lastPathElem,
                direction,
              );
              return setRoot(model, newRoot);
            }
            case 'jv-array': {
              const index = parseInt(lastPathElem);
              if (isNaN(index)) {
                return noCmd(model);
              }
              const newRoot = moveElement(
                model.root,
                parentPath,
                index,
                direction,
              );
              return setRoot(model, newRoot);
            }
            default: {
              return noCmd(model);
            }
          }
        }),
      ),
    )
    .withDefaultSupply(() => noCmd(model));
}

export function actionUpdateValue(
  model: Model,
  path: JsPath,
  value: JsonValue,
): [Model, Cmd<Msg>] {
  return doUpdateValue(model, path, value);
}

const debouncer = new Debouncer<Msg>();

export function setRoot(model: Model, root: JsonValue): [Model, Cmd<Msg>] {
  const cmd = debouncer.debounce(
    { tag: 'recompute-metadata' },
    model.debounceMs,
  );
  const newModel: Model = {
    ...model,
    root,
    adding: nothing,
  };
  return [newModel, cmd];
}
