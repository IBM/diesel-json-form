import { JsPath, JvNumber, jvNumber } from '@diesel-parser/json-form';
import { input } from '../HtmlBuilder';
import { JsonValueElementBase } from '../JsonValueElement';
import { RenderConfig } from '../RendererConfig';

export class JsonNumberElement extends JsonValueElementBase<JvNumber> {
  static TAG_NAME = 'json-number';

  static newInstance(): JsonNumberElement {
    const e = document.createElement(
      JsonNumberElement.TAG_NAME,
    ) as JsonNumberElement;
    return e;
  }

  private _input: HTMLInputElement;

  constructor() {
    super();
    this._input = input({
      type: 'string',
    }) as HTMLInputElement;
  }

  protected doRender(config: RenderConfig, path: JsPath, value: JvNumber) {
    this._input.value = value.value;
    this._input.addEventListener('input', () => {
      const newValue = jvNumber(this._input.value);
      this.fireValueChanged(newValue);
    });
    this.appendChild(this._input);
  }

  protected doReRender(
    config: RenderConfig,
    path: JsPath,
    value: JvNumber,
  ): void {
    this._input.value = value.value;
  }

  getValue(): JvNumber {
    return jvNumber(this._input.value);
  }
}
