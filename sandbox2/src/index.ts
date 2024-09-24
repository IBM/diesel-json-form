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

import './style.css';
import { samples } from './initdata';
import { JsonFormElement } from './jsonform/JsonFormElement';
import { JsonValueElement } from './jsonform/JsonValueElement';
import { toJsonNode } from './jsonform/util';

customElements.define(JsonFormElement.TAG_NAME, JsonFormElement);
customElements.define(JsonValueElement.TAG_NAME, JsonValueElement);

const sampleSchemaSelect = document.getElementById(
  'sampleSchemaSelect',
) as HTMLSelectElement;

samples
  .map((s) => {
    const e = document.createElement('option');
    e.value = s[1];
    e.innerHTML = s[0];
    return e;
  })
  .forEach((e) => sampleSchemaSelect.appendChild(e));

const taSchema = document.getElementById('ta-schema') as HTMLTextAreaElement;

const jsonForm = document.getElementById('my-form') as JsonFormElement;

sampleSchemaSelect.addEventListener('change', () => {
  taSchema.value = sampleSchemaSelect.value;
  // editor1.setValue(sampleSchemaSelect.value);
  // sendJsonStr();
  jsonForm.schema = JSON.parse(taSchema.value);
});

jsonForm.value = toJsonNode({
  foo: 123,
  bar: 'yalla',
  baz: { skunk: true, myList: [1, 2, 'yess'] },
});
