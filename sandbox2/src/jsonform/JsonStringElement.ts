import { JvString, jvString } from '@diesel-parser/json-form';
import { JsonElement } from './JsonElement';
import { findEnclosingForm } from './findEnclosingForm';
import { CDSTextInput } from '@carbon/web-components';
import '@carbon/web-components/es/components/text-input/index';

export class JsonStringElement extends JsonElement<JvString> {
  static TAG_NAME = 'json-string';

  private input: CDSTextInput;

  constructor() {
    super();
    this.input = document.createElement('cds-text-input') as CDSTextInput;
  }

  fromValue(value: JvString) {
    this.input.value = value.value;
    this.input.addEventListener('input', () => {
      findEnclosingForm(this).onChange();
    });
  }

  toValue(): JvString {
    return jvString(this.input.value);
  }

  connectedCallback() {
    this.appendChild(this.input);
  }
}
