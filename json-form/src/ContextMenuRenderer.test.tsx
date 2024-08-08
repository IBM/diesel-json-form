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

import {
  createMenu,
  createTypesMenu,
  MenuAction,
  MenuPropertyProps,
} from './ContextMenuActions';
import {
  JsonValue,
  jvArray,
  jvBool,
  jvNull,
  jvNumber,
  jvObject,
  jvString,
} from './JsonValue';
import { JsPath } from './JsPath';
import { item, Menu, menu, MenuItem } from 'tea-pop-menu';
import { MenuOptions } from './RenderOptions';

describe('Change type menu', () => {
  test('[SM: ON, P: 1, V: valid] ' + 'no types menu', () => {
    const typesMenu = buildTypesMenuStrictMode(
      [jvNumber(123), jvNumber(456)],
      jvNumber(456),
    );
    expect(typesMenu).toStrictEqual([]);
  });

  test('[SM: ON, P: 2 same type, V: valid] ' + 'no types menu', () => {
    const typesMenu = buildTypesMenuStrictMode(
      [jvNumber(123), jvNumber(456)],
      jvNumber(456),
    );
    expect(typesMenu).toStrictEqual([]);
  });

  test(
    '[SM: ON, P: 2 different type, V: something different than proposal] ' +
      'menu type exists and subMenu should contains 2 entries corresponding to the 2 proposals',
    () => {
      const typesMenu = buildTypesMenuStrictMode(
        [jvNumber(123), jvNull],
        jvString('Foo'),
      );
      const expectedTypesMenu = buildExpectedTypesMenu([jvNumber(0), jvNull]);
      expect(typesMenu).toStrictEqual(expectedTypesMenu);
    },
  );

  test(
    '[SM: ON, P: 2 different type, V: something equals than proposal] ' +
      'menu type exists and subMenu should contains 1 entry corresponding to the proposal that does not match the value',
    () => {
      const typesMenu = buildTypesMenuStrictMode(
        [jvNumber(123), jvNull],
        jvNumber(456),
      );
      const expectedTypesMenu = buildExpectedTypesMenu([jvNull]);
      expect(typesMenu).toStrictEqual(expectedTypesMenu);
    },
  );

  test(
    '[SM: ON, P: 1, V: wrong type]' +
      'menu type exists and subMenu should contains 1 entry corresponding to the proposal',
    () => {
      const typesMenu = buildTypesMenuStrictMode([jvNumber(123)], jvNull);
      const expectedTypesMenu = buildExpectedTypesMenu([jvNumber(0)]);
      expect(typesMenu).toStrictEqual(expectedTypesMenu);
    },
  );

  test(
    '[SM: OFF, whatever] ' +
      'menu type exists and subMenu should contains all available types',
    () => {
      const typesMenu = buildTypesMenu(jvNull);
      const expectedTypesMenu = buildExpectedTypesMenu([
        jvString(''),
        jvNumber(0),
        jvBool(true),
        jvObject(),
        jvArray(),
      ]);
      expect(typesMenu).toStrictEqual(expectedTypesMenu);
    },
  );
});

describe('menu render options', () => {
  describe('default options', () => {
    test('null value', () => {
      const props: MenuPropertyProps = {
        root: jvNull,
        path: JsPath.empty,
        valueAtPath: jvNull,
        proposals: [],
        strictMode: false,
        menuFilter: {},
      };
      const actual = createMenu(props);
      expect(menuActionTags(actual)).toEqual(['types', 'delete']);
    });

    test('empty object value', () => {
      const props: MenuPropertyProps = {
        root: jvObject(),
        path: JsPath.empty,
        valueAtPath: jvObject(),
        proposals: [],
        strictMode: false,
        menuFilter: {},
      };
      const actual = createMenu(props);
      expect(menuActionTags(actual)).toEqual(['add', 'types', 'delete']);
    });

    test('empty array value', () => {
      const props: MenuPropertyProps = {
        root: jvArray(),
        path: JsPath.empty,
        valueAtPath: jvArray(),
        proposals: [],
        strictMode: false,
        menuFilter: {},
      };
      const actual = createMenu(props);
      expect(menuActionTags(actual)).toEqual(['add', 'types', 'delete']);
    });

    test('value with proposals', () => {
      const props: MenuPropertyProps = {
        root: jvArray(),
        path: JsPath.empty,
        valueAtPath: jvNull,
        proposals: [jvNull],
        strictMode: false,
        menuFilter: {},
      };
      const actual = createMenu(props);
      expect(menuActionTags(actual)).toEqual(['types', 'propose', 'delete']);
    });

    test('non empty object value with move', () => {
      const props: MenuPropertyProps = {
        root: jvObject([
          { name: 'foo', value: jvNull },
          { name: 'bar', value: jvNull },
        ]),
        path: JsPath.empty.append('bar'),
        valueAtPath: jvNull,
        proposals: [],
        strictMode: false,
        menuFilter: {},
      };
      const actual = createMenu(props);
      expect(menuActionTags(actual)).toEqual(['move', 'types', 'delete']);
    });

    test('non empty array value with move', () => {
      const props: MenuPropertyProps = {
        root: jvArray([jvNull, jvNull]),
        path: JsPath.empty.append(1),
        valueAtPath: jvNull,
        proposals: [],
        strictMode: false,
        menuFilter: {},
      };
      const actual = createMenu(props);
      expect(menuActionTags(actual)).toEqual(['move', 'types', 'delete']);
    });

    test('null value no delete', () => {
      const props: MenuPropertyProps = {
        root: jvNull,
        path: JsPath.empty,
        valueAtPath: jvNull,
        proposals: [],
        strictMode: false,
        menuFilter: {
          menuFilters: MenuOptions.DELETE,
        },
      };
      const actual = createMenu(props);
      expect(getSelectedFilter(props, MenuOptions.ADD)).toEqual(false);
      expect(getSelectedFilter(props, MenuOptions.CHANGE_TYPE)).toEqual(false);
      expect(getSelectedFilter(props, MenuOptions.DELETE)).toEqual(true);
      expect(getSelectedFilter(props, MenuOptions.MOVE)).toEqual(false);
      expect(getSelectedFilter(props, MenuOptions.PROPOSE)).toEqual(false);
      expect(menuActionTags(actual)).toEqual(['types']);
    });

    test('empty object value no add or change type', () => {
      const props: MenuPropertyProps = {
        root: jvObject(),
        path: JsPath.empty,
        valueAtPath: jvObject(),
        proposals: [],
        strictMode: false,
        menuFilter: {
          menuFilters: MenuOptions.ADD,
        },
      };
      const actual = createMenu(props);
      expect(getSelectedFilter(props, MenuOptions.ADD)).toEqual(true);
      expect(getSelectedFilter(props, MenuOptions.CHANGE_TYPE)).toEqual(false);
      expect(getSelectedFilter(props, MenuOptions.DELETE)).toEqual(false);
      expect(getSelectedFilter(props, MenuOptions.MOVE)).toEqual(false);
      expect(getSelectedFilter(props, MenuOptions.PROPOSE)).toEqual(false);
      expect(menuActionTags(actual)).toEqual(['types', 'delete']);
    });

    test('empty array value no delete or change type', () => {
      const props: MenuPropertyProps = {
        root: jvArray(),
        path: JsPath.empty,
        valueAtPath: jvArray(),
        proposals: [],
        strictMode: false,
        menuFilter: {
          menuFilters: MenuOptions.DELETE | MenuOptions.CHANGE_TYPE,
        },
      };
      const actual = createMenu(props);
      expect(getSelectedFilter(props, MenuOptions.ADD)).toEqual(false);
      expect(getSelectedFilter(props, MenuOptions.CHANGE_TYPE)).toEqual(true);
      expect(getSelectedFilter(props, MenuOptions.DELETE)).toEqual(true);
      expect(getSelectedFilter(props, MenuOptions.MOVE)).toEqual(false);
      expect(getSelectedFilter(props, MenuOptions.PROPOSE)).toEqual(false);
      expect(menuActionTags(actual)).toEqual(['add']);
    });

    test('value with proposals no propose or change type or add', () => {
      const props: MenuPropertyProps = {
        root: jvArray(),
        path: JsPath.empty,
        valueAtPath: jvNull,
        proposals: [jvNull],
        strictMode: false,
        menuFilter: {
          menuFilters:
            MenuOptions.CHANGE_TYPE | MenuOptions.PROPOSE | MenuOptions.ADD,
        },
      };
      const actual = createMenu(props);
      expect(getSelectedFilter(props, MenuOptions.ADD)).toEqual(true);
      expect(getSelectedFilter(props, MenuOptions.CHANGE_TYPE)).toEqual(true);
      expect(getSelectedFilter(props, MenuOptions.DELETE)).toEqual(false);
      expect(getSelectedFilter(props, MenuOptions.MOVE)).toEqual(false);
      expect(getSelectedFilter(props, MenuOptions.PROPOSE)).toEqual(true);
      expect(menuActionTags(actual)).toEqual(['delete']);
    });

    test('non empty object value with move no change type', () => {
      const props: MenuPropertyProps = {
        root: jvObject([
          { name: 'foo', value: jvNull },
          { name: 'bar', value: jvNull },
        ]),
        path: JsPath.empty.append('bar'),
        valueAtPath: jvNull,
        proposals: [],
        strictMode: false,
        menuFilter: {
          menuFilters: MenuOptions.CHANGE_TYPE,
        },
      };
      const actual = createMenu(props);
      expect(getSelectedFilter(props, MenuOptions.ADD)).toEqual(false);
      expect(getSelectedFilter(props, MenuOptions.CHANGE_TYPE)).toEqual(true);
      expect(getSelectedFilter(props, MenuOptions.DELETE)).toEqual(false);
      expect(getSelectedFilter(props, MenuOptions.MOVE)).toEqual(false);
      expect(getSelectedFilter(props, MenuOptions.PROPOSE)).toEqual(false);
      expect(menuActionTags(actual)).toEqual(['move', 'delete']);
    });

    test('non empty array value with move no change type or move', () => {
      const props: MenuPropertyProps = {
        root: jvArray([jvNull, jvNull]),
        path: JsPath.empty.append(1),
        valueAtPath: jvNull,
        proposals: [],
        strictMode: false,
        menuFilter: {
          menuFilters: MenuOptions.MOVE | MenuOptions.CHANGE_TYPE,
        },
      };
      const actual = createMenu(props);
      expect(getSelectedFilter(props, MenuOptions.ADD)).toEqual(false);
      expect(getSelectedFilter(props, MenuOptions.CHANGE_TYPE)).toEqual(true);
      expect(getSelectedFilter(props, MenuOptions.DELETE)).toEqual(false);
      expect(getSelectedFilter(props, MenuOptions.MOVE)).toEqual(true);
      expect(getSelectedFilter(props, MenuOptions.PROPOSE)).toEqual(false);
      expect(menuActionTags(actual)).toEqual(['delete']);
    });
  });
});

/*-----------*/
/*  Helpers  */
/*-----------*/

function buildTypesMenu(
  valueAtPath: JsonValue,
): ReadonlyArray<MenuItem<MenuAction>> {
  return createTypesMenu(JsPath.empty, valueAtPath, [], false);
}

function buildTypesMenuStrictMode(
  proposals: ReadonlyArray<JsonValue>,
  valueAtPath: JsonValue,
): ReadonlyArray<MenuItem<MenuAction>> {
  return createTypesMenu(JsPath.empty, valueAtPath, proposals, true);
}

function buildExpectedTypesMenu(
  values: ReadonlyArray<JsonValue>,
): ReadonlyArray<MenuItem<MenuAction>> {
  return [
    item<MenuAction>(
      { tag: 'types' },
      menu(
        values.map((v) => {
          return item({ tag: 'change-type', path: JsPath.empty, value: v });
        }),
      ),
    ),
  ];
}

function menuActionTags(menu: Menu<MenuAction>): ReadonlyArray<string> {
  return menu.elems.flatMap((e) => {
    switch (e.tag) {
      case 'item':
        return [e.userData.tag];
      default:
        return [];
    }
  });
}

function getSelectedFilter(
  menuPropertyProps: MenuPropertyProps,
  filter: MenuOptions,
) {
  return (
    menuPropertyProps?.menuFilter?.menuFilters &&
    (menuPropertyProps?.menuFilter?.menuFilters & filter) === filter
  );
}
