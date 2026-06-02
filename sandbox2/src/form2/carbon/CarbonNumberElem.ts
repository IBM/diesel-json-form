import {
  isValidNumberLiteral,
  JsPath,
  Metadata,
} from '@diesel-parser/json-form';
import { CDSTextInput } from '@carbon/web-components';
import '@carbon/web-components/es/components/text-input/index';
import { NumberElement } from '../NumberElement';
import { Debouncer } from '../../jsonform/Debouncer';
import { setErrors } from '../../jsonform/setErrorsOnInput';
import { T_FUNCTION } from '../../jsonform/JsonFormMessages';

export class CarbonNumberElement extends NumberElement {
  static TAG_NAME = 'json-number';

  private input: CDSTextInput;
  private readonly debouncer = new Debouncer();

  constructor() {
    super();
    this.input = document.createElement('cds-text-input') as CDSTextInput;
  }

  connectedCallback() {
    this.appendChild(this.input);
  }

  disconnectedCallback() {
    this.input.remove();
  }

  initialize(
    value: string,
    metadata: Metadata,
    path: JsPath,
    onChange: () => void,
  ): void {
    this.input.value = value;
    this.input.addEventListener('input', () => {
      if (!isValidNumberLiteral(this.input.value)) {
        // const path = this.getPath();
        setErrors(
          [{ path: path.format(), message: T_FUNCTION('invalid.number') }],
          true,
          this.input,
        );
      }
      this.debouncer.debounce(() => {
        onChange();
      });
    });
    this.setMetadata(metadata, path);
  }

  setMetadata(metadata: Metadata, path: JsPath): void {
    const p = path.format();
    const errors = metadata.errors.get(p);
    setErrors(errors, true, this.input);
  }

  getNumValue(): string {
    return this.input.value;
  }
}

customElements.define(CarbonNumberElement.TAG_NAME, CarbonNumberElement);
