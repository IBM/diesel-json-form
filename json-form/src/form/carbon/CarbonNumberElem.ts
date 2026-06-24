import { CDSTextInput } from '@carbon/web-components/es';
import '@carbon/web-components/es/components/text-input/index.js';
import { NumberElement } from '../NumberElement.js';
import { Debouncer } from '../Debouncer.js';
import { setErrors } from './setErrorsOnInput.js';
import { nextElementId } from './nextElementId.js';
import { T_FUNCTION } from '../../JsonFormMessages.js';
import { isValidNumberLiteral, JvNumber } from '../../JsonValue.js';
import { Metadata } from '../../Metadata.js';
import { JsPath } from '../../JsPath.js';
import { setRendererAttributes } from './setRendererAttributes.js';
import { SchemaRenderer } from '../../SchemaService.js';

export class CarbonNumberElement extends NumberElement {
  static TAG_NAME = 'json-number';

  private input: CDSTextInput;
  private readonly debouncer = new Debouncer();

  static newInstance(schemaRenderer: SchemaRenderer): CarbonNumberElement {
    const e = document.createElement(
      CarbonNumberElement.TAG_NAME,
    ) as CarbonNumberElement;
    setRendererAttributes(schemaRenderer, e.input);
    return e;
  }

  constructor() {
    super();
    this.input = document.createElement('cds-text-input') as CDSTextInput;
    this.input.id = nextElementId();
  }

  connectedCallback() {
    this.appendChild(this.input);
  }

  disconnectedCallback() {
    this.input.remove();
  }

  initialize(value: JvNumber, metadata: Metadata, path: JsPath): void {
    this.input.value = value.value;
    this.input.addEventListener('input', () => {
      if (!isValidNumberLiteral(this.input.value)) {
        if (this.path) {
          setErrors(
            [
              {
                path: this.path.format(),
                message: T_FUNCTION('invalid.number'),
              },
            ],
            true,
            this.input,
          );
        }
      }
      this.debouncer.debounce(() => {
        this.parentForm.onChange();
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
