import { JvString, jvString } from '@diesel-parser/json-form';
import { input } from './HtmlBuilder';
import { JsonElement } from './JsonElement';

export class JsonStringElement extends JsonElement<JvString> {
  static TAG_NAME = 'json-string';

  private input: HTMLInputElement;

  constructor() {
    super();
    this.input = input({
      type: 'text',
    });
  }

  fromValue(value: JvString, onChange: () => void) {
    this.input.value = value.value;
    this.input.addEventListener('input', () => {
      onChange();
    });
  }

  toValue(): JvString {
    return jvString(this.input.value);
  }

  connectedCallback() {
    this.appendChild(this.input);
  }
}
