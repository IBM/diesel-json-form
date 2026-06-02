import { JsPath, Metadata } from '@diesel-parser/json-form';
import { CDSCheckbox } from '@carbon/web-components';
import '@carbon/web-components/es/components/checkbox/checkbox';
import { BooleanElement } from '../BooleanElement';
import { setErrors } from '../../jsonform/setErrorsOnInput';

export class CarbonBooleanElement extends BooleanElement {
  static TAG_NAME = 'json-boolean';

  private input: CDSCheckbox;

  constructor() {
    super();
    this.input = document.createElement('cds-checkbox') as CDSCheckbox;
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

  initialize(
    value: boolean,
    metadata: Metadata,
    path: JsPath,
    onChange: () => void,
  ): void {
    this.input.checked = value;
    this.setMetadata(metadata, path);
    this.input.addEventListener('input', onChange);
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
