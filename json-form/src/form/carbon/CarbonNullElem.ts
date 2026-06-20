import '@carbon/web-components/es/components/text-input/index.js';
import { CDSTextInput } from '@carbon/web-components/es';
import { setErrors } from './setErrorsOnInput.js';
import { NullElement } from '../NullElement.js';
import { JvNull } from '../../JsonValue.js';
import { Metadata } from '../../Metadata.js';
import { JsPath } from '../../JsPath.js';
import { setRendererAttributes } from './setRendererAttributes.js';
import { SchemaRenderer } from '../../SchemaService.js';

export class CarbonNullElement extends NullElement {
  static TAG_NAME = 'json-null';

  private input: CDSTextInput;

  static newInstance(schemaRenderer: SchemaRenderer): CarbonNullElement {
    const e = document.createElement(
      CarbonNullElement.TAG_NAME,
    ) as CarbonNullElement;
    setRendererAttributes(schemaRenderer, e.input);
    return e;
  }

  constructor() {
    super();
    this.input = document.createElement('cds-text-input') as CDSTextInput;
    this.input.value = 'null';
    this.input.disabled = true;
  }

  connectedCallback() {
    this.appendChild(this.input);
  }

  disconnectedCallback() {
    this.input.remove();
  }

  initialize(value: JvNull, metadata: Metadata, path: JsPath): void {
    this.setMetadata(metadata, path);
  }
  //   initialize(metadata: Metadata, path: JsPath): void {
  //   }

  setMetadata(metadata: Metadata, path: JsPath): void {
    const p = path.format();
    const errors = metadata.errors.get(p);
    setErrors(errors, true, this.input);
  }
}

customElements.define(CarbonNullElement.TAG_NAME, CarbonNullElement);
