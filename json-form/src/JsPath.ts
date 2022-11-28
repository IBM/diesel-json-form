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

import { just, Maybe, maybeOf, nothing } from 'tea-cup-core';

export class JsPath {
  private constructor(private readonly _elems: ReadonlyArray<string>) {}

  isEmpty(): boolean {
    return this._elems.length === 0;
  }

  get elems(): ReadonlyArray<string> {
    return this._elems;
  }

  head(): Maybe<string> {
    return maybeOf(this.elems[0]);
  }

  tail(): JsPath {
    const newElems = this._elems.slice(1);
    return new JsPath(newElems);
  }

  format(separator = '/'): string {
    return this._elems.join(separator);
  }

  equals(other: JsPath) {
    return this.format() === other.format();
  }

  append(elem: string | number): JsPath {
    return new JsPath(this._elems.concat([elem.toString()]));
  }

  parent(): Maybe<JsPath> {
    if (this._elems.length === 0) {
      return nothing;
    }
    const parts = this._elems.slice(0, -1);
    return just(new JsPath(parts));
  }

  lastElem(): Maybe<string> {
    return maybeOf(this._elems[this._elems.length - 1]);
  }

  isParentOf(child: JsPath): boolean {
    return child.format().startsWith(this.format());
  }

  static parse(path: string) {
    if (path === '') {
      return JsPath.empty;
    }
    const parts = path.split('/');
    return new JsPath(parts);
  }

  static empty: JsPath = new JsPath([]);
}
