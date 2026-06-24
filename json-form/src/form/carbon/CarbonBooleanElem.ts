import { CDSCheckbox } from '@carbon/web-components/es';
import '@carbon/web-components/es/components/checkbox/checkbox.js';
import { BooleanElement } from '../BooleanElement.js';
import { nextElementId } from './nextElementId.js';
import { Metadata } from '../../Metadata.js';
import { JsPath } from '../../JsPath.js';
import { JvBoolean } from '../../JsonValue.js';
import { setErrors } from './setErrorsOnInput.js';
import { SchemaRenderer } from '../../SchemaService.js';
import { setRendererAttributes } from './setRendererAttributes.js';

export class CarbonBooleanElement extends BooleanElement {
  static TAG_NAME = 'json-boolean';

  private input: CDSCheckbox;

  static newInstance(schemaRenderer: SchemaRenderer): CarbonBooleanElement {
    const e = document.createElement(
      CarbonBooleanElement.TAG_NAME,
    ) as CarbonBooleanElement;
    setRendererAttributes(schemaRenderer, e.input);
    return e;
  }

  constructor() {
    super();
    this.input = document.createElement('cds-checkbox') as CDSCheckbox;
    this.input.id = nextElementId();
  }

  connectedCallback() {
    this.appendChild(this.input);
  }

  disconnectCallback() {
    this.input.remove();
  }

  protected doSetMetadata(metadata: Metadata, path: JsPath): void {
    const p = path.format();
    const errors = metadata.errors.get(p);
    setErrors(errors, true, this.input);
  }

  initialize(value: JvBoolean, metadata: Metadata, path: JsPath): void {
    this.input.checked = value.value;
    this.setMetadata(metadata, path);
    this.input.addEventListener('input', () => {
      this.parentForm.onChange();
    });
  }

  getBooleanValue(): boolean {
    return this.input.checked;
  }

  setMetadata(metadata: Metadata, path: JsPath): void {
    const p = path.format();
    const errors = metadata.errors.get(p);
    setErrors(errors, true, this.input);
  }
}

customElements.define(CarbonBooleanElement.TAG_NAME, CarbonBooleanElement);
