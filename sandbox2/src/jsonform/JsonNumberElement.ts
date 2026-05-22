import {
  isValidNumberLiteral,
  JsPath,
  JvNumber,
  jvNumber,
  Metadata,
} from '@diesel-parser/json-form';
import { JsonElement } from './JsonElement';
import { findEnclosingForm } from './findEnclosingForm';
import { CDSTextInput } from '@carbon/web-components';
import { setErrors } from './setErrorsOnInput';
import '@carbon/web-components/es/components/text-input/index';
import { Debouncer } from './Debouncer';

export class JsonNumberElement extends JsonElement<JvNumber> {
  static TAG_NAME = 'json-number';

  private input: CDSTextInput;
  private readonly debouncer = new Debouncer();

  constructor() {
    super();
    this.input = document.createElement('cds-text-input') as CDSTextInput;
    this.appendChild(this.input);
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
          setErrors(
            [{ path: path.format(), message: 'Invalid number' }],
            true,
            this.input,
          );
        });
      }
      this.debouncer.debounce(() => {
        findEnclosingForm(this).onChange();
      });
    });
  }

  protected doSetMetadata(metadata: Metadata, path: JsPath): void {
    const p = path.format();
    const errors = metadata.errors.get(p);
    setErrors(errors, true, this.input);
  }
}
