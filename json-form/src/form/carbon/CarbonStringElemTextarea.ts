import { CDSTextarea } from '@carbon/web-components/es';
import { Debouncer } from '../Debouncer.js';
import { setErrors } from './setErrorsOnInput.js';
import { StringElement } from '../StringElement.js';
import '@carbon/web-components/es/components/textarea/index.js';
import { JsonForm } from '../JsonForm.js';
import { nextElementId } from './nextElementId.js';
import { T_FUNCTION } from '../../JsonFormMessages.js';
import { JvString } from '../../JsonValue.js';
import { Metadata } from '../../Metadata.js';
import { JsPath } from '../../JsPath.js';
import { SchemaRenderer } from '../../SchemaService.js';
import { setRendererAttributes } from './setRendererAttributes.js';

export class CarbonStringElemTextarea extends StringElement {
  static TAG_NAME = 'string-elem-textarea';

  private input: CDSTextarea;
  private readonly debouncer = new Debouncer();

  static newInstance(schemaRenderer: SchemaRenderer): CarbonStringElemTextarea {
    const e = document.createElement(
      CarbonStringElemTextarea.TAG_NAME,
    ) as CarbonStringElemTextarea;
    setRendererAttributes(schemaRenderer, e.input);
    return e;
  }

  constructor() {
    super();
    this.input = document.createElement('cds-textarea') as CDSTextarea;
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
