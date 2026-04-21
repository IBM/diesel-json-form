import { JvBoolean, jvBool } from '@diesel-parser/json-form';
import { input } from './HtmlBuilder';
import { JsonElement } from './JsonElement';
import { findEnclosingForm } from './findEnclosingForm';

export class JsonBooleanElement extends JsonElement<JvBoolean> {
  static TAG_NAME = 'json-boolean';

  private input: HTMLInputElement;

  constructor() {
    super();
    this.input = input({
      type: 'checkbox',
    });
  }

  toValue(): JvBoolean {
    return jvBool(this.input.checked);
  }

  fromValue(value: JvBoolean) {
    this.input.checked = value.value;
    this.input.addEventListener('input', () => {
      findEnclosingForm(this).onChange();
    });
  }

  connectedCallback() {
    this.appendChild(this.input);
  }
}
