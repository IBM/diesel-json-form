import { JsPath, JvBoolean, Metadata } from '@diesel-parser/json-form';
import { CDSCheckbox } from '@carbon/web-components';
import '@carbon/web-components/es/components/checkbox/checkbox';
import { BooleanElement } from '../BooleanElement';
import { setErrors } from '../../jsonform/setErrorsOnInput';
import { JsonForm } from '../JsonForm';
import { nextElementId } from './nextElementId';

export class CarbonBooleanElement extends BooleanElement {
  static TAG_NAME = 'json-boolean';

  private input: CDSCheckbox;

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
      JsonForm.getEnclosingForm(this).onChange();
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
