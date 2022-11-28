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

import { err, just, Maybe, nothing, ok, Result } from 'tea-cup-core';
import { JsPath } from './JsPath';

export type JsonValue =
  | JvNull
  | JvString
  | JvBoolean
  | JvNumber
  | JvArray
  | JvObject;

export interface JvNull {
  readonly tag: 'jv-null';
}

export interface JvString {
  readonly tag: 'jv-string';
  readonly value: string;
}

export interface JvBoolean {
  readonly tag: 'jv-boolean';
  readonly value: boolean;
}

export interface JvNumber {
  readonly tag: 'jv-number';
  readonly value: number;
}

export interface JvArray {
  readonly tag: 'jv-array';
  readonly elems: ReadonlyArray<JsonValue>;
}

export interface JvObject {
  readonly tag: 'jv-object';
  readonly properties: ReadonlyArray<JsonProperty>;
}

export const jvNull: JvNull = { tag: 'jv-null' };

export function jvString(value: string): JvString {
  return {
    tag: 'jv-string',
    value,
  };
}

export function jvNumber(value: number): JvNumber {
  return {
    tag: 'jv-number',
    value,
  };
}

export function jvBool(value: boolean): JvBoolean {
  return {
    tag: 'jv-boolean',
    value,
  };
}

export function jvObject(
  properties: ReadonlyArray<JsonProperty> = [],
): JvObject {
  return {
    tag: 'jv-object',
    properties,
  };
}
export function jvArray(elems: ReadonlyArray<JsonValue> = []): JvArray {
  return {
    tag: 'jv-array',
    elems,
  };
}

export interface JsonProperty {
  readonly name: string;
  readonly value: JsonValue;
}

export type JsonValueType =
  | 'string'
  | 'number'
  | 'boolean'
  | 'null'
  | 'object'
  | 'array';

export function valueType(value: JsonValue): JsonValueType {
  switch (value.tag) {
    case 'jv-string':
      return 'string';
    case 'jv-object':
      return 'object';
    case 'jv-number':
      return 'number';
    case 'jv-null':
      return 'null';
    case 'jv-boolean':
      return 'boolean';
    case 'jv-array':
      return 'array';
  }
}

export function valueFromAny(value: any): Result<string, JsonValue> {
  if (value === undefined) {
    return err('undefined');
  }
  if (value === null) {
    return ok(jvNull);
  }
  if (Array.isArray(value)) {
    const a = value as any[];
    const elems = [];
    for (let i = 0; i < a.length; i++) {
      const elemValue = valueFromAny(a[i]);
      switch (elemValue.tag) {
        case 'Ok': {
          elems.push(elemValue.value);
          break;
        }
        case 'Err': {
          return elemValue;
        }
      }
    }
    return ok({
      tag: 'jv-array',
      elems,
    });
  }
  const valueType = typeof value;
  switch (valueType) {
    case 'object':
      if (!isObjLiteral(value)) {
        return err('not an object literal');
      }
      const keys = Object.keys(value);
      const properties: Array<JsonProperty> = [];
      for (let i = 0; i < keys.length; i++) {
        const propName = keys[i];
        const propValue = valueFromAny(value[propName]);
        switch (propValue.tag) {
          case 'Ok': {
            properties.push({
              name: propName,
              value: propValue.value,
            });
            break;
          }
          case 'Err': {
            return propValue;
          }
        }
      }

      return ok({ tag: 'jv-object', properties });
    case 'string':
      return ok({ tag: 'jv-string', value });
    case 'boolean':
      return ok({ tag: 'jv-boolean', value });
    case 'number':
      return ok({ tag: 'jv-number', value });
    default:
      return err(valueType);
  }
}

export function valueToAny(value: JsonValue): any {
  switch (value.tag) {
    case 'jv-array':
      return value.elems.map(valueToAny);
    case 'jv-object': {
      const res: any = {};
      value.properties.forEach((p) => {
        res[p.name] = valueToAny(p.value);
      });
      return res;
    }
    case 'jv-boolean':
      return value.value;
    case 'jv-null':
      return null;
    case 'jv-number':
      return value.value;
    case 'jv-string': {
      return value.value;
    }
  }
}

function isObjLiteral(_obj: any) {
  let _test = _obj;
  return typeof _obj !== 'object' || _obj === null
    ? false
    : (function () {
        while (true) {
          if (
            Object.getPrototypeOf((_test = Object.getPrototypeOf(_test))) ===
            null
          ) {
            break;
          }
        }
        return Object.getPrototypeOf(_obj) === _test;
      })();
}

export function parseJsonValue(json: string): Result<string, JsonValue> {
  try {
    const x = JSON.parse(json);
    return valueFromAny(x);
  } catch (e) {
    return err(e.message);
  }
}

export function setValueAt(
  root: JsonValue,
  path: JsPath,
  value: JsonValue,
): JsonValue {
  return mapValueAt(root, path, () => just(value)).withDefault(root);
}

export function deleteValueAt(root: JsonValue, path: JsPath): Maybe<JsonValue> {
  return mapValueAt(root, path, () => nothing);
}

export function getValueAt(root: JsonValue, path: JsPath): Maybe<JsonValue> {
  const ph = path.head();
  switch (ph.type) {
    case 'Just': {
      const pathHead = ph.value;
      switch (root.tag) {
        case 'jv-object':
          const prop = root.properties.find((p) => p.name === pathHead);
          if (prop === undefined) {
            return nothing;
          }
          return getValueAt(prop.value, path.tail());
        case 'jv-array':
          const index = parseInt(pathHead);
          if (isNaN(index)) {
            return nothing;
          }
          const elem = root.elems[index];
          if (elem === undefined) {
            return nothing;
          }
          return getValueAt(elem, path.tail());
        default:
          return just(root);
      }
    }
    case 'Nothing': {
      // empty path
      return just(root);
    }
  }
}

export function mapValueAt(
  root: JsonValue,
  path: JsPath,
  f: (value: JsonValue) => Maybe<JsonValue>,
): Maybe<JsonValue> {
  const ph = path.head();
  switch (ph.type) {
    case 'Nothing': {
      return f(root);
    }
    case 'Just': {
      const pathHead = ph.value;
      switch (root.tag) {
        case 'jv-object': {
          return just(
            jvObject(
              root.properties.flatMap((prop) => {
                if (prop.name === pathHead) {
                  return mapValueAt(prop.value, path.tail(), f)
                    .map((value) => [
                      {
                        ...prop,
                        value,
                      },
                    ])
                    .withDefault([]);
                } else {
                  return [prop];
                }
              }),
            ),
          );
        }
        case 'jv-array': {
          const pathIndex = parseInt(pathHead);
          if (isNaN(pathIndex)) {
            return just(root);
          }
          return just(
            jvArray(
              root.elems.flatMap((elem, elemIndex) => {
                if (elemIndex === pathIndex) {
                  return mapValueAt(elem, path.tail(), f)
                    .map((value) => [value])
                    .withDefault([]);
                } else {
                  return [elem];
                }
              }),
            ),
          );
        }
        default: {
          return just(root);
        }
        // }
      }
    }
  }
}

export type MoveDirection = 'up' | 'down';

function moveElems<T>(
  array: ReadonlyArray<T>,
  index: number,
  direction: MoveDirection,
): ReadonlyArray<T> {
  const newIndex = index + (direction === 'up' ? -1 : 1);
  if (newIndex < 0 || newIndex > array.length - 1) {
    return array;
  }
  const newArray = new Array(...array);
  newArray[index] = array[newIndex];
  newArray[newIndex] = array[index];
  return newArray;
}

export function moveProperty(
  root: JsonValue,
  objectPath: JsPath,
  propertyName: string,
  direction: MoveDirection,
): JsonValue {
  return mapValueAt(root, objectPath, (value) => {
    if (value.tag === 'jv-object') {
      const propIndex = value.properties.findIndex(
        (p) => p.name === propertyName,
      );
      const newProps = moveElems(value.properties, propIndex, direction);
      const newObject: JvObject = {
        ...value,
        properties: newProps,
      };
      return just(newObject);
    }
    return just(value);
  }).withDefault(root);
}

export function moveElement(
  root: JsonValue,
  arrayPath: JsPath,
  elemIndex: number,
  direction: MoveDirection,
): JsonValue {
  return mapValueAt(root, arrayPath, (value) => {
    if (value.tag === 'jv-array') {
      const newElems = moveElems(value.elems, elemIndex, direction);
      const newArray: JvArray = {
        ...value,
        elems: newElems,
      };
      return just(newArray);
    }
    return just(value);
  }).withDefault(root);
}

export function mergeProperties(from: JvObject, into: JvObject): JvObject {
  // keep set of prop names to avoid overwriting existing stuff in dst
  const dstPropNames = new Set(into.properties.map((p) => p.name));
  const newProps = new Array(...into.properties);
  from.properties.forEach((p) => {
    if (!dstPropNames.has(p.name)) {
      newProps.push(p);
    }
  });
  return jvObject(newProps);
}

export function indexOfPathInParent(root: JsonValue, path: JsPath): number {
  return path
    .parent()
    .andThen((parentPath) =>
      path.lastElem().andThen((lastPathElem) =>
        getValueAt(root, parentPath).map((parentValue) => {
          switch (parentValue.tag) {
            case 'jv-object': {
              return parentValue.properties.findIndex(
                (p) => p.name === lastPathElem,
              );
            }
            case 'jv-array': {
              const i = parseInt(lastPathElem);
              if (isNaN(i)) {
                return -1;
              }
              return i;
            }
            default:
              return -1;
          }
        }),
      ),
    )
    .withDefault(-1);
}
