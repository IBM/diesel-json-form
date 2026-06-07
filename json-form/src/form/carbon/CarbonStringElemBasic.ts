import { CDSTextInput } from '@carbon/web-components';
import { Debouncer } from '../Debouncer';
import { setErrors } from './setErrorsOnInput';
import { StringElement } from '../StringElement';
import '@carbon/web-components/es/components/text-input/index';
import { JsonForm } from '../JsonForm';
import { nextElementId } from './nextElementId';
import { T_FUNCTION } from '../../JsonFormMessages';
import { JvString } from '../../JsonValue';
import { Metadata } from '../../Metadata';
import { JsPath } from '../../JsPath';

export class CarbonStringElemBasic extends StringElement {
  static TAG_NAME = 'string-elem-basic';

  private input: CDSTextInput;
  private readonly debouncer = new Debouncer();

  constructor() {
    super();
    this.input = document.createElement('cds-text-input') as CDSTextInput;
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

customElements.define(CarbonStringElemBasic.TAG_NAME, CarbonStringElemBasic);
