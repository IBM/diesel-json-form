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

import { createTypesMenu, MenuAction } from './ContextMenuActions';
import {
  JsonValue,
  jvArray,
  jvBool,
  jvNull,
  jvNumber,
  jvObject,
  jvString,
} from '../JsonValue';
import { JsPath } from '../JsPath';
import { item, menu, MenuItem } from 'tea-pop-menu';

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
