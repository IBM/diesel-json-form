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

// @ts-ignore
import './style.scss';
import { samples } from './initdata';
import {
  defaultSchemaService,
  getValueAt,
  JsPath,
  JvNumber,
  JvString,
  parseJsonValue,
  parseJsonValueUnsafe,
  SchemaRenderer,
  stringify,
} from '@diesel-parser/json-form';
import '@carbon/web-components/es/components/dropdown/dropdown-item';
import '@carbon/web-components/es/components/button/button';
import '@carbon/web-components/es/components/radio-button/radio-button';
import '@carbon/web-components/es/components/radio-button/radio-button-group';

import { CDSComboBox, CDSRadioButton } from '@carbon/web-components';
import { JsonForm } from './form2/JsonForm';
import { Renderer } from './form2/Renderer';
import { h } from './jsonform/MyJSXFactory';
import { NumberElement } from './form2/NumberElement';
import { RADIO_BUTTON_ORIENTATION } from '@carbon/web-components/es/components/radio-button/radio-button-group';
import { StringElement } from './form2/StringElement';
import { empty } from './jsonform/HtmlBuilder';

const jsonForm = document.getElementById('json-form') as JsonForm;

console.log(JsonForm.TAG_NAME);

const sampleSchemaSelect = document.getElementById(
  'sampleSchemaSelect',
) as CDSComboBox;

samples
  .map((s) => {
    const e = document.createElement('cds-dropdown-item');
    e.setAttribute('value', s[1]);
    e.innerHTML = s[0];
    return e;
  })
  .forEach((e) => sampleSchemaSelect.appendChild(e));

const initialSchema = `{}`;

const schema = parseJsonValueUnsafe(initialSchema);

const initialValue = `{}`;
const value = parseJsonValueUnsafe(initialValue);

const taSchema = document.getElementById('ta-schema') as HTMLTextAreaElement;
taSchema.value = initialSchema;
const taJson = document.getElementById('ta-json') as HTMLTextAreaElement;
taJson.value = initialValue;

const btnFromForm = document.getElementById(
  'btn-from-form',
) as HTMLButtonElement;

taJson.addEventListener('input', () => {
  try {
    JSON.parse(taJson.value);
    btnToForm.disabled = false;
  } catch (err) {
    btnToForm.disabled = true;
  }
});

btnFromForm.addEventListener('click', () => {
  const value = jsonForm.toValue();
  const valueStr = stringify(value, '  ').withDefault(
    'Broken JSON from form (invalid numbers)',
  );
  taJson.value = valueStr;
});

const btnToForm = document.getElementById('btn-to-form') as HTMLButtonElement;

btnToForm.addEventListener('click', () => {
  const value = parseJsonValueUnsafe(taJson.value);
  const schema = parseJsonValueUnsafe(taSchema.value);
  jsonForm.initialize(renderer, defaultSchemaService, schema, value);
});

class RatingRenderer extends NumberElement {
  static TAG_NAME = 'my-rating-renderer';

  private static COUNTER = 0;

  private radio: CDSRadioButton = RatingRenderer.createRadio();
  private value?: string;

  private static createRadio(): CDSRadioButton {
    RatingRenderer.COUNTER++;
    const name = 'json-rating-radio-' + RatingRenderer.COUNTER;
    return (
      <cds-radio-button-group
        orientation={RADIO_BUTTON_ORIENTATION.HORIZONTAL}
        name={name}
      >
        <cds-radio-button value={'0'} label-text={'1'}></cds-radio-button>
        <cds-radio-button value={'1'} label-text={'2'}></cds-radio-button>
        <cds-radio-button value={'2'} label-text={'3'}></cds-radio-button>
        <cds-radio-button value={'3'} label-text={'4'}></cds-radio-button>
        <cds-radio-button value={'4'} label-text={'5'}></cds-radio-button>
      </cds-radio-button-group>
    );
  }

  constructor() {
    super();
  }

  connectedCallback() {
    this.appendChild(this.radio);
  }

  disconnectedCallback() {
    this.radio.remove();
  }

  getNumValue(): string {
    return this.value ?? this.radio.value;
  }

  initialize(value: JvNumber): void {
    this.value = value.value;
    this.radio.value = value.value;
    this.radio.addEventListener('cds-radio-button-changed', () => {
      const newValue = this.radio.value;
      if (newValue !== this.value) {
        this.value = newValue;
        this.parentForm.onChange();
      }
    });
  }

  setMetadata(): void {
    console.log('TODO errors rating renderer');
  }
}

customElements.define(RatingRenderer.TAG_NAME, RatingRenderer);

class MyStringRenderer extends StringElement {
  static TAG_NAME = 'my-string-renderer';

  private value: string = '';
  private label: HTMLDivElement = (<div className="my-value"></div>);
  private myConfigProp?: string;

  constructor() {
    super();
  }

  static newInstance(schemaRenderer: SchemaRenderer): MyStringRenderer {
    const r = document.createElement(
      MyStringRenderer.TAG_NAME,
    ) as MyStringRenderer;
    const p = getValueAt(
      schemaRenderer.schemaValue,
      JsPath.parse('renderer/myConfigProp'),
    );
    p.forEach((v) => {
      if (v.tag === 'jv-number') {
        r.myConfigProp = v.value;
      }
    });
    return r;
  }

  getStrValue(): string {
    return this.value;
  }

  private buttonClicked() {
    this.value = this.value + 'X';
    this.label.innerText = this.value;
    this.parentForm.onChange();
  }

  connectedCallback() {
    this.appendChild(
      <div className={'my-string'}>
        {this.label}
        <button onclick={this.buttonClicked.bind(this)}>Concat !</button>
        <p>
          Config prop{' '}
          {this.myConfigProp !== undefined
            ? 'set to ' + this.myConfigProp
            : 'is undefined'}
        </p>
      </div>,
    );
  }

  disconnectedCallback() {
    empty(this);
  }

  initialize(value: JvString): void {
    this.value = value.value;
    this.label.innerText = value.value;
  }

  setMetadata(): void {
    console.log('meta not needed for this');
  }
}

customElements.define(MyStringRenderer.TAG_NAME, MyStringRenderer);

const renderer: Renderer = new Renderer();

renderer.addCustomRenderer('RatingRenderer', () => {
  return new RatingRenderer();
});

renderer.addCustomRenderer('MyStringRenderer', MyStringRenderer.newInstance);

jsonForm.initialize(renderer, defaultSchemaService, schema, value);
// jsonForm.addChangeListener((value) => {
//   btnFromForm.disabled = !stringify(value)
//     .map(() => true)
//     .withDefault(false);
// });

sampleSchemaSelect.addEventListener('cds-dropdown-selected', () => {
  taSchema.value = sampleSchemaSelect.value;
  const value = jsonForm.toValue();
  parseJsonValue(taSchema.value).match(
    (schema) =>
      jsonForm.initialize(renderer, defaultSchemaService, schema, value),
    (err) => console.error(err),
  );
});
