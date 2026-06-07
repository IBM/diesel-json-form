import { JsPath, JvNull, jvNull, Metadata } from '@diesel-parser/json-form';
import { JsonElement } from './JsonElement';
import '@carbon/web-components/es/components/text-input/index';
import { CDSTextInput } from '@carbon/web-components';
import { setErrors } from './setErrorsOnInput';

export class JsonNullElement extends JsonElement<JvNull> {
  static TAG_NAME = 'json-null';

  private input: CDSTextInput;

  constructor() {
    super();
    this.input = document.createElement('cds-text-input') as CDSTextInput;
    this.input.value = 'null';
    this.input.disabled = true;
    this.appendChild(this.input);
  }

  toValue(): JvNull {
    return jvNull;
  }

  fromValue() {
    // no-op
  }

  protected doSetMetadata(metadata: Metadata, path: JsPath): void {
    const p = path.format();
    const errors = metadata.errors.get(p);
    setErrors(errors, true, this.input);
  }
}
