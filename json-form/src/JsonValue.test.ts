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
  deleteValueAt,
  getValueAt,
  JsonValue,
  jvArray,
  jvBool,
  jvNull,
  jvNumber,
  JvObject,
  jvObject,
  jvString,
  mapValueAt,
  mergeProperties,
  moveElement,
  moveProperty,
  parseJsonValue,
  setValueAt,
  valueFromAny,
  valueToAny,
} from './JsonValue';
import { just, nothing, ok } from 'tea-cup-core';
import { JsPath } from './JsPath';

describe('JsonValue', () => {
  test('should parse from str', () => {
    expect(parseJsonValue('null')).toEqual(ok(jvNull));
    expect(parseJsonValue('123')).toEqual(ok(jvNumber(123)));
    expect(parseJsonValue('true')).toEqual(ok(jvBool(true)));
    expect(parseJsonValue('"yalla"')).toEqual(ok(jvString('yalla')));
    expect(parseJsonValue(JSON.stringify({ foo: 'bar' }))).toEqual(
      ok(jvObject([{ name: 'foo', value: jvString('bar') }])),
    );
    expect(parseJsonValue(JSON.stringify([1, 2, 3]))).toEqual(
      ok(jvArray([jvNumber(1), jvNumber(2), jvNumber(3)])),
    );
  });

  describe('should convert', () => {
    test('from any', () => {
      expect(valueFromAny(null)).toEqual(ok(jvNull));
      expect(valueFromAny(123)).toEqual(ok(jvNumber(123)));
      expect(valueFromAny(true)).toEqual(ok(jvBool(true)));
      expect(valueFromAny('yalla')).toEqual(ok(jvString('yalla')));
      expect(valueFromAny({ foo: 'bar' })).toEqual(
        ok(jvObject([{ name: 'foo', value: jvString('bar') }])),
      );
      expect(valueFromAny([1, { foo: 'bar' }, [2, 3]])).toEqual(
        ok(
          jvArray([
            jvNumber(1),
            jvObject([
              {
                name: 'foo',
                value: jvString('bar'),
              },
            ]),
            jvArray([jvNumber(2), jvNumber(3)]),
          ]),
        ),
      );
    });

    test('to any', () => {
      expect(valueToAny(jvNull)).toEqual(null);
      expect(valueToAny(jvNumber(123))).toEqual(123);
      expect(valueToAny(jvString('yalla'))).toEqual('yalla');
      expect(valueToAny(jvBool(true))).toEqual(true);
      expect(valueToAny(jvArray([jvNumber(1), jvNumber(2)]))).toEqual([1, 2]);
      expect(
        valueToAny(
          jvObject([
            { name: 'foo', value: jvString('bar') },
            {
              name: 'blah',
              value: jvObject([
                {
                  name: 'baz',
                  value: jvArray([jvBool(true), jvNumber(999)]),
                },
              ]),
            },
          ]),
        ),
      ).toEqual({
        foo: 'bar',
        blah: {
          baz: [true, 999],
        },
      });
    });
  });

  function valueFromAnyThrow(value: any): JsonValue {
    const v = valueFromAny(value);
    switch (v.tag) {
      case 'Err': {
        throw new Error(v.err);
      }
      case 'Ok': {
        return v.value;
      }
    }
  }

  describe('can be queried', () => {
    test('at root', () => {
      expect(getValueAt(jvNull, JsPath.empty)).toEqual(just(jvNull));
    });

    test('1st level prop', () => {
      expect(
        getValueAt(
          valueFromAnyThrow({
            foo: 'bar',
            blah: 1,
            zzz: true,
          }),
          JsPath.parse('foo'),
        ),
      ).toEqual(just(jvString('bar')));
    });

    test('1st level array', () => {
      expect(
        getValueAt(valueFromAnyThrow([1, true, 'yalla']), JsPath.parse('2')),
      ).toEqual(just(jvString('yalla')));
    });

    test('deeply nested', () => {
      const myObj = valueFromAnyThrow({
        a: {
          b: {
            c: {
              d: [
                1,
                {
                  foo: 'bar',
                },
                2,
              ],
              d2: 'yolo',
            },
          },
          b2: true,
        },
        a2: 'yalla',
      });

      expect(getValueAt(myObj, JsPath.parse('a/b/c'))).toEqual(
        just(
          valueFromAnyThrow({
            d: [
              1,
              {
                foo: 'bar',
              },
              2,
            ],
            d2: 'yolo',
          }),
        ),
      );
      expect(getValueAt(myObj, JsPath.parse('a/b/c/d/1/foo'))).toEqual(
        just(jvString('bar')),
      );
    });
  });

  describe('can be updated', () => {
    test('at root', () => {
      expect(setValueAt(jvNull, JsPath.empty, jvNumber(123))).toEqual(
        jvNumber(123),
      );
    });

    test('1st level prop', () => {
      expect(
        setValueAt(
          jvObject([
            { name: 'foo', value: jvNumber(12) },
            { name: 'bar', value: jvNumber(13) },
          ]),
          JsPath.empty.append('foo'),
          jvBool(true),
        ),
      ).toEqual(
        jvObject([
          { name: 'foo', value: jvBool(true) },
          { name: 'bar', value: jvNumber(13) },
        ]),
      );
    });

    test('1st level array', () => {
      expect(
        setValueAt(
          jvArray([jvNumber(12), jvNumber(13), jvNumber(14)]),
          JsPath.empty.append(1),
          jvString('yalla'),
        ),
      ).toEqual(jvArray([jvNumber(12), jvString('yalla'), jvNumber(14)]));
    });

    test('deeply nested', () => {
      const myObj = valueFromAnyThrow({
        a: {
          b: {
            c: {
              d: [
                1,
                {
                  foo: 'bar',
                },
                2,
              ],
            },
          },
          b2: true,
        },
        a2: 'yalla',
      });

      const expected = valueFromAnyThrow({
        a: {
          b: {
            c: {
              d: [
                1,
                {
                  foo: 999,
                },
                2,
              ],
            },
          },
          b2: true,
        },
        a2: 'yalla',
      });

      expect(
        setValueAt(myObj, JsPath.parse('a/b/c/d/1/foo'), jvNumber(999)),
      ).toEqual(expected);
    });
  });

  describe('can be mapped', () => {
    test('root', () => {
      expect(
        mapValueAt(jvNull, JsPath.empty, () => just(jvNumber(123))),
      ).toEqual(just(jvNumber(123)));
    });

    test('root delete', () => {
      expect(deleteValueAt(jvNull, JsPath.empty)).toEqual(nothing);
    });

    const root1 = jvObject([
      { name: 'foo', value: jvString('bar') },
      { name: 'blah', value: jvString('yalla') },
    ]);

    test('1st level prop', () => {
      expect(
        mapValueAt(root1, JsPath.parse('foo'), () => just(jvNumber(123))),
      ).toEqual(
        just(
          jvObject([
            { name: 'foo', value: jvNumber(123) },
            { name: 'blah', value: jvString('yalla') },
          ]),
        ),
      );
    });

    test('1st level prop delete', () => {
      expect(deleteValueAt(root1, JsPath.parse('foo'))).toEqual(
        just(jvObject([{ name: 'blah', value: jvString('yalla') }])),
      );
    });

    const root2 = jvArray([jvNumber(123), jvString('foo'), jvNull]);

    test('1st level array', () => {
      expect(
        mapValueAt(root2, JsPath.parse('1'), () => just(jvBool(true))),
      ).toEqual(just(jvArray([jvNumber(123), jvBool(true), jvNull])));
    });

    test('1st level array delete', () => {
      expect(deleteValueAt(root2, JsPath.parse('1'))).toEqual(
        just(jvArray([jvNumber(123), jvNull])),
      );
    });

    const root3 = valueFromAnyThrow({
      a: {
        b: {
          c: {
            d: [
              1,
              {
                foo: 'bar',
              },
              2,
            ],
          },
        },
        b2: true,
      },
      a2: 'yalla',
    });

    test('deeply nested', () => {
      const mapped = mapValueAt(root3, JsPath.parse('a/b/c/d/1/foo'), () =>
        just(jvNull),
      );
      expect(mapped).toEqual(
        just(
          valueFromAnyThrow({
            a: {
              b: {
                c: {
                  d: [
                    1,
                    {
                      foo: null,
                    },
                    2,
                  ],
                },
              },
              b2: true,
            },
            a2: 'yalla',
          }),
        ),
      );
    });

    test('deeply nested delete', () => {
      expect(deleteValueAt(root3, JsPath.parse('a/b/c/d/1/foo'))).toEqual(
        just(
          valueFromAnyThrow({
            a: {
              b: {
                c: {
                  d: [1, {}, 2],
                },
              },
              b2: true,
            },
            a2: 'yalla',
          }),
        ),
      );
    });
  });

  describe('should move', () => {
    test('props', () => {
      const v = valueFromAnyThrow({
        a: 1,
        b: 2,
        c: 3,
      });
      expect(moveProperty(v, JsPath.empty, 'b', 'up')).toEqual(
        valueFromAnyThrow({
          b: 2,
          a: 1,
          c: 3,
        }),
      );
      expect(moveProperty(v, JsPath.empty, 'b', 'down')).toEqual(
        valueFromAnyThrow({
          a: 1,
          c: 3,
          b: 2,
        }),
      );
      expect(moveProperty(v, JsPath.empty, 'a', 'up')).toEqual(
        valueFromAnyThrow({
          a: 1,
          b: 2,
          c: 3,
        }),
      );
      expect(moveProperty(v, JsPath.empty, 'c', 'down')).toEqual(
        valueFromAnyThrow({
          a: 1,
          b: 2,
          c: 3,
        }),
      );
      expect(moveProperty(v, JsPath.empty, 'c', 'up')).toEqual(
        valueFromAnyThrow({
          a: 1,
          c: 3,
          b: 2,
        }),
      );
      expect(moveProperty(v, JsPath.empty, 'not-existing', 'up')).toEqual(v);
    });

    test('arrays', () => {
      const v = valueFromAnyThrow([1, 2, 3]);
      expect(moveElement(v, JsPath.empty, 1, 'up')).toEqual(
        valueFromAnyThrow([2, 1, 3]),
      );
      expect(moveElement(v, JsPath.empty, 1, 'down')).toEqual(
        valueFromAnyThrow([1, 3, 2]),
      );
      expect(moveElement(v, JsPath.empty, 0, 'up')).toEqual(
        valueFromAnyThrow([1, 2, 3]),
      );
      expect(moveElement(v, JsPath.empty, 2, 'down')).toEqual(
        valueFromAnyThrow([1, 2, 3]),
      );
      expect(moveElement(v, JsPath.empty, 999, 'up')).toEqual(v);
    });
  });

  test('objects can be merged', () => {
    const o1 = valueFromAnyThrow({
      a: 1,
      c: 3,
    }) as JvObject;
    const o2 = valueFromAnyThrow({
      a: 2,
      b: 2,
    }) as JvObject;
    expect(mergeProperties(o1, o2)).toEqual(
      valueFromAnyThrow({
        a: 2,
        b: 2,
        c: 3,
      }),
    );
    expect(mergeProperties(o2, o1)).toEqual(
      valueFromAnyThrow({
        a: 1,
        c: 3,
        b: 2,
      }),
    );
  });
});
