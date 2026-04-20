/*
 * Copyright 2018, 2026 The Diesel Authors
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

import { JsonProperty, JsonValue, jvObject, setValueAt } from './JsonValue';
import { JsPath } from './JsPath';
import { SchemaService } from './SchemaService';

export async function proposeNested(
  schema: JsonValue,
  service: SchemaService,
  root: JsonValue,
  path: JsPath,
  maxDepth: number,
): Promise<readonly JsonValue[]> {
  const proposals = distinct(await service.propose(schema, root, path));
  if (maxDepth < 0) {
    return proposals;
  } else {
    const res: JsonValue[] = [];
    for (const x of proposals) {
      if (x.tag === 'jv-object') {
        const newRoot = setValueAt(root, path, x);
        const attrProposals: JsonProperty[] = [];
        for (const attr of x.properties) {
          const attrProposals2 = await proposeNested(
            schema,
            service,
            newRoot,
            path.append(attr.name),
            maxDepth - 1,
          );
          const head = attrProposals2[0];
          if (head) {
            const p: JsonProperty = {
              ...attr,
              value: head,
            };
            attrProposals.push(p);
          }
        }
        res.push(jvObject(attrProposals));
      } else {
        res.push(x);
      }
    }
    return res;
  }
}

function distinct<T>(array: readonly T[]): readonly T[] {
  const zero = { dejaVue: new Set<T>(), acc: [] as T[] };
  const { acc } = array.reduce(({ dejaVue, acc }, item: T) => {
    if (!dejaVue.has(item)) {
      acc.push(item);
      dejaVue.add(item);
    }
    return { dejaVue, acc };
  }, zero);
  return acc;
}
