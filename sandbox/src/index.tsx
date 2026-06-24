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
  empty,
  JsonForm,
  NumberElement,
  StringElement,
  CarbonTableArrayRenderer,
  Renderer,
  CarbonGridObjectRenderer,
  carbonRenderer,
  IconElement,
} from '@diesel-parser/json-form';

import '@carbon/web-components/es/index.js';

import { CDSCheckbox, CDSComboBox } from '@carbon/web-components/es';
import { h } from './MyJSXFactory';
import { version } from '@diesel-parser/json-form/package.json';
import { TypedJsonSchemaService } from './TypedJsonSchemaService';

const about = document.getElementById('about');
if (about) {
  about.innerText = version;
}

const jsonForm = document.getElementById('json-form') as JsonForm;
const cbStrictMode = document.getElementById('cb-strict-mode') as CDSCheckbox;
cbStrictMode.checked = jsonForm.strictMode;
cbStrictMode.addEventListener('cds-checkbox-changed', () => {
  jsonForm.strictMode = cbStrictMode.checked;
});

const cbHideHeader = document.getElementById('cb-hide-header') as CDSCheckbox;
cbHideHeader.checked = jsonForm.hideHeader;
cbHideHeader.addEventListener('cds-checkbox-changed', () => {
  jsonForm.hideHeader = cbHideHeader.checked;
});

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

jsonForm.addEventListener('json-changed', (e) => {
  console.log('json changed', e.detail);
});

taSchema.addEventListener('input', () => {
  try {
    JSON.parse(taSchema.value);
    btnFromSchema.disabled = false;
  } catch (err) {
    btnFromSchema.disabled = true;
  }
});

taJson.addEventListener('input', () => {
  try {
    JSON.parse(taJson.value);
    btnToForm.disabled = false;
  } catch (err) {
    btnToForm.disabled = true;
  }
});

const btnToForm = document.getElementById('btn-to-form') as HTMLButtonElement;
const btnFromForm = document.getElementById(
  'btn-from-form',
) as HTMLButtonElement;
const btnFromSchema = document.getElementById(
  'btn-from-schema',
) as HTMLButtonElement;

function toFormClicked() {
  const value = parseJsonValueUnsafe(taJson.value);
  const schema = parseJsonValueUnsafe(taSchema.value);
  jsonForm.initialize(renderer, jsonForm.schemaService, schema, value);
}

btnToForm.addEventListener('click', toFormClicked);
btnFromSchema.addEventListener('click', toFormClicked);

btnFromForm.addEventListener('click', () => {
  const value = jsonForm.toValue();
  const valueStr = stringify(value, '  ').withDefault(
    'Broken JSON from form (invalid numbers)',
  );
  taJson.value = valueStr;
});

class StarElement extends HTMLElement {
  static TAG_NAME = 'star-element';

  private _checked: boolean = false;
  private _onClick?: () => void;

  constructor() {
    super();
  }

  set checked(checked: boolean) {
    empty(this);
    this._checked = checked;
    const icon = IconElement.newInstance(checked ? 'star--filled32' : 'star32');
    this.appendChild(icon);
    icon.addEventListener('click', () => {
      this._onClick?.();
    });
  }

  get checked(): boolean {
    return this._checked;
  }

  set onClick(f: () => void) {
    this._onClick = f;
  }
}

customElements.define(StarElement.TAG_NAME, StarElement);

class RatingRenderer extends NumberElement {
  static TAG_NAME = 'my-rating-renderer';

  private readonly stars: readonly StarElement[] = [
    new StarElement(),
    new StarElement(),
    new StarElement(),
    new StarElement(),
    new StarElement(),
  ];

  constructor() {
    super();
  }

  connectedCallback() {
    this.stars.forEach((s) => {
      this.appendChild(s);
      s.onClick = () => {
        const i = this.stars.indexOf(s) + 1;
        this.setValue(i);
      };
    });
  }

  disconnectedCallback() {
    empty(this);
  }

  getNumValue(): string {
    return '' + this.stars.filter((s) => s.checked).length;
  }

  private setValue(v: number) {
    for (let i = 0; i < this.stars.length; i++) {
      this.stars[i].checked = i < v;
    }
    this.setAttribute('rating', v + '');
  }

  initialize(value: JvNumber): void {
    let intVal = parseInt(value.value);
    if (isNaN(intVal)) {
      intVal = 0;
    }
    this.setValue(intVal);
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
carbonRenderer(renderer);

renderer.addCustomRenderer('RatingRenderer', () => {
  return new RatingRenderer();
});

renderer.addCustomRenderer('MyStringRenderer', MyStringRenderer.newInstance);

renderer.addCustomRenderer('ArrayTable', CarbonTableArrayRenderer.newInstance);

renderer.addCustomRenderer('GridObject', CarbonGridObjectRenderer.newInstance);

jsonForm.initialize(renderer, defaultSchemaService, schema, value);

sampleSchemaSelect.addEventListener('cds-dropdown-selected', () => {
  taSchema.value = sampleSchemaSelect.value;
  const value = jsonForm.toValue();
  parseJsonValue(taSchema.value).match(
    (schema) =>
      jsonForm.initialize(renderer, jsonForm.schemaService, schema, value),
    (err) => console.error(err),
  );
});

const schemaSelect = document.getElementById('serviceSelect') as CDSComboBox;
schemaSelect.addEventListener('cds-dropdown-selected', () => {
  const value = schemaSelect.value;
  switch (value) {
    case 'typed-json': {
      //   console.log('wasm', wasmUrl);
      TypedJsonSchemaService.load('typedJson.wasm').then((s) => {
        jsonForm.schemaService = s;
      });
      break;
    }
    default: {
      jsonForm.schemaService = defaultSchemaService;
      break;
    }
  }
});
