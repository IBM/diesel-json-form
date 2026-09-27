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
import { nothing, ok } from 'tea-cup-fp';
import { update } from './JsonEditor';
import { initialModel } from './Model';
import { jvNull, jvNumber, jvObject, jvString } from './JsonValue';
import { defaultSchemaService } from './SchemaService';
import { RendererFactory } from './renderer/Renderer';

// ---------------------------------------------------------------------------
// Minimal stubs
// ---------------------------------------------------------------------------

/** A no-op renderer factory — no custom renderers needed for these tests. */
const noopRendererFactory = new RendererFactory();

/**
 * Build the smallest valid model with `pendingIds` pre-seeded so that
 * `'got-updated-value'` has the given current pending id.
 */
function modelWithPendingId(pendingId: number) {
  const base = initialModel('en', nothing, jvNull, false, 0);
  const pendingIds = new Map(base.pendingIds);
  pendingIds.set('got-updated-value', pendingId);
  return { ...base, pendingIds };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('update – add-property race condition', () => {
  /**
   * A value typed by the user while an add-property task is in-flight must not
   * be overwritten when the (now-outdated) task eventually resolves.
   *
   * Sequence: add-property-btn-clicked (pendingId advances to 2)
   *           → user types a value (root updated in model)
   *           → outdated task resolves with id=1 (stale)
   * Expected: model root keeps the typed value; no value-changed is emitted.
   */
  test('typed value is preserved when an outdated add-property task resolves', () => {
    const rootWithTypedValue = jvObject([
      { name: 'typed', value: jvString('hello') },
    ]);

    // pendingId=2 means a second task was dispatched after this one — id=1 is outdated.
    const model = { ...modelWithPendingId(2), root: rootWithTypedValue };

    const outdatedTaskResult = jvObject([{ name: 'added', value: jvNull }]);

    const [newModel, , outMsg] = update(
      { tag: 'got-updated-value', id: 1, r: ok(outdatedTaskResult) },
      model,
      noopRendererFactory,
      defaultSchemaService,
    );

    // The typed value must survive — root is unchanged.
    expect(newModel.root).toBe(rootWithTypedValue);

    // No value-changed event must be emitted for a discarded task.
    expect(outMsg.type).toBe('Nothing');
  });

  /**
   * When the task that resolves is the most-recently dispatched one it must
   * still be applied normally — this is the standard add-property happy path.
   */
  test('add-property result is applied when no newer task was dispatched', () => {
    const model = { ...modelWithPendingId(1), root: jvNull };

    const addedRoot = jvObject([{ name: 'newProp', value: jvNumber('42') }]);

    const [newModel, , outMsg] = update(
      { tag: 'got-updated-value', id: 1, r: ok(addedRoot) },
      model,
      noopRendererFactory,
      defaultSchemaService,
    );

    // Root must reflect the newly added property.
    expect(newModel.root).toEqual(addedRoot);

    // value-changed must be emitted so the host application is notified.
    expect(outMsg.type).toBe('Just');
    if (outMsg.type === 'Just') {
      expect(outMsg.value.tag).toBe('value-changed');
      if (outMsg.value.tag === 'value-changed') {
        expect(outMsg.value.value).toEqual(addedRoot);
      }
    }
  });

  /**
   * The very first add-property dispatch (pendingId=1, task id=1) must be
   * applied — there is no prior task to be stale against.
   */
  test('first-ever add-property task is applied when it is the only one dispatched', () => {
    const model = { ...modelWithPendingId(1), root: jvNull };

    const addedRoot = jvObject([{ name: 'first', value: jvNull }]);

    const [newModel, , outMsg] = update(
      { tag: 'got-updated-value', id: 1, r: ok(addedRoot) },
      model,
      noopRendererFactory,
      defaultSchemaService,
    );

    expect(newModel.root).toEqual(addedRoot);
    expect(outMsg.type).toBe('Just');
  });
});
