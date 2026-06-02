import { CDSTextInput } from '@carbon/web-components';
import { Debouncer } from '../../jsonform/Debouncer';
import { T_FUNCTION } from '../../jsonform/JsonFormMessages';
import { JsPath, Metadata } from '@diesel-parser/json-form';
import { setErrors } from '../../jsonform/setErrorsOnInput';
import { StringElement } from '../StringElement';

import '@carbon/web-components/es/components/text-input/index';

export class CarbonStringElemBasic extends StringElement {
  static TAG_NAME = 'string-elem-basic';

  private input: CDSTextInput;
  private readonly debouncer = new Debouncer();

  constructor() {
    super();
    this.input = document.createElement('cds-text-input') as CDSTextInput;
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

  initialize(value: string, metadata: Metadata, path: JsPath) {
    this.input.value = value;
    this.setMetadata(metadata, path);
    this.input.addEventListener('input', () => {
      this.debouncer.debounce(() => this.onChange());
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

customElements.define(CarbonStringElemBasic.TAG_NAME, CarbonStringElemBasic);
