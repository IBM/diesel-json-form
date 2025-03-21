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
import * as JsFacade from '@diesel-parser/json-schema-facade-ts';

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
  readonly value: string;
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

export function jvNumber(value: string): JvNumber {
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

export function clearPropertiesIfObject(v: JsonValue): JsonValue {
  if (v.tag === 'jv-object') {
    return jvObject();
  }
  return v;
}

function mkSpaces(space: string, indentLevel: number): string {
  let s = '';
  for (let i = 0; i < indentLevel; i++) {
    s += space;
  }
  return s;
}

export function stringify(value: JsonValue, space?: string): string {
  return doStringify(value, space);
}

const numberRegex = new RegExp(
  '^-?(?:0|[1-9]\\d*)(?:\\.\\d+)?(?:[eE][+-]?\\d+)?$',
);

function doStringify(
  value: JsonValue,
  space?: string,
  indentLevel: number = 1,
): string {
  switch (value.tag) {
    case 'jv-null':
      return 'null';
    case 'jv-string':
      return `"${escapeDoubleQuotes(value.value)}"`;
    case 'jv-boolean':
      return value.value ? 'true' : 'false';
    case 'jv-number':
      if (!numberRegex.test(value.value)) {
        return `"${escapeDoubleQuotes(value.value)}"`;
      } else {
        return value.value;
      }
    case 'jv-array': {
      if (space) {
        const indent = mkSpaces(space, indentLevel);
        const elemLines = value.elems.map((elem) => {
          const elemVal = doStringify(elem, space, indentLevel + 1);
          return indent + elemVal;
        });
        let elems = elemLines.join(',\n');
        if (elemLines.length > 0) {
          elems += '\n';
        }
        return `[\n${elems}${mkSpaces(space, indentLevel - 1)}]`;
      } else {
        return `[${value.elems.map((e) => stringify(e, space)).join(',')}]`;
      }
    }

    case 'jv-object': {
      if (space) {
        const indent = mkSpaces(space, indentLevel);
        const propLines = value.properties.map((p) => {
          const propVal = doStringify(p.value, space, indentLevel + 1);
          return indent + '"' + escapeDoubleQuotes(p.name) + '": ' + propVal;
        });
        let props = propLines.join(',\n');
        if (propLines.length > 0) {
          props += '\n';
        }
        return `{\n${props}${mkSpaces(space, indentLevel - 1)}}`;
      } else {
        return `{${value.properties.map((p) => '"' + escapeDoubleQuotes(p.name) + '":' + stringify(p.value, space)).join(',')}}`;
      }
    }
  }
}

function escapeDoubleQuotes(s: string): string {
  return s.replace(/\\([\s\S])|(")/g, '\\$1$2');
}

export function jsonValueToFacadeValue(v: JsonValue): JsFacade.JsonValue {
  const s = stringify(v);
  return JsFacade.parseValue(s);
}

export function parseJsonValue(v: string): Result<string, JsonValue> {
  try {
    const astNode = JsFacade.parseValue(v);
    return ok(JsFacade.toJsonValue(astNode));
  } catch (e) {
    return err(getErrorMessage(e));
  }
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message;
  return String(error);
}
