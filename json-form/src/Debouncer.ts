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

import { Cmd, Dispatcher } from 'tea-cup-core';

export class Debouncer<M> {
  private cmd?: DebounceCmd<M>;

  debounce(msg: M, delay: number): Cmd<M> {
    if (this.cmd) {
      this.cmd.cancel();
      delete this.cmd;
    }
    this.cmd = new DebounceCmd<M>(msg, delay);
    return this.cmd;
  }
}

class DebounceCmd<M> extends Cmd<M> {
  private timeout?: any;

  private canceled = false;

  constructor(private readonly msg: M, private readonly delay: number) {
    super();
  }

  execute(dispatch: Dispatcher<M>): void {
    this.timeout = setTimeout(() => {
      if (!this.canceled) {
        dispatch(this.msg);
      }
    }, this.delay);
  }

  cancel() {
    if (this.timeout) {
      clearTimeout(this.timeout);
    }
    this.canceled = true;
  }
}
