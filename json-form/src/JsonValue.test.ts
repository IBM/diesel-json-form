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
  stringify,
} from './JsonValue';
import { just, nothing, ok } from 'tea-cup-core';
import { JsPath } from './JsPath';
import * as JsFacade from '@diesel-parser/json-schema-facade-ts';

function valueFromAny(value: any): JsonValue {
  const s = JSON.stringify(value);
  return JsFacade.toJsonValue(JsFacade.parseValue(s));
}

describe('JsonValue', () => {
  test('should parse from str', () => {
    expect(parseJsonValue('null')).toEqual(ok(jvNull));
    expect(parseJsonValue('123')).toEqual(ok(jvNumber('123')));
    expect(parseJsonValue('true')).toEqual(ok(jvBool(true)));
    expect(parseJsonValue('"yalla"')).toEqual(ok(jvString('yalla')));
    expect(parseJsonValue(JSON.stringify({ foo: 'bar' }))).toEqual(
      ok(jvObject([{ name: 'foo', value: jvString('bar') }])),
    );
    expect(parseJsonValue(JSON.stringify([1, 2, 3]))).toEqual(
      ok(jvArray([jvNumber('1'), jvNumber('2'), jvNumber('3')])),
    );
  });

  test('JSON.parse rounds large numbers', () => {
    expect(JSON.parse('9999999999999999')).toEqual(10000000000000000);
  });

  test('should parse large numbers', () => {
    expect(parseJsonValue('9999999999999999')).toEqual(
      ok(jvNumber('9999999999999999')),
    );
  });

  describe('can be queried', () => {
    test('at root', () => {
      expect(getValueAt(jvNull, JsPath.empty)).toEqual(just(jvNull));
    });

    test('1st level prop', () => {
      expect(
        getValueAt(
          valueFromAny({
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
        getValueAt(valueFromAny([1, true, 'yalla']), JsPath.parse('2')),
      ).toEqual(just(jvString('yalla')));
    });

    test('deeply nested', () => {
      const myObj = valueFromAny({
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
          valueFromAny({
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
      expect(setValueAt(jvNull, JsPath.empty, jvNumber('123'))).toEqual(
        jvNumber('123'),
      );
    });

    test('1st level prop', () => {
      expect(
        setValueAt(
          jvObject([
            { name: 'foo', value: jvNumber('12') },
            { name: 'bar', value: jvNumber('13') },
          ]),
          JsPath.empty.append('foo'),
          jvBool(true),
        ),
      ).toEqual(
        jvObject([
          { name: 'foo', value: jvBool(true) },
          { name: 'bar', value: jvNumber('13') },
        ]),
      );
    });

    test('1st level array', () => {
      expect(
        setValueAt(
          jvArray([jvNumber('12'), jvNumber('13'), jvNumber('14')]),
          JsPath.empty.append(1),
          jvString('yalla'),
        ),
      ).toEqual(jvArray([jvNumber('12'), jvString('yalla'), jvNumber('14')]));
    });

    test('deeply nested', () => {
      const myObj = valueFromAny({
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

      const expected = valueFromAny({
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
        setValueAt(myObj, JsPath.parse('a/b/c/d/1/foo'), jvNumber('999')),
      ).toEqual(expected);
    });
  });

  describe('can be mapped', () => {
    test('root', () => {
      expect(
        mapValueAt(jvNull, JsPath.empty, () => just(jvNumber('123'))),
      ).toEqual(just(jvNumber('123')));
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
        mapValueAt(root1, JsPath.parse('foo'), () => just(jvNumber('123'))),
      ).toEqual(
        just(
          jvObject([
            { name: 'foo', value: jvNumber('123') },
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

    const root2 = jvArray([jvNumber('123'), jvString('foo'), jvNull]);

    test('1st level array', () => {
      expect(
        mapValueAt(root2, JsPath.parse('1'), () => just(jvBool(true))),
      ).toEqual(just(jvArray([jvNumber('123'), jvBool(true), jvNull])));
    });

    test('1st level array delete', () => {
      expect(deleteValueAt(root2, JsPath.parse('1'))).toEqual(
        just(jvArray([jvNumber('123'), jvNull])),
      );
    });

    const root3 = valueFromAny({
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
          valueFromAny({
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
          valueFromAny({
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
      const v = valueFromAny({
        a: 1,
        b: 2,
        c: 3,
      });
      expect(moveProperty(v, JsPath.empty, 'b', 'up')).toEqual(
        valueFromAny({
          b: 2,
          a: 1,
          c: 3,
        }),
      );
      expect(moveProperty(v, JsPath.empty, 'b', 'down')).toEqual(
        valueFromAny({
          a: 1,
          c: 3,
          b: 2,
        }),
      );
      expect(moveProperty(v, JsPath.empty, 'a', 'up')).toEqual(
        valueFromAny({
          a: 1,
          b: 2,
          c: 3,
        }),
      );
      expect(moveProperty(v, JsPath.empty, 'c', 'down')).toEqual(
        valueFromAny({
          a: 1,
          b: 2,
          c: 3,
        }),
      );
      expect(moveProperty(v, JsPath.empty, 'c', 'up')).toEqual(
        valueFromAny({
          a: 1,
          c: 3,
          b: 2,
        }),
      );
      expect(moveProperty(v, JsPath.empty, 'not-existing', 'up')).toEqual(v);
    });

    test('arrays', () => {
      const v = valueFromAny([1, 2, 3]);
      expect(moveElement(v, JsPath.empty, 1, 'up')).toEqual(
        valueFromAny([2, 1, 3]),
      );
      expect(moveElement(v, JsPath.empty, 1, 'down')).toEqual(
        valueFromAny([1, 3, 2]),
      );
      expect(moveElement(v, JsPath.empty, 0, 'up')).toEqual(
        valueFromAny([1, 2, 3]),
      );
      expect(moveElement(v, JsPath.empty, 2, 'down')).toEqual(
        valueFromAny([1, 2, 3]),
      );
      expect(moveElement(v, JsPath.empty, 999, 'up')).toEqual(v);
    });
  });

  test('objects can be merged', () => {
    const o1 = valueFromAny({
      a: 1,
      c: 3,
    }) as JvObject;
    const o2 = valueFromAny({
      a: 2,
      b: 2,
    }) as JvObject;
    expect(mergeProperties(o1, o2)).toEqual(
      valueFromAny({
        a: 2,
        b: 2,
        c: 3,
      }),
    );
    expect(mergeProperties(o2, o1)).toEqual(
      valueFromAny({
        a: 1,
        c: 3,
        b: 2,
      }),
    );
  });

  describe('stringify', () => {
    test('string', () => {
      expect(stringify(jvString('yalla'))).toEqual('"yalla"');
    });
    test('string escaped', () => {
      expect(stringify(jvString('ya"lla'))).toEqual('"ya\\"lla"');
      expect(stringify(jvString('ya\\"lla'))).toEqual('"ya\\"lla"');
    });
    test('number', () => {
      expect(stringify(jvNumber('123'))).toEqual('123');
      expect(stringify(jvNumber('9999999999999999'))).toEqual(
        '9999999999999999',
      );
    });
    test('null', () => {
      expect(stringify(jvNull)).toEqual('null');
    });
    test('boolean', () => {
      expect(stringify(jvBool(true))).toEqual('true');
    });
    test('object', () => {
      expect(stringify(jvObject([{ name: 'foo', value: jvNull }]))).toEqual(
        '{"foo":null}',
      );
    });
    test('array', () => {
      expect(stringify(jvArray([jvBool(false), jvNumber('123')]))).toEqual(
        '[false,123]',
      );
    });

    const raw = {
      foo: 1,
      bar: 'yalla',
      baz: [1, true],
    };
    const o = valueFromAny(raw);

    test('complex', () => {
      expect(stringify(o)).toEqual(JSON.stringify(raw));
    });

    describe('with indent', () => {
      function roundtrip(o: any) {
        const expected = JSON.stringify(o, undefined, '  ');
        expect(stringify(valueFromAny(o), '  ')).toEqual(expected);
      }

      test('object simple', () => {
        roundtrip({
          foo: 1,
          bar: 'baz',
        });
      });
      test('object nested', () => {
        roundtrip({
          foo: {
            bar: 'baz',
          },
        });
      });
      test('object nested 2', () => {
        roundtrip({
          foo: {
            bar: 'baz',
            blah: {
              yalla: 'yolo',
            },
          },
        });
      });
      test('array simple', () => {
        roundtrip([1, 2, 3]);
      });
      test('array nested', () => {
        roundtrip([
          [1, 2],
          [3, 4],
        ]);
      });
      test('array nested 2', () => {
        roundtrip([1, [2, [3, 4]]]);
      });
    });
  });
});
