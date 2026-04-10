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

import { contextMenuMsg, gotUpdatedValue, Msg, noOp } from './Msg';
import { Cmd, just, noCmd, nothing, Task, Tuple } from 'tea-cup-fp';
import { Model } from './Model';
import { JsPath } from './JsPath';
import {
  deleteValueAt,
  getValueAt,
  JsonValue,
  jvNull,
  jvObject,
  mapValueAt,
  MoveDirection,
  moveElement,
  moveProperty,
  setValueAt,
} from './JsonValue';
import { Debouncer } from './Debouncer';
import { MenuOptionFilter } from './RenderOptions';
import { Box } from 'tea-pop-core';
import { createMenu, MenuAction } from './ContextMenuActions';
import * as TPM from 'tea-pop-menu';
import { applyProposalTask } from './applyProposal';
import { SchemaService } from './SchemaService';

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
  schemaService: SchemaService,
  model: Model,
  path: JsPath,
  proposal: JsonValue,
  proposalIndex: number,
): [Model, Cmd<Msg>] {
  return model.schema
    .map<[Model, Cmd<Msg>]>((schema) => {
      const t = applyProposalTask(
        schemaService,
        schema,
        model.root,
        path,
        proposal,
        proposalIndex,
      );
      const cmd = Task.attempt(t, gotUpdatedValue);
      return [model, cmd];
    })
    .withDefaultSupply(() => noCmd(model));
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

function updateMenu(
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
  proposals: ReadonlyArray<JsonValue>,
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
            proposals,
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
  const newRoot = setValueAt(model.root, path, value);
  return setRoot(model, newRoot);
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
