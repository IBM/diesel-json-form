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

import { describe, test, expect } from 'vitest';
import { containsNonEscapedSlash, JsPath } from './JsPath';
import { just, nothing } from 'tea-cup-fp';

describe('JsPath', () => {
  test('empty', () => {
    expect(JsPath.parse('')).toEqual(JsPath.empty);
    expect(JsPath.empty.isEmpty()).toBe(true);
    expect(JsPath.empty.elems).toEqual([]);
    expect(JsPath.empty.format()).toEqual('');
    expect(JsPath.empty.equals(JsPath.empty)).toBe(true);
  });
  test('not empty', () => {
    expect(JsPath.parse('foo').isEmpty()).toBe(false);
  });
  test('head/tail', () => {
    expect(JsPath.empty.head()).toEqual(nothing);
    expect(JsPath.empty.tail()).toEqual(JsPath.empty);
    expect(JsPath.parse('foo').head()).toEqual(just('foo'));
    expect(JsPath.parse('foo').tail()).toEqual(JsPath.empty);
    expect(JsPath.parse('foo/bar/baz').head()).toEqual(just('foo'));
    expect(JsPath.parse('foo/bar/baz').tail()).toEqual(JsPath.parse('bar/baz'));
  });
  test('parent', () => {
    expect(JsPath.empty.parent()).toEqual(nothing);
    expect(JsPath.parse('foo').parent()).toEqual(just(JsPath.empty));
    expect(JsPath.parse('foo/bar').parent()).toEqual(just(JsPath.parse('foo')));
  });
  test('is parent of', () => {
    expect(JsPath.empty.isParentOf(JsPath.empty)).toBe(false);
    expect(JsPath.parse('foo').isParentOf(JsPath.parse('foo'))).toBe(false);
    expect(JsPath.parse('foo').isParentOf(JsPath.parse('foo/bar'))).toBe(true);
    expect(JsPath.parse('foo/bar').isParentOf(JsPath.parse('foo'))).toBe(false);
    expect(JsPath.parse('foo').isParentOf(JsPath.parse('bar'))).toBe(false);
  });
  test('leading slash throws', () => {
    expect(() => JsPath.parse('/')).toThrowError(
      "Invalid path : /, leading slash isn't allowed",
    );
  });
  test('leading slash throws 2', () => {
    expect(() => JsPath.parse('/yalla')).toThrowError(
      "Invalid path : /yalla, leading slash isn't allowed",
    );
  });
  test('trailing slash throws', () => {
    expect(() => JsPath.parse('foo/')).toThrowError(
      "Invalid path : foo/, trailing slash isn't allowed",
    );
  });
  test('trailing slash throws 2', () => {
    expect(() => JsPath.parse('foo/bar/')).toThrowError(
      "Invalid path : foo/bar/, trailing slash isn't allowed",
    );
  });
  test('cannot append elem with slash', () => {
    expect(() => JsPath.empty.append('yo/lo')).toThrowError(
      'Invalid path element : yo/lo, contains non-escaped slash',
    );
  });
});

describe('contains non escaped slash', () => {
  test('no slashes', () => {
    expect(containsNonEscapedSlash('yolo')).toBe(false);
  });
  test('one slash', () => {
    expect(containsNonEscapedSlash('yo/lo')).toBe(true);
  });
  test('one escaped slash', () => {
    expect(containsNonEscapedSlash('yo\\/lo')).toBe(false);
  });
  test('one escaped, one not', () => {
    expect(containsNonEscapedSlash('yo\\/lo/lo')).toBe(true);
  });
});
