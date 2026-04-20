import { JvNumber, jvNumber } from '@diesel-parser/json-form';
import { input } from './HtmlBuilder';
import { JsonElement } from './JsonElement';

export class JsonNumberElement extends JsonElement<JvNumber> {
  static TAG_NAME = 'json-number';

  private input: HTMLInputElement;

  constructor() {
    super();
    this.input = input({
      type: 'text',
    });
  }

  toValue(): JvNumber {
    return jvNumber(this.input.value);
  }

  fromValue(value: JvNumber) {
    this.input.value = value.value;
  }

  connectedCallback() {
    this.appendChild(this.input);
  }
}
