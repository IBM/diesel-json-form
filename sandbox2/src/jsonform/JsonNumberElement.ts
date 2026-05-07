import {
  isValidNumberLiteral,
  JvNumber,
  jvNumber,
} from '@diesel-parser/json-form';
import { JsonElement } from './JsonElement';
import { findEnclosingForm } from './findEnclosingForm';
import { CDSTextInput } from '@carbon/web-components';

export class JsonNumberElement extends JsonElement<JvNumber> {
  static TAG_NAME = 'json-number';

  private input: CDSTextInput;

  constructor() {
    super();
    this.input = document.createElement('cds-text-input') as CDSTextInput;
  }

  toValue(): JvNumber {
    return jvNumber(this.input.value);
  }

  fromValue(value: JvNumber) {
    this.input.value = value.value;
    this.input.addEventListener('input', () => {
      if (!isValidNumberLiteral(this.input.value)) {
        const path = findEnclosingForm(this).getPath(this);
        path.forEach((path) => {
          this.updateErrorNode([
            { path: path.format(), message: 'Invalid number' },
          ]);
        });
      }
      findEnclosingForm(this).onChange();
    });
  }

  connectedCallback() {
    this.appendChild(this.input);
  }
}
