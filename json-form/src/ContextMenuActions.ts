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

import { item, Menu, menu, MenuItem } from 'tea-pop-menu';
import { JsPath } from './JsPath';
import {
  getValueAt,
  indexOfPathInParent,
  JsonValue,
  jvArray,
  jvBool,
  jvNull,
  jvNumber,
  jvObject,
  jvString,
} from './JsonValue';

export type MenuAction =
  | { tag: 'delete'; path: JsPath }
  | { tag: 'move' }
  | { tag: 'move-up'; path: JsPath }
  | { tag: 'move-down'; path: JsPath }
  | { tag: 'propose'; path: JsPath }
  | { tag: 'proposal'; path: JsPath; value: JsonValue }
  | { tag: 'types' }
  | { tag: 'change-type'; path: JsPath; value: JsonValue }
  | { tag: 'add'; path: JsPath; isArray: boolean };

function maDelete(path: JsPath): MenuAction {
  return {
    tag: 'delete',
    path,
  };
}

function maMove(): MenuAction {
  return {
    tag: 'move',
  };
}

function maMoveUp(path: JsPath): MenuAction {
  return {
    tag: 'move-up',
    path,
  };
}

function maMoveDown(path: JsPath): MenuAction {
  return {
    tag: 'move-down',
    path,
  };
}

export interface MenuPropertyProps {
  readonly root: JsonValue;
  readonly path: JsPath;
  readonly valueAtPath: JsonValue;
  readonly proposals: ReadonlyArray<JsonValue>;
  readonly strictMode: boolean;
}

export function createTypesMenu(
  path: JsPath,
  valueAtPath: JsonValue,
  proposals: ReadonlyArray<JsonValue>,
  strictMode: boolean,
): ReadonlyArray<MenuItem<MenuAction>> {
  const buildChangeTypeItem = (value: JsonValue): MenuItem<MenuAction> => {
    return item<MenuAction>({
      tag: 'change-type',
      path,
      value: value,
    });
  };

  const uniqueProposalTypes = proposals
    .map((p) => p.tag)
    .filter(
      (value: string, index: number, array: ReadonlyArray<string>) =>
        array.indexOf(value) === index,
    );

  const buildChangeTypeMenuItems = (): ReadonlyArray<MenuItem<MenuAction>> => {
    const jsonValues = strictMode
      ? proposals
      : [
          jvNull,
          jvString(''),
          jvNumber(0),
          jvBool(true),
          jvObject(),
          jvArray(),
        ];

    return (
      jsonValues
        // keep only JsonValue type
        .map((p) => p.tag)
        // Get unique values
        .filter(
          (value: string, index: number, array: ReadonlyArray<string>) =>
            array.indexOf(value) === index,
        )
        // Exclude actual type
        .filter((value) => value !== valueAtPath.tag)
        // Build MenuItem from unique JsonValue
        .map((t) => {
          switch (t) {
            case 'jv-array':
              return buildChangeTypeItem(jvArray());
            case 'jv-boolean':
              return buildChangeTypeItem(jvBool(true));
            case 'jv-null':
              return buildChangeTypeItem(jvNull);
            case 'jv-number':
              return buildChangeTypeItem(jvNumber(0));
            case 'jv-object':
              return buildChangeTypeItem(jvObject());
            case 'jv-string':
              return buildChangeTypeItem(jvString(''));
          }
        })
    );
  };

  if (
    strictMode &&
    uniqueProposalTypes.length === 1 &&
    valueAtPath.tag === proposals[0].tag
  ) {
    // Only one type accepted and the value has already the right one -> no menu at all
    return [];
  }

  return buildChangeTypeMenuItems().length > 0
    ? [item({ tag: 'types' }, menu(buildChangeTypeMenuItems()))]
    : [];
}

export function createProposeMenu(
  path: JsPath,
  proposals: ReadonlyArray<JsonValue>,
  strictMode: boolean,
): ReadonlyArray<MenuItem<MenuAction>> {
  if (strictMode || proposals.length === 0) {
    // Strict mode or no proposal => no menu
    return [];
  }

  const proposeMenu: Menu<MenuAction> = menu(
    proposals.map((value) =>
      item({
        tag: 'proposal',
        path,
        value,
      }),
    ),
  );
  return [item({ tag: 'propose', path }, proposeMenu)];
}

export function createMenu(props: MenuPropertyProps): Menu<MenuAction> {
  const { path, proposals, valueAtPath, root, strictMode } = props;

  const addItems: () => MenuItem<MenuAction>[] = () => {
    const isArray = valueAtPath.tag === 'jv-array';
    const isObject = !strictMode && valueAtPath.tag === 'jv-object';
    if (isArray || isObject) {
      return [item({ tag: 'add', path, isArray })];
    }
    return [];
  };

  const isRoot = path.isEmpty();

  const nbItems = path
    .parent()
    .andThen((pp) => getValueAt(root, pp))
    .map((pv) => {
      switch (pv.tag) {
        case 'jv-object':
          return pv.properties.length;
        case 'jv-array':
          return pv.elems.length;
        default:
          return 0;
      }
    })
    .withDefault(0);

  const hasMoveMenu = !isRoot && nbItems > 1;

  const moveMenu: () => Menu<MenuAction> = () => {
    const index = indexOfPathInParent(root, path);
    const canMoveUp = index > 0;
    const canMoveDown = index >= 0 && index < nbItems - 1;
    const moveUpItems = canMoveUp ? [item(maMoveUp(path))] : [];
    const moveDownItems = canMoveDown ? [item(maMoveDown(path))] : [];

    return menu(moveUpItems.concat(moveDownItems));
  };

  const moveItems = hasMoveMenu ? [item(maMove(), moveMenu())] : [];

  const deleteItems = isRoot ? [] : [item(maDelete(path))];

  return menu(
    moveItems
      .concat(addItems())
      .concat(createTypesMenu(path, valueAtPath, proposals, strictMode))
      .concat(createProposeMenu(path, proposals, strictMode))
      .concat(deleteItems),
  );
}
