import { JsPath, Metadata } from '@diesel-parser/json-form';
import '@carbon/web-components/es/components/text-input/index';
import { CDSTextInput } from '@carbon/web-components';
import { setErrors } from '../../jsonform/setErrorsOnInput';
import { NullElement } from '../NullElement';

export class CarbonNullElement extends NullElement {
  static TAG_NAME = 'json-null';

  private input: CDSTextInput;

  constructor() {
    super();
    this.input = document.createElement('cds-text-input') as CDSTextInput;
    this.input.value = 'null';
    this.input.disabled = true;
    this.appendChild(this.input);
  }

  setMetadata(metadata: Metadata, path: JsPath): void {
    const p = path.format();
    const errors = metadata.errors.get(p);
    setErrors(errors, true, this.input);
  }
}

customElements.define(CarbonNullElement.TAG_NAME, CarbonNullElement);
