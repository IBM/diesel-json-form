import { CDSTextArea } from '@carbon/web-components';
import { Debouncer } from '../Debouncer';
import { setErrors } from './setErrorsOnInput';
import { StringElement } from '../StringElement';
import '@carbon/web-components/es/components/textarea/index';
import { JsonForm } from '../JsonForm';
import { nextElementId } from './nextElementId';
import { T_FUNCTION } from '../../JsonFormMessages';
import { getValueAt, JvString } from '../../JsonValue';
import { Metadata } from '../../Metadata';
import { JsPath } from '../../JsPath';
import { SchemaRenderer } from '../../SchemaService';

export class CarbonStringElemTextarea extends StringElement {
  static TAG_NAME = 'string-elem-textarea';

  private input: CDSTextArea;
  private readonly debouncer = new Debouncer();

  static newInstance(schemaRenderer: SchemaRenderer): CarbonStringElemTextarea {
    const e = document.createElement(
      CarbonStringElemTextarea.TAG_NAME,
    ) as CarbonStringElemTextarea;
    getValueAt(
      schemaRenderer.schemaValue,
      JsPath.parse('renderer/rows'),
    ).forEach((rows) => {
      if (rows.tag === 'jv-number') {
        const r = parseInt(rows.value);
        if (!isNaN(r)) {
          e.rows = r;
        }
      }
    });
    return e;
  }

  set rows(rows: number) {
    this.input.setAttribute('rows', rows + '');
  }

  constructor() {
    super();
    this.input = document.createElement('cds-textarea') as CDSTextArea;
    this.input.id = nextElementId();
    this.input.setAttribute(
      'placeholder',
      T_FUNCTION('stringValuePlaceholder'),
    );
  }

  connectedCallback() {
    this.appendChild(this.input);
  }

  disconnectedCallback() {
    this.input.remove();
  }

  initialize(value: JvString, metadata: Metadata, path: JsPath): void {
    this.input.value = value.value;
    this.setMetadata(metadata, path);
    this.input.addEventListener('input', () => {
      this.debouncer.debounce(() => JsonForm.getEnclosingForm(this).onChange());
    });
  }

  getStrValue(): string {
    return this.input.value;
  }

  setMetadata(metadata: Metadata, path: JsPath): void {
    const errors = metadata.errors.get(path.format());
    setErrors(errors, true, this.input);
  }
}

customElements.define(
  CarbonStringElemTextarea.TAG_NAME,
  CarbonStringElemTextarea,
);
