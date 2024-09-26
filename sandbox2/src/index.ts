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
import { JsonFormElement } from './jsonform/elements/JsonFormElement';
import { valueFromAny } from '@diesel-parser/json-form';
import { JsonNullElement } from './jsonform/elements/JsonNullElement';
import { JsonArrayElement } from './jsonform/elements/JsonArrayElement';
import { JsonObjectElement } from './jsonform/elements/JsonObjectElement';
import { JsonBooleanElement } from './jsonform/elements/JsonBooleanElement';
import { JsonNumberElement } from './jsonform/elements/JsonNumberElement';
import { JsonStringElement } from './jsonform/elements/JsonStringElement';
import { JsonErrorList } from './jsonform/elements/JsonErrorList';

customElements.define(JsonFormElement.TAG_NAME, JsonFormElement);
customElements.define(JsonStringElement.TAG_NAME, JsonStringElement);
customElements.define(JsonNumberElement.TAG_NAME, JsonNumberElement);
customElements.define(JsonBooleanElement.TAG_NAME, JsonBooleanElement);
customElements.define(JsonArrayElement.TAG_NAME, JsonArrayElement);
customElements.define(JsonObjectElement.TAG_NAME, JsonObjectElement);
customElements.define(JsonNullElement.TAG_NAME, JsonNullElement);
customElements.define(JsonErrorList.TAG_NAME, JsonErrorList);

const sampleSchemaSelect = document.getElementById(
  'sampleSchemaSelect',
) as HTMLSelectElement;

samples
  .map((s) => {
    const e = document.createElement('option');
    e.value = s[1];
    e.innerHTML = s[0];
    // e.selected = e.value.indexOf('BeanContaining') !== -1;
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

// sampleSchemaSelect.value = 'BeanContainingOtherBean';

// const value = 'yalla';

const value = {
  //  customer: 123,
  customer: {
    age: 'not a string',
    firstName: 'Remi',
  },
};

jsonForm.schema = {};

valueFromAny(value).match(
  (v) => jsonForm.render(v),
  (err) => {
    throw err;
  },
);

// jsonForm.value = toJsonNode('turbo');
